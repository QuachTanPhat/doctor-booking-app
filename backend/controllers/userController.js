import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js';
import specialityModel from '../models/specialityModel.js'
import nodemailer from 'nodemailer'
import { OAuth2Client } from "google-auth-library"
import transactionModel from '../models/transactionModel.js';
import {sendLoginNotification} from '../helpers/sendLoginNotification.js';
// API to resgiter user
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const resgiterUser = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;
        const usernameExists = await userModel.findOne({ username });

        if (usernameExists) {
            return res.json({ success: false, message: "Tên tài khoản đã tồn tại" });
        }
        if (!name || !password || !email) {
            return res.json({ success: false, message: "Thiếu thông tin" });
        }

        //validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Nhập đúng định dạng email" });
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Mật khẩu phải có ít nhất 8 ký tự" });
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword,
            username: username
        };

        const newUSer = new userModel(userData);
        const user = await newUSer.save();
        // _id
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//API for user login
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body // Hoặc email tuỳ vào db bạn dùng field nào
        
        // 1. Tìm user trong DB
        const user = await userModel.findOne({ username }) // Hoặc { email: email }

        // 2. Kiểm tra user có tồn tại không
        if (!user) {
            return res.json({ success: false, message: "Tên tài khoản không tồn tại" })
        }

        // --- 3. BỔ SUNG: CHECK TÀI KHOẢN BỊ XÓA (QUAN TRỌNG) ---
        if (user.isDeleted) {
            return res.json({ 
                success: false, 
                message: "Tài khoản đã bị xoá khỏi hệ thống" 
            });
        }
        // -----------------------------------------------------

        // 4. Kiểm tra bị khóa (Blocked)
        if (user.isBlocked) {
            return res.json({ success: false, message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!" });
        }

        // 5. Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Thông tin đăng nhập không chính xác" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
};
const changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        // 1. Tìm user trong DB
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "Người dùng không tồn tại" });
        }

        // 2. LOGIC KIỂM TRA MẬT KHẨU CŨ
        // Chỉ kiểm tra mật khẩu cũ nếu tài khoản này KHÔNG PHẢI đăng nhập bằng Google
        // (Tức là: user thường thì bắt check, user Google thì bỏ qua)
        if (!user.isGoogleLogin) {
            if (!oldPassword) {
                return res.json({ success: false, message: "Vui lòng nhập mật khẩu hiện tại" });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: "Mật khẩu cũ không chính xác" });
            }
        }

        // 3. Kiểm tra độ dài mật khẩu mới
        if (newPassword.length < 6) {
            return res.json({ success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
        }

        // 4. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 5. Cập nhật vào DB
        user.password = hashedPassword;
        
        // (Tùy chọn) Sau khi user Google đã đặt mật khẩu, bạn có thể coi họ như user thường
        // bằng cách bỏ comment dòng dưới (lúc này lần sau đổi pass họ SẼ PHẢI nhập pass cũ)
        user.isGoogleLogin = false; 

        await user.save();

        res.json({ success: true, message: "Cập nhật mật khẩu thành công!" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
//API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId).select("-password")

        res.json({ success: true, userData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
};
// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Thiếu thông tin" })
        }

        await userModel.findByIdAndUpdate(userId, {
            name,
            phone,
            address: JSON.parse(address),
            dob,
            gender,
        })

        if (imageFile) {
            //upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
            const imageUrl = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageUrl})
        }
        const updatedUserData = await userModel.findById(userId)
        await appointmentModel.updateMany(
            { userId: userId }, 
            { userData: updatedUserData }
        )

        if (req.io) {
            req.io.emit('update-appointments');
        }
        res.json({success:true, message:"Cập nhật hồ sơ thành công"})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime, paymentMethod } = req.body;

        // --- 🛡️ 1. CHỐNG SPAM (Rate Limiting) ---
        // Kiểm tra xem User này đang có bao nhiêu đơn "Treo" (Chưa hoàn thành & Chưa hủy)
        const pendingAppointments = await appointmentModel.find({
            userId,
            isCompleted: false,
            cancelled: false,
        });

        // Giới hạn: Nếu đang có từ 2 đơn chưa xong trở lên -> Chặn không cho đặt tiếp
        // (Tránh trường hợp Spam đặt lịch tiền mặt rồi bùng hàng loạt)
        if (pendingAppointments.length >= 2) {
            return res.json({ 
                success: false, 
                message: "Bạn đang có quá nhiều lịch hẹn chưa hoàn thành. Vui lòng hoàn tất hoặc hủy lịch cũ trước khi đặt mới!" 
            });
        }
        // ----------------------------------------

        const docData = await doctorModel.findById(docId).select('-password');

        // Kiểm tra bác sĩ có còn làm việc không
        if (!docData.available) {
            return res.json({ success: false, message: 'Bác sĩ không làm việc tại thời điểm này' });
        }

        let slots_booked = docData.slots_booked || {};

        // --- 2. KIỂM TRA SLOT TRỐNG ---
        // Kiểm tra kỹ hơn để tránh trùng lặp
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot này vừa có người đặt mất rồi!' });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime);
        }

        const userData = await userModel.findById(userId).select('-password');

        // Xóa thông tin slot trong object docData trước khi lưu vào appointment (cho nhẹ DB)
        delete docData.slots_booked;

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            // Nếu không chọn gì thì mặc định là Tiền mặt (CASH)
            paymentMethod: paymentMethod || 'CASH', 
            date: Date.now(),
            isApproved: false
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        // Gửi socket realtime (nếu có cấu hình)
        if (req.io) {
            req.io.emit('update-appointments');
        }

        res.json({ success: true, message: 'Đã đặt lịch hẹn thành công!' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//API to get user appointments for frontend my-appointments page
const listAppointment = async (req,res) => {
    try {
        const {userId} = req.body
        const appointment = await appointmentModel.find({
            userId, 
            isDeleted: { $ne: true } 
        })

        res.json({success:true, appointment})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const {userId, appointmentId} = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if(appointmentData.userId !== userId){
            return res.json({success: false, message:'Không có quyền thực hiện hành động này'})
        }

        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})

        //releasing doctor slot
        const {docId, slotDate, slotTime} = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
        }

        await doctorModel.findByIdAndUpdate(docId, {slots_booked})
        if (req.io) {
            req.io.emit('update-appointments');
        }
        res.json({success:true, message:'Đã hủy lịch hẹn'})
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

const checkPaymentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await appointmentModel.findById(appointmentId);
        
        if (appointment && appointment.payment) {
            return res.json({ success: true, paid: true });
        } else {
            return res.json({ success: true, paid: false });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
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
const verifyPaymentWebhook = async (req, res) => {
    try {
        const sepayToken = req.headers['authorization'];
        const myToken = "Apikey " + process.env.SEPAY_API_TOKEN;
        
        const data = req.body;
      
        if (process.env.SEPAY_API_TOKEN && sepayToken !== myToken) {
            return res.json({ success: false, message: "Truy cập bị từ chối (Sai Token)" });
        }

        const amountIn = data.transferAmount || data.amount || 0;
        const contentIn = data.transferContent || data.content || data.description || "";
        const transactionCode = data.id || data.code || ""; // Mã giao dịch ngân hàng

        // Logic trích xuất ID từ nội dung chuyển khoản (QUAN TRỌNG)
        // MongoDB ID là chuỗi 24 ký tự gồm số và chữ cái a-f
        const idRegex = /[a-fA-F0-9]{24}/; 
        const match = contentIn.toString().match(idRegex);

        let appointmentId = null;
        if (match && match.length > 0) {
            appointmentId = match[0]; // Lấy được ID đơn hàng
        }

        // 3. Lưu lịch sử giao dịch (Dù tìm thấy đơn hay không cũng phải lưu để đối soát)
        const newTransaction = new transactionModel({
            amountIn: amountIn,
            transactionContent: contentIn,
            code: transactionCode,
            referenceCode: appointmentId || "UNKNOWN"
        });
        await newTransaction.save();

        if (!appointmentId) {
            return res.json({ success: true, message: "Không tìm thấy mã đơn hàng trong nội dung" });
        }

        
        const appointment = await appointmentModel.findById(appointmentId);

        if (appointment) {
            if (appointment.payment) {
                return res.json({ success: true, message: "Đơn này đã được thanh toán trước đó" });
            }

            console.log(`=> Tìm thấy đơn: ${appointment._id} - Cần: ${appointment.amount} - Nhận: ${amountIn}`);

            // So sánh tiền
            if (Number(amountIn) >= Number(appointment.amount)) {
                
                await appointmentModel.findByIdAndUpdate(appointmentId, { 
                    payment: true,
                    isApproved: true, 
                    paymentMethod: 'Chuyển khoản Online' 
                });

                console.log("=> CẬP NHẬT THÀNH CÔNG!");
                
                if (req.io) {
                    req.io.emit('update-appointments');
                }

                return res.json({ success: true, message: "Thanh toán thành công" });
            } else {
                console.log("=> Lỗi: Tiền không đủ.");
                return res.json({ success: true, message: "Số tiền không đủ" });
            }
        } else {
            console.log("=> Có ID trong nội dung nhưng không tìm thấy đơn trong DB.");
            return res.json({ success: true, message: "Không tìm thấy đơn hàng" });
        }

    } catch (error) {
        console.log("Webhook Error:", error);
        return res.json({ success: false, message: error.message });
    }
}
const sendContactEmail = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER, 
                pass: process.env.MAIL_PASS  
            }
        });
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: process.env.RECEIVER_EMAIL, 
            subject: `[LIÊN HỆ MỚI] - ${subject} từ ${name}`,
            html: `
                <h3>Bạn có tin nhắn liên hệ mới từ Website Prescripto</h3>
                <p><strong>Họ tên:</strong> ${name}</p>
                <p><strong>Email người gửi:</strong> ${email}</p>
                <p><strong>Số điện thoại:</strong> ${phone}</p>
                <p><strong>Chủ đề:</strong> ${subject}</p>
                <p><strong>Nội dung:</strong></p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px;">
                    ${message}
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Email gửi thành công" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const googleLogin = async (req, res) => {
    try {
        const { googleToken } = req.body;

        // Xác thực token với Google
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });

        const { name, email, picture } = ticket.getPayload();

        
        let user = await userModel.findOne({ email });

        if (user) {
            if (user.isDeleted) {
                return res.json({ 
                    success: false, 
                    message: "Tài khoản đã bị xoá khỏi hệ thống" 
                });
            }

            if (user.isBlocked) {
                return res.json({ 
                    success: false, 
                    message: "Tài khoản Google này đã bị khóa!" 
                });
            }
            sendLoginNotification(email, name);
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ success: true, token });

        } else {
            // User chưa tồn tại -> Tạo mới
            // (User mới tạo thì mặc định sạch, không cần check isDeleted)
            const newUser = new userModel({
                name,
                email,
                username: email,
                image: picture, 
                password: Date.now().toString(), 
                isGoogleLogin: true,
            });

            const savedUser = await newUser.save();
            sendLoginNotification(email, name);
            const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS  
    }
});

// API 1: Gửi OTP xác nhận quên mật khẩu
const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Email không tồn tại trong hệ thống!" });
        }

        // Tạo OTP 6 số ngẫu nhiên
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        // Lưu OTP vào DB (Hết hạn sau 15 phút)
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 15 * 60 * 1000; 
        await user.save();

        // Cấu hình nội dung email
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'MÃ XÁC NHẬN ĐẶT LẠI MẬT KHẨU - PRESCRIPTO',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
                        <p style="color: #666; font-size: 16px;">Xin chào <strong>${user.name}</strong>,</p>
                        <p style="color: #666; font-size: 16px;">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Prescripto. Mã xác nhận (OTP) của bạn là:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <span style="font-size: 32px; font-weight: bold; color: #5f6fff; letter-spacing: 5px;">${otp}</span>
                        </div>
                        <p style="color: #666; font-size: 14px;">Mã này có hiệu lực trong vòng <strong>15 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; text-align: center;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Đã gửi mã OTP đến email của bạn!" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API 2: Xác thực OTP và Đặt mật khẩu mới
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Email không tồn tại!" });
        }

        // Kiểm tra OTP
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Mã OTP không chính xác!" });
        }

        // Kiểm tra hạn sử dụng OTP
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "Mã OTP đã hết hạn!" });
        }

        
        if (newPassword.length < 8) {
             return res.json({ success: false, message: "Mật khẩu mới phải có ít nhất 8 ký tự!" });
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật User & Xóa OTP cũ
        user.password = hashedPassword;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        res.json({ success: true, message: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại." });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
export { resgiterUser, loginUser, changePassword, getProfile, updateProfile, bookAppointment,
     listAppointment, cancelAppointment, getAllSpecialities, checkPaymentStatus,
      verifyPaymentWebhook, sendContactEmail, googleLogin, sendResetOtp, resetPassword
     };
