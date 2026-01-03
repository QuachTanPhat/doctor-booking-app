import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import { v2 as cloudinary } from "cloudinary";
const changeAvailability = async (req, res) => {
    try {

        const { docId } = req.body
        const io = req.app.get('socketio');
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        if (req.io) {
            req.io.emit('update-availability', { docId });
        }
        res.json({ success: true, message: 'Trạng thái đã được thay đổi thành công' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({ isDeleted: { $ne: true } }).select(['-password', '-email'])

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
            return res.json({ success: false, message: 'Thông tin đăng nhập không chính xác' })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Thông tin đăng nhập không chính xác' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const doctorListSchedule = async (req, res) => {
    try {
        const { docId, slotDate, slotTimes } = req.body;

        const doctor = await doctorModel.findById(docId);
        
        let slots = [];
        const [day, month, year] = slotDate.split('_'); 

        // --- SỬA ĐOẠN NÀY ---
        slotTimes.forEach((time) => {
            // 1. Thêm dòng này để chặn lỗi Crash
            if (!time || typeof time !== 'string') return; 

            // 2. Logic cũ giữ nguyên
            const [hour, minute] = time.split(':');
            let date = new Date(year, month - 1, day, hour, minute);
            
            slots.push({
                datetime: date,
                time: time 
            });
        });
        // --------------------

        let slots_scheduled = doctor.slots_scheduled || {};

        if (slots.length > 0) {
            slots_scheduled[slotDate] = slots;
        } else {
            delete slots_scheduled[slotDate];
        }

        await doctorModel.findByIdAndUpdate(docId, { slots_scheduled });

        // Socket IO
        if (req.io) {
            req.io.emit('doctor-updated'); 
        } else if (global.io) {
            global.io.emit('doctor-updated');
        }

        res.json({ success: true, message: "Cập nhật lịch thành công" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body

        const appointments = await appointmentModel.find({
            docId,
            isDeleted: { $ne: true }
        })

        if (req.io) {
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
            if (req.io) {
                req.io.emit('update-appointments');
            }
            return res.json({ success: true, message: 'Đã hoàn thành lịch hẹn' })
        }
        else {
            return res.json({ success: false, message: 'Không thể hoàn thành lịch hẹn' })
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
            if (req.io) {
                req.io.emit('update-appointments');
            }
            return res.json({ success: true, message: 'Đã hủy lịch hẹn' })
        }
        else {
            return res.json({ success: false, message: 'Không thể hủy lịch hẹn' })
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
            if (req.io) {
                req.io.emit('update-appointments');
            }
            return res.json({ success: true, message: 'Đã phê duyệt lịch hẹn' })
        } else {
            return res.json({ success: false, message: 'Không thể phê duyệt lịch hẹn' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to get doctorDashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body;
        // Lấy tất cả lịch hẹn (để hiển thị tổng số lịch hẹn và danh sách book gần nhất)
        const appointments = await appointmentModel.find({ docId });

        let earnings = 0;
        let patients = [];
        
        const revenueMap = {}; 
        const graphMap = {};   

        appointments.forEach((item) => {
            // 1. Xử lý ngày tháng chuẩn
            let dateKey;
            if (item.date instanceof Date) {
                 const day = item.date.getDate();
                 const month = item.date.getMonth() + 1;
                 const year = item.date.getFullYear();
                 dateKey = `${day}/${month}/${year}`;
            } else {
                 const dateObj = new Date(item.date);
                 if (!isNaN(dateObj.getTime())) {
                     const day = dateObj.getDate();
                     const month = dateObj.getMonth() + 1;
                     const year = dateObj.getFullYear();
                     dateKey = `${day}/${month}/${year}`;
                 } else {
                     dateKey = 'Invalid Date'; 
                 }
            }

            // --- QUAN TRỌNG: CHỈ TÍNH VÀO BIỂU ĐỒ & THU NHẬP KHI ĐÃ HOÀN THÀNH ---
            if (item.isCompleted && dateKey !== 'Invalid Date') {
                
                // A. Cộng tổng thu nhập thực tế
                earnings += item.amount;

                // B. Tính cho Biểu đồ Doanh thu (RevenueData)
                if (revenueMap[dateKey]) {
                    revenueMap[dateKey] += item.amount;
                } else {
                    revenueMap[dateKey] = item.amount;
                }

                // C. Tính cho Biểu đồ Lượt khám (GraphData)
                if (graphMap[dateKey]) {
                    graphMap[dateKey] += 1;
                } else {
                    graphMap[dateKey] = 1;
                }
            }
            // -----------------------------------------------------------------------

            // Tính số lượng bệnh nhân (Có thể tính cả những người chưa khám xong nếu muốn, 
            // nhưng ở đây mình để logic là ai đặt lịch đều được coi là patient)
            if (!patients.includes(item.userId)) {
                patients.push(item.userId);
            }
        });

        // Hàm sắp xếp ngày tháng
        const sortDateFunc = (a, b) => {
            const [d1, m1, y1] = a.date.split('/').map(Number);
            const [d2, m2, y2] = b.date.split('/').map(Number);
            return y1 === y2 ? (m1 === m2 ? d1 - d2 : m1 - m2) : y1 - y2;
        };

        const revenueData = Object.keys(revenueMap).map(key => ({
            date: key,
            revenue: revenueMap[key]
        })).sort(sortDateFunc);

        const graphData = Object.keys(graphMap).map(key => ({
            date: key,
            count: graphMap[key]
        })).sort(sortDateFunc);
        
        const dashData = {
            earnings,
            appointments: appointments.filter(item => item.isCompleted).length,
            patients: patients.length,
            latestAppointments: [...appointments].reverse().slice(0, 5),
            graphData,   
            revenueData 
        };

        res.json({ success: true, dashData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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
        const { docId, name, degree, experience, about, fees, address, available } = req.body
        const imageFile = req.file

        // 1. Validate dữ liệu đầu vào
        if (Number(fees) < 0) {
            return res.json({ success: false, message: 'Giá khám không được nhỏ hơn 0' })
        }
        if (!name || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Thiếu thông tin" })
        }

        // 2. Tạo object chứa toàn bộ dữ liệu cần update
        // (Làm như này để gom tất cả thay đổi vào 1 biến duy nhất)
        const updateData = {
            name,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            available
        }

        // 3. Xử lý ảnh: Nếu có ảnh mới upload thì thêm trường 'image' vào updateData
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            updateData.image = imageUpload.secure_url
        }

        // 4. Cập nhật vào Database (Chỉ gọi lệnh update 1 lần duy nhất)
        await doctorModel.findByIdAndUpdate(docId, updateData)

        // 5. Gửi thông báo socket (nếu có dùng realtime)
        if (req.io) {
            req.io.emit('doctor-update');
        }

        // 6. Trả về response
        // updateData.image sẽ chứa link ảnh mới nếu có upload, hoặc undefined nếu không.
        // Frontend sẽ dựa vào đây để cập nhật UI ngay lập tức.
        res.json({ 
            success: true, 
            message: 'Cập nhật hồ sơ thành công', 
            image: updateData.image 
        })

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
    updateDoctorProfile, doctorListSchedule
}