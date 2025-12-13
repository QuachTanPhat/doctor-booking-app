import jwt from 'jsonwebtoken'

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
    try {
        // 1. Lấy token từ header (Frontend sẽ gửi lên với key là 'atoken')
        const { dtoken } = req.headers;
        if (!dtoken) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }

        // 3. Giải mã token
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)
        if (!req.body) {
            req.body = {} 
        }
        req.body.docId = token_decode.id
        next();

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export default authDoctor;