import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'
import userModel from '../models/userModel.js'
import specialityModel from '../models/specialityModel.js'
import faqModel from "../models/faqModel.js";
// API for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        // 1. Validate dữ liệu đầu vào
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin bác sĩ" })
        }

        // 2. Validate email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Email không đúng định dạng" })
        }

        // 3. Validate mật khẩu
        if (password.length < 6) {
            return res.json({ success: false, message: "Mật khẩu phải có ít nhất 6 ký tự" })
        }

        // 4. Kiểm tra email đã tồn tại chưa
        const existingDoctor = await doctorModel.findOne({ email });

        if (existingDoctor) {
            // Email đang hoạt động
            if (!existingDoctor.isDeleted) {
                return res.json({ success: false, message: "Email này đã được sử dụng" });
            }

            // Email đã bị xóa mềm → khôi phục
            if (!imageFile) {
                return res.json({ success: false, message: "Vui lòng tải ảnh mới để khôi phục bác sĩ" })
            }

            const imageUpload = await cloudinary.uploader.upload(imageFile.path);
            const imageUrl = imageUpload.secure_url;

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            existingDoctor.name = name;
            existingDoctor.password = hashedPassword;
            existingDoctor.image = imageUrl;
            existingDoctor.speciality = speciality;
            existingDoctor.degree = degree;
            existingDoctor.experience = experience;
            existingDoctor.about = about;
            existingDoctor.fees = fees;
            existingDoctor.address = JSON.parse(address);
            existingDoctor.date = Date.now();
            existingDoctor.isDeleted = false;

            await existingDoctor.save();

            if (req.io) req.io.emit('doctor-updated');

            return res.json({
                success: true,
                message: "Đã khôi phục và cập nhật thông tin bác sĩ thành công"
            });
        }

        // 5. Tạo bác sĩ mới
        if (!imageFile) {
            return res.json({ success: false, message: "Vui lòng tải ảnh bác sĩ" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        const imageUrl = imageUpload.secure_url;

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now(),
            isDeleted: false
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save();

        if (req.io) req.io.emit('doctor-updated');

        res.json({ success: true, message: "Thêm bác sĩ mới thành công" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Đã xảy ra lỗi, vui lòng thử lại" })
    }
}

const getAllSpecialities = async (req, res) => {
    try {
        const specialities = await specialityModel.find({});
        res.json({ success: true, specialities });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Không thể lấy danh sách chuyên khoa" });
    }
}

const addSpeciality = async (req, res) => {
    try {
        const { name, description } = req.body;
        const imageFile = req.file;

        if (!name || !imageFile) {
            return res.json({ success: false, message: "Vui lòng nhập tên và tải ảnh chuyên khoa" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        const imageUrl = imageUpload.secure_url;

        const specialityData = {
            name,
            image: imageUrl,
            description: description || ""
        };

        const newSpeciality = new specialityModel(specialityData);
        await newSpeciality.save();

        if (req.io) {
            req.io.emit('speciality-added', newSpeciality);
        }

        res.json({ success: true, message: "Thêm chuyên khoa thành công" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Không thể thêm chuyên khoa" });
    }
}

const updateSpeciality = async (req, res) => {
    try {
        const { id, name, description } = req.body;
        const imageFile = req.file;

        const updateData = { name, description };

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path);
            updateData.image = imageUpload.secure_url;
        }

        const updatedSpeciality = await specialityModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (req.io) {
            req.io.emit('speciality-updated', updatedSpeciality);
        }

        res.json({ success: true, message: "Cập nhật chuyên khoa thành công" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Cập nhật chuyên khoa thất bại" });
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
const deleteUser = async (req, res) => {
    try {
        const { id } = req.body; // User ID

        // 1. Tìm các lịch hẹn CHƯA XONG của user này để xử lý
        const activeAppointments = await appointmentModel.find({
            userId: id,
            isCompleted: false,
            cancelled: false
        });

        // 2. Vòng lặp quan trọng: TRẢ LẠI SLOT CHO BÁC SĨ
        // Nếu không làm bước này, giờ khám đó vẫn bị tính là "Booked" vĩnh viễn
        if (activeAppointments.length > 0) {
            for (const appointment of activeAppointments) {
                const { docId, slotDate, slotTime } = appointment;

                const doctorData = await doctorModel.findById(docId);
                if (doctorData) {
                    let slots_booked = doctorData.slots_booked;

                    // Kiểm tra và xóa giờ khỏi mảng slots_booked
                    if (slots_booked[slotDate]) {
                        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

                        // Cập nhật lại database bác sĩ ngay
                        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
                    }
                }
            }

            // 3. Sau khi trả slot xong, mới đổi trạng thái lịch hẹn sang Hủy
            await appointmentModel.updateMany(
                { userId: id, isCompleted: false, cancelled: false },
                { cancelled: true }
            );
        }

        // 4. Cuối cùng mới xóa mềm User
        await userModel.findByIdAndUpdate(id, { isDeleted: true });

        if (req.io) {
            // Gửi sự kiện kèm theo ID của người bị xóa
            req.io.emit('force-logout', { userId: id, type: 'user' });
            req.io.emit('update-appointments');
        }

        res.json({
            success: true,
            message: `Đã xóa người dùng và giải phóng ${activeAppointments.length} lịch hẹn.`
        });

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
            res.json({ success: false, message: "Thông tin đăng nhập không chính xác" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        // Thêm điều kiện: isDeleted KHÁC true
        const doctors = await doctorModel.find({ isDeleted: { $ne: true } }).select('-password');
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//API to get all appointment list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ isDeleted: { $ne: true } });
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        //releasing doctor slot
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Lịch hẹn đã huỷ' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const deleteDoctor = async (req, res) => {
    try {
        const { docId } = req.body;

        // 1. Kiểm tra bác sĩ có tồn tại không
        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: "Bác sĩ không tồn tại" });
        }

        // 2. Tìm các lịch hẹn chưa hoàn thành & chưa hủy
        const pendingAppointments = await appointmentModel.find({
            docId: docId,
            isCompleted: false,
            cancelled: false
        });

        // --- PHẦN MỚI: XỬ LÝ TRẢ SLOT ---
        // Lấy danh sách slot hiện tại của bác sĩ
        let slots_booked = doctor.slots_booked;

        if (pendingAppointments.length > 0) {
            // Duyệt qua từng lịch hẹn sắp bị hủy để xóa giờ trong slots_booked
            pendingAppointments.forEach((appt) => {
                const { slotDate, slotTime } = appt;

                // Nếu ngày đó có trong danh sách booked
                if (slots_booked[slotDate]) {
                    // Lọc bỏ giờ khám ra khỏi mảng
                    slots_booked[slotDate] = slots_booked[slotDate].filter(time => time !== slotTime);
                    
                    // (Tuỳ chọn) Nếu mảng rỗng thì xóa luôn key ngày đó cho gọn data
                    if (slots_booked[slotDate].length === 0) {
                        delete slots_booked[slotDate];
                    }
                }
            });

            // Cập nhật trạng thái lịch hẹn thành Đã Hủy
            await appointmentModel.updateMany(
                { docId: docId, isCompleted: false, cancelled: false },
                { cancelled: true }
            );
        }
        // --------------------------------

        // 4. Xóa mềm Bác sĩ & Cập nhật lại slots_booked mới
        await doctorModel.findByIdAndUpdate(docId, {
            isDeleted: true,
            available: false,
            slots_booked: slots_booked // <--- QUAN TRỌNG: Lưu lại slot đã được làm sạch
        });

        // 5. Báo Frontend cập nhật (Socket)
        if (req.io) {
            req.io.emit('force-logout', { userId: docId, type: 'doctor' });
            req.io.emit('doctor-updated');
            req.io.emit('update-appointments'); // Báo cho user cập nhật lại giao diện đặt lịch
        }

        res.json({
            success: true,
            message: `Đã xóa bác sĩ, hủy ${pendingAppointments.length} lịch hẹn và hoàn trả slot thành công.`
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
// 2. API Cập nhật Bác Sĩ (Ví dụ cập nhật phí)
const updateDoctor = async (req, res) => {
    try {
        // 1. Lấy thêm email và password từ req.body
        const { docId, name, email, password, experience, fees, about, speciality, degree, address } = req.body;
        const imageFile = req.file;

        if (Number(fees) < 0) {
            return res.json({ success: false, message: 'Giá khám không được nhỏ hơn 0' })
        }
        if (!docId) {
            return res.json({ success: false, message: "Thiếu ID bác sĩ" });
        }

        // 2. Tìm bác sĩ hiện tại trong DB để đối chiếu dữ liệu
        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: "Không tìm thấy bác sĩ" });
        }

        // 3. Tạo object chứa dữ liệu cơ bản cần update
        const updateData = {
            name,
            experience,
            fees: Number(fees),
            about,
            speciality,
            degree,
            address: JSON.parse(address)
        };

        // --- LOGIC CẬP NHẬT EMAIL ---
        // Nếu có gửi email lên VÀ email đó khác với email hiện tại
        if (email && email !== doctor.email) {
            // Kiểm tra xem email mới này đã có ai dùng chưa
            const emailExists = await doctorModel.findOne({ email });
            if (emailExists) {
                return res.json({ success: false, message: "Email này đã được sử dụng bởi tài khoản khác!" });
            }
            updateData.email = email;
        }

        // --- LOGIC CẬP NHẬT MẬT KHẨU ---
        // Chỉ cập nhật nếu người dùng có nhập mật khẩu (length > 0)
        if (password && password.length > 0) {
            if (password.length < 6) {
                return res.json({ success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
            }
            // Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateData.password = hashedPassword;
        }

        // --- LOGIC CẬP NHẬT ẢNH ---
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updateData.image = imageUpload.secure_url;
        }

        // 4. Lưu vào Database
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
        // Lọc dữ liệu chưa xóa
        const doctors = await doctorModel.find({ isDeleted: { $ne: true } });
        const users = await userModel.find({ isDeleted: { $ne: true } });
        const appointments = await appointmentModel.find({ isDeleted: { $ne: true } });
        const specialities = await specialityModel.find({});

        const dashData = {
            doctors: doctors.length,
            patients: users.length,
            appointments: appointments.filter(item => item.isCompleted).length,
            specialities: specialities.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        };

        // --- TÍNH DOANH THU ---
        const validAppointments = appointments.filter(item =>
            !item.cancelled && (item.isApproved || item.isCompleted)
        );

        const totalRevenue = validAppointments.reduce((acc, item) => acc + item.amount, 0);

        // --- SỬA LỖI Ở ĐÂY: Thêm Năm (Year) vào dateKey ---
        const revenueMap = {};

        validAppointments.forEach(item => {
            const dateObj = new Date(item.date);
            const day = dateObj.getDate();
            const month = dateObj.getMonth() + 1;
            const year = dateObj.getFullYear(); // 1. Lấy thêm năm

            // 2. Ghép thêm năm vào key: ví dụ '1/1/2026'
            const dateKey = `${day}/${month}/${year}`;

            if (revenueMap[dateKey]) {
                revenueMap[dateKey] += item.amount;
            } else {
                revenueMap[dateKey] = item.amount;
            }
        });

        const revenueData = Object.keys(revenueMap).map(key => ({
            date: key,
            revenue: revenueMap[key]
        })).sort((a, b) => {
            // 3. Sửa lại logic sort để tính cả năm
            const [d1, m1, y1] = a.date.split('/').map(Number);
            const [d2, m2, y2] = b.date.split('/').map(Number);
            // So sánh năm trước, rồi tới tháng, rồi tới ngày
            return y1 === y2 ? (m1 === m2 ? d1 - d2 : m1 - m2) : y1 - y2;
        });

        // --- TƯƠNG TỰ VỚI GRAPH DATA (SỐ LƯỢNG ĐẶT LỊCH) ---
        const graphMap = {};
        appointments.forEach(item => {
            const dateObj = new Date(item.date);
            const day = dateObj.getDate();
            const month = dateObj.getMonth() + 1;
            const year = dateObj.getFullYear(); // Lấy năm

            const dateKey = `${day}/${month}/${year}`; // Ghép năm

            if (graphMap[dateKey]) {
                graphMap[dateKey] += 1;
            } else {
                graphMap[dateKey] = 1;
            }
        });

        const graphData = Object.keys(graphMap).map(key => ({
            date: key,
            count: graphMap[key]
        })).sort((a, b) => {
            const [d1, m1, y1] = a.date.split('/').map(Number);
            const [d2, m2, y2] = b.date.split('/').map(Number);
            return y1 === y2 ? (m1 === m2 ? d1 - d2 : m1 - m2) : y1 - y2;
        });

        res.json({
            success: true,
            dashData: {
                ...dashData,
                totalRevenue,
                revenueData,
                graphData
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const addDoctorSchedule = async (req, res) => {
    try {
        const { docId, slotDate, slotTimes } = req.body;

        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: "Không tìm thấy bác sĩ" });
        }
        let slots = [];
        const [day, month, year] = slotDate.split('_'); // Tách ngày tháng năm

        slotTimes.forEach((time) => {
            const [hour, minute] = time.split(':');

            // Tạo đối tượng Date chuẩn
            let date = new Date(year, month - 1, day, hour, minute);

            slots.push({
                datetime: date,
                time: time
            });
        });
        // -------------------------------

        let slots_scheduled = doctor.slots_scheduled || {};

        // Cập nhật lịch cho ngày đó
        if (slots.length > 0) {
            slots_scheduled[slotDate] = slots; // Lưu mảng Object
        } else {
            delete slots_scheduled[slotDate]; // Xóa nếu admin bỏ chọn hết
        }

        await doctorModel.findByIdAndUpdate(docId, { slots_scheduled });

        // Socket IO (Giữ nguyên logic của bạn)
        if (req.io) {
            req.io.emit('doctor-updated');
        } else if (global.io) {
            // Fallback nếu req.io không có nhưng global.io có
            global.io.emit('doctor-updated');
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
            if (req.io) req.io.emit('update-appointments');

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

        if (appointmentData.isCompleted) {
            return res.json({
                success: false,
                message: "Không thể xóa lịch hẹn đã hoàn thành (Đã tính doanh thu)!"
            });
        }
        // --- BƯỚC 1: TRẢ LẠI SLOT CHO BÁC SĨ ---
        // (Dù xóa mềm hay cứng thì Slot cũng phải nhả ra để người khác đặt)
        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);

        // Kiểm tra xem bác sĩ còn tồn tại không (phòng trường hợp bác sĩ bị xóa cứng trước đó)
        if (doctorData) {
            let slots_booked = doctorData.slots_booked;

            if (slots_booked[slotDate]) {
                // Lọc bỏ giờ đã đặt khỏi danh sách booked
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

                // Cập nhật lại slot cho bác sĩ
                await doctorModel.findByIdAndUpdate(docId, { slots_booked });
            }
        }

        // --- BƯỚC 2: XÓA MỀM (SOFT DELETE) ---
        // Thay vì findByIdAndDelete, ta dùng findByIdAndUpdate
        await appointmentModel.findByIdAndUpdate(appointmentId, { isDeleted: true });

        // --- SOCKET IO UPDATE ---
        if (req.io) req.io.emit('update-appointments');

        res.json({ success: true, message: "Đã xóa lịch hẹn thành công!" });

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

            if (req.io) req.io.emit('update-appointments');

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
        // Chỉ lấy những user chưa bị xóa (isDeleted khác true)
        const users = await userModel.find({ isDeleted: { $ne: true } }).select('-password');

        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
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
const changeDoctorBlockStatus = async (req, res) => {
    try {
        const { docId } = req.body;

        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: "Bác sĩ không tồn tại" });
        }

        // Đảo ngược trạng thái (Nếu đang mở thì khoá, đang khoá thì mở)
        // Hoặc bạn có thể truyền thẳng status từ frontend nếu muốn tường minh
        doctor.isBlocked = !doctor.isBlocked; 
        
        // Nếu chuyển sang trạng thái available cũng nên tắt luôn khi bị block
        if (doctor.isBlocked) {
            doctor.available = false; 
        }

        await doctor.save();

        // --- SOCKET IO: ĐÁ VĂNG BÁC SĨ RA NGAY LẬP TỨC ---
        if (doctor.isBlocked && req.io) {
            // Gửi sự kiện force-logout kèm theo userId là docId
            req.io.emit('force-logout', { userId: docId, type: 'doctor' });
            req.io.emit('doctor-updated'); // Cập nhật lại list bên Admin
        }
        // --------------------------------------------------

        res.json({ 
            success: true, 
            message: doctor.isBlocked ? "Đã khóa tài khoản bác sĩ" : "Đã mở khóa tài khoản bác sĩ" 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
export {
    addDoctor, loginAdmin, allDoctors, appointmentsAdmin,
    appointmentCancel, adminDashboard, deleteDoctor, updateDoctor,
    getAllSpecialities, updateSpeciality, addSpeciality, deleteSpeciality,
    addDoctorSchedule, appointmentComplete,
    appointmentDelete, deleteUser,
    appointmentApprove, allUsers, changeUserStatus,changeDoctorBlockStatus
}