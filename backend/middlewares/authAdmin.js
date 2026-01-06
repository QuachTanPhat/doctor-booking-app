import jwt from 'jsonwebtoken'

const authAdmin = async (req, res, next) => {
    try {
       // Lấy token từ header (Frontend sẽ gửi lên với key là 'atoken')
        const { atoken } = req.headers;
        if (!atoken) {
            return res.json({ success: false, message: "Không có quyền truy cập. Vui lòng đăng nhập lại." })
        }

        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

        
        // (Lúc login sign bằng: email + password, nên giờ check lại y hệt)
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Không có quyền truy cập. Vui lòng đăng nhập lại." })
        }

        next();

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export default authAdmin;