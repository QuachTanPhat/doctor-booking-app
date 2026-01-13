import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });
};

const sendLoginNotification = async (userEmail, userName) => {
    try {
        console.log("--> [Mail Login] Đang gửi cho:", userEmail);
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Prescripto Security" <${process.env.MAIL_USER}>`,
            to: userEmail,
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
                    <p style="color: red; font-weight: bold;">Nếu bạn KHÔNG thực hiện đăng nhập này, vui lòng liên hệ Admin ngay!</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888; text-align: center;">Prescripto Security System</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Đã gửi mail login thành công!`);

    } catch (error) {
        console.log("❌ Lỗi gửi mail login:", error.message);
    }
}

const sendCancellationEmail = async (userEmail, userName, doctorName, date, time) => {
    try {
        console.log("--> [Mail Cancel] Đang gửi cho bệnh nhân:", userEmail);
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Prescripto Support" <${process.env.MAIL_USER}>`,
            to: userEmail,
            subject: `[Thông báo quan trọng] Hủy lịch hẹn khám với Bác sĩ ${doctorName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #dc3545; text-align: center;">Thông báo hủy lịch hẹn</h2>
                    <p>Xin chào <strong>${userName}</strong>,</p>
                    
                    <p>Chúng tôi rất tiếc phải thông báo rằng lịch hẹn khám của bạn đã bị hủy do <strong>Bác sĩ ${doctorName}</strong> có việc đột xuất và tạm thời không thể tiếp nhận bệnh nhân vào thời gian này.</p>
                    
                    <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p style="margin: 5px 0;"><strong>Thời gian đã đặt:</strong> ${time} - ${date}</p>
                        <p style="margin: 5px 0;"><strong>Bác sĩ:</strong> ${doctorName}</p>
                    </div>

                    <p>Vui lòng truy cập lại hệ thống để <strong>đặt lại lịch hẹn vào một ngày khác</strong> hoặc chọn bác sĩ khác.</p>
                    <p>Chúng tôi thành thật xin lỗi vì sự bất tiện này.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888; text-align: center;">Đội ngũ hỗ trợ Prescripto</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Đã gửi mail báo hủy cho bệnh nhân: ${userEmail}`);

    } catch (error) {
        console.log("❌ Lỗi gửi mail cancel:", error.message);
    }
}
// Xuất khẩu cả 2 hàm ra để dùng ở nơi khác
export { sendLoginNotification, sendCancellationEmail };