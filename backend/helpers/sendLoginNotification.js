import nodemailer from 'nodemailer';

// Hàm này nhận vào email và tên của người vừa đăng nhập
const sendLoginNotification = async (userEmail, userName) => {
    try {
        console.log("--> Đang bắt đầu quá trình gửi mail cho:", userEmail); 
        console.log("User gửi:", process.env.MAIL_USER);
        // 1. Cấu hình Transporter (Y hệt code cũ của bạn)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER, 
                pass: process.env.MAIL_PASS  
            }
        });

        // 2. Cấu hình nội dung mail (Thay đổi phần này)
        const mailOptions = {
            from: `"Prescripto Security" <${process.env.MAIL_USER}>`, // Tên người gửi cho sang
            to: userEmail, // <--- QUAN TRỌNG: Gửi cho người dùng, ko phải admin
            subject: `[Cảnh báo bảo mật] Đăng nhập mới từ tài khoản ${userName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #007bff; text-align: center;">Thông báo đăng nhập</h2>
                    <p>Xin chào <strong>${userName}</strong>,</p>
                    <p>Tài khoản của bạn vừa được đăng nhập thành công vào hệ thống <strong>Prescripto</strong> thông qua Google.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff;">
                        <p style="margin: 5px 0;"><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
                    </div>

                    <p>Nếu đây là bạn, vui lòng bỏ qua email này.</p>
                    <p style="color: red; font-weight: bold;">Nếu bạn KHÔNG thực hiện đăng nhập này, vui lòng liên hệ Admin hoặc đổi mật khẩu ngay lập tức!</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888; text-align: center;">Đây là email tự động từ hệ thống Prescripto.</p>
                </div>
            `
        };

        // 3. Gửi mail
        await transporter.sendMail(mailOptions);
        console.log(`Đã gửi mail thông báo login cho: ${userEmail}`);

    } catch (error) {
        // Chỉ log lỗi ra console server, KHÔNG return lỗi ra ngoài để tránh chặn user đăng nhập
        console.log("Lỗi gửi mail login:", error.message);
    }
}

export default sendLoginNotification;