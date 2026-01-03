import jwt from 'jsonwebtoken'

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        // 1. Lấy token từ header (Frontend sẽ gửi lên với key là 'atoken')
        const { atoken } = req.headers;
        if (!atoken) {
            return res.json({ success: false, message: "Không có quyền truy cập. Vui lòng đăng nhập lại." })
        }

        // 3. Giải mã token
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

        // 4. Kiểm tra nội dung token
        // (Lúc login bạn sign bằng: email + password, nên giờ check lại y hệt)
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Không có quyền truy cập. Vui lòng đăng nhập lại." })
        }

        // 5. Nếu mọi thứ OK -> Cho phép đi tiếp vào Controller
        next();

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export default authAdmin;