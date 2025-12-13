import jwt from 'jsonwebtoken'

// user authentication middleware
const authUser = async (req, res, next) => {
    try {
        // 1. Lấy token từ header (Frontend sẽ gửi lên với key là 'atoken')
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }

        // 3. Giải mã token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
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