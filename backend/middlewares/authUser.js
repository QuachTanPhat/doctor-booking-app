import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js' 

const authUser = async (req, res, next) => {
    try {
        
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Không có quyền truy cập. Vui lòng đăng nhập lại." })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(token_decode.id);

        if (!user) {
            return res.json({ success: false, message: "Người dùng không tồn tại" });
        }

        if (user.isBlocked) {
            return res.json({ 
                success: false, 
                message: "Tài khoản đã khoá. Vui lòng liên hệ bộ phận hỗ trợ.", 
            }); 
        }
        if (user.isDeleted) {
            
            return res.json({ success: false, message: 'Tài khoản đã bị xoá khỏi hệ thống' }); 
        }

        
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