import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js' // 1. NHỚ IMPORT USER MODEL

// user authentication middleware
const authUser = async (req, res, next) => {
    try {
        // Lấy token từ header
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Không có quyền truy cập. Vui lòng đăng nhập lại." })
        }

        // Giải mã token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)

        // 2. QUERY DATABASE ĐỂ CHECK TRẠNG THÁI MỚI NHẤT
        const user = await userModel.findById(token_decode.id);

        // Trường hợp user bị xóa khỏi DB
        if (!user) {
            return res.json({ success: false, message: "Người dùng không tồn tại" });
        }

        // 3. KIỂM TRA BLOCK - NẾU BỊ KHÓA THÌ CHẶN LUÔN
        if (user.isBlocked) {
            // Trả về message đặc biệt 'account_blocked' để Frontend bắt được
            return res.json({ 
                success: false, 
                message: "Tài khoản đã khoá. Vui lòng liên hệ bộ phận hỗ trợ.", 
            }); 
        }
        if (user.isDeleted) {
            // Trả về message đặc biệt để frontend bắt được
            return res.json({ success: false, message: 'Tài khoản đã bị xoá khỏi hệ thống' }); 
        }

        // Nếu mọi thứ ok thì cho qua
        if (!req.body) {
            req.body = {} 
        }
        req.body.userId = token_decode.id
        next();

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export default authUser;