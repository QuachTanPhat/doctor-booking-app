import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'

const changeAvailability = async (req, res) => {
    try {

        const { docId } = req.body
        const io = req.app.get('socketio');
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        if (req.io) {
            req.io.emit('update-availability', { docId });
        }
        res.json({ success: true, message: 'Availability Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])

        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({ success: false, message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })
        if(req.io) {
                req.io.emit('update-appointments');
            }
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId == docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            if(req.io) {
                req.io.emit('update-appointments');
            }
            return res.json({ success: true, message: 'Appointment Completed' })
        }
        else {
            return res.json({ success: false, message: 'Mark Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to canceled appointment completed for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId == docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

            const { slotDate, slotTime } = appointmentData
            const doctorData = await doctorModel.findById(docId)
            let slots_booked = doctorData.slots_booked

            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
            }
            await doctorModel.findByIdAndUpdate(docId, { slots_booked })
            if(req.io) {
                req.io.emit('update-appointments');
            }
            return res.json({ success: true, message: 'Appointment Cancelled' })
        }
        else {
            return res.json({ success: false, message: 'Cancellation Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const appointmentApprove = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            // Cập nhật isApproved thành true
            await appointmentModel.findByIdAndUpdate(appointmentId, { isApproved: true })
            if(req.io) {
                req.io.emit('update-appointments');
            }
            return res.json({ success: true, message: 'Appointment Approved' })
        } else {
            return res.json({ success: false, message: 'Approval Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to get doctorDashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        let earnings = 0
        let patients = []

        // 1. Xử lý thống kê cơ bản
        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        // 2. Xử lý dữ liệu biểu đồ (Graph Data) - Giống bên Admin
        const dailyStats = {};
        
        // Sắp xếp lịch hẹn theo ngày
        const sortedAppointments = appointments.sort((a, b) => {
             const dateA = a.slotDate.split('_').reverse().join('');
             const dateB = b.slotDate.split('_').reverse().join('');
             return dateA.localeCompare(dateB);
        });

        sortedAppointments.forEach(appt => {
            // Chỉ đếm các lịch chưa hủy
            if (!appt.cancelled) {
                const dateParts = appt.slotDate.split('_');
                const shortDate = `${dateParts[0]}/${dateParts[1]}`; // DD/MM

                if (!dailyStats[shortDate]) {
                    dailyStats[shortDate] = { date: shortDate, count: 0 };
                }
                dailyStats[shortDate].count += 1;
            }
        });

        // Lấy dữ liệu của 14 ngày gần nhất có lịch
        const graphData = Object.values(dailyStats).slice(-14);

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5),
            graphData: graphData // <--- TRẢ VỀ DỮ LIỆU BIỂU ĐỒ
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to get doctor profile for Doctor panel
const doctorProfile = async (req, res) => {
    try {
        const { docId } = req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, available } = req.body
        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

        if(req.io) {
                req.io.emit('doctor-update');
            }
        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    changeAvailability,
    doctorList, loginDoctor,
    appointmentsDoctor, appointmentComplete,
    appointmentCancel, appointmentApprove,
    doctorDashboard, doctorProfile,
    updateDoctorProfile
}