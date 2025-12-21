import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import userModel from '../models/userModel.js'
import specialityModel from '../models/specialityModel.js'
// API for adding doctor
const addDoctor = async (req, res) => {
    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        //check for all data add user
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
            return res.json({ success: false, message: "All fields are required" })
        }

        //validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "please enter a valid email" })
        }

        // validating strong password
        if (password.length < 6) {
            return res.json({ success: false, message: "Password must be at least 6 characters" })
        }
        //hasing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
        })
        const imageUrl = imageUpload.secure_url;


        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience, about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }
        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save();

        res.json({ success: true, message: "Doctor added successfully" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const getAllSpecialities = async (req, res) => {
    try {
        const specialities = await specialityModel.find({});
        res.json({ success: true, specialities });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const addSpeciality = async (req, res) => {
    try {
        const { name, description } = req.body;
        const imageFile = req.file;

        if (!name || !imageFile) {
            return res.json({ success: false, message: "Thiếu tên hoặc ảnh" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const specialityData = { 
            name, 
            image: imageUrl,
            description: description || "" 
        };

        const newSpeciality = new specialityModel(specialityData);
        await newSpeciality.save();

        res.json({ success: true, message: "Đã thêm chuyên khoa" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const updateSpeciality = async (req, res) => {
    try {
        const { id, name, description } = req.body;
        const imageFile = req.file;
        
        const updateData = { name, description };

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updateData.image = imageUpload.secure_url;
        }

        await specialityModel.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const deleteSpeciality = async (req, res) => {
    try {
        const { id } = req.body;
        await specialityModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Đã xóa chuyên khoa" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, message: "Admin đăng nhập thành công", token })
        } else {
            res.json({ success: false, message: "Invalid admin credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select("-password")
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to get all appointment list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

        //releasing doctor slot
        const {docId, slotDate, slotTime} = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, {slots_booked})

        res.json({success:true, message:'Lịch hẹn đã huỷ'})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}
const deleteDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        
        // Tìm và xóa theo ID
        await doctorModel.findByIdAndDelete(docId);
        
        res.json({ success: true, message: "Đã xóa bác sĩ thành công" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// 2. API Cập nhật Bác Sĩ (Ví dụ cập nhật phí)
const updateDoctor = async (req, res) => {
    try {
        const { docId, name, experience, fees, about, speciality, degree, address } = req.body;
        const imageFile = req.file; // Ảnh mới (nếu có)

        if (!docId) {
            return res.json({ success: false, message: "Thiếu ID bác sĩ" });
        }

        // Tạo object chứa dữ liệu cần update
        // Lưu ý: address từ FormData gửi lên là chuỗi JSON, cần parse ra Object
        const updateData = {
            name,
            experience,
            fees: Number(fees),
            about,
            speciality,
            degree,
            address: JSON.parse(address) 
        };

        // Nếu có ảnh mới thì upload và cập nhật URL
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updateData.image = imageUpload.secure_url;
        }

        // Cập nhật vào Database
        await doctorModel.findByIdAndUpdate(docId, updateData);
        if (req.io) {
            
            req.io.emit('doctor-updated'); 
        }
        res.json({ success: true, message: "Cập nhật thông tin thành công" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})
        const specialities = await specialityModel.find({}) // <--- LẤY DỮ LIỆU CHUYÊN KHOA

        // Xử lý dữ liệu biểu đồ (Gom nhóm theo ngày)
        const dailyStats = {};
        // Sắp xếp lịch hẹn theo ngày tăng dần để biểu đồ chạy đúng từ trái qua phải
        const sortedAppointments = appointments.sort((a, b) => {
             const dateA = a.slotDate.split('_').reverse().join('');
             const dateB = b.slotDate.split('_').reverse().join('');
             return dateA.localeCompare(dateB);
        });

        sortedAppointments.forEach(appt => {
            if (!appt.cancelled) {
                const dateParts = appt.slotDate.split('_');
                const shortDate = `${dateParts[0]}/${dateParts[1]}`; // DD/MM

                if (!dailyStats[shortDate]) {
                    dailyStats[shortDate] = { date: shortDate, count: 0 };
                }
                dailyStats[shortDate].count += 1;
            }
        });

        // Lấy 14 ngày gần nhất có dữ liệu để vẽ biểu đồ cho đẹp
        const graphData = Object.values(dailyStats).slice(-14); 

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            specialities: specialities.length, // <--- TRẢ VỀ SỐ LƯỢNG CHUYÊN KHOA
            latestAppointments: appointments.reverse().slice(0, 5),
            graphData: graphData 
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const addDoctorSchedule = async (req, res) => {
    try {
        const { docId, slotDate, slotTimes } = req.body;
        // slotDate format: "DD_MM_YYYY" (ví dụ: 10_12_2025)
        // slotTimes format: ["09:00", "10:00", "14:00"]

        const doctor = await doctorModel.findById(docId);
        let slots_scheduled = doctor.slots_scheduled || {};

        // Cập nhật lịch cho ngày đó (Ghi đè hoặc thêm mới)
        slots_scheduled[slotDate] = slotTimes;

        await doctorModel.findByIdAndUpdate(docId, { slots_scheduled });
        if (req.io) {
            
            req.io.emit('doctor-updated'); 
        }
        res.json({ success: true, message: "Đã cập nhật lịch làm việc!" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const appointmentComplete = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);
        
        if (appointmentData && !appointmentData.cancelled) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            
            // --- SOCKET IO UPDATE ---
            if(req.io) req.io.emit('update-appointments'); 
            
            res.json({ success: true, message: "Đã hoàn thành lịch khám" });
        } else {
            res.json({ success: false, message: "Lịch hẹn không hợp lệ hoặc đã hủy" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const appointmentDelete = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.json({ success: false, message: "Không tìm thấy lịch hẹn" });
        }

        // Bước 1: Trả lại Slot cho bác sĩ (Xóa giờ đã book khỏi mảng slots_booked)
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        let slots_booked = doctorData.slots_booked;

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
            await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        }

        // Bước 2: Xóa lịch hẹn khỏi Database
        await appointmentModel.findByIdAndDelete(appointmentId);

        // --- SOCKET IO UPDATE ---
        if(req.io) req.io.emit('update-appointments');

        res.json({ success: true, message: "Đã xóa vĩnh viễn lịch hẹn" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const appointmentApprove = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && !appointmentData.cancelled) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isApproved: true });
            
            if(req.io) req.io.emit('update-appointments'); 
            
            res.json({ success: true, message: "Đã duyệt lịch hẹn!" });
        } else {
            res.json({ success: false, message: "Lịch hẹn không hợp lệ hoặc đã hủy" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const allUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password') // Không lấy password
        res.json({ success: true, users })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const changeUserStatus = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (user) {
            // Đảo ngược trạng thái hiện tại (Đang khóa -> Mở, Đang mở -> Khóa)
            await userModel.findByIdAndUpdate(userId, { isBlocked: !user.isBlocked });
            res.json({ success: true, message: 'Đã thay đổi trạng thái tài khoản' });
        } else {
            res.json({ success: false, message: 'Người dùng không tồn tại' });
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, 
    appointmentCancel, adminDashboard, deleteDoctor, updateDoctor,
    getAllSpecialities, updateSpeciality, addSpeciality, deleteSpeciality,
    addDoctorSchedule, appointmentComplete,
    appointmentDelete,
    appointmentApprove, allUsers, changeUserStatus
 }