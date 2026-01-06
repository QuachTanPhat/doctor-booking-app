import jwt from 'jsonwebtoken'
import doctorModel from '../models/doctorModel.js' 

const authDoctor = async (req, res, next) => {
    try {
       
        const { dtoken } = req.headers;
        if (!dtoken) {
            return res.json({ success: false, message: "Không có quyền truy cập. Vui lòng đăng nhập lại." })
        }

        
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET)

        const doctor = await doctorModel.findById(token_decode.id);

        if (!doctor) {
            return res.json({ success: false, message: "Tài khoản bác sĩ không tồn tại" });
        }

        if (doctor.isBlocked) {
            return res.json({ 
                success: false, 
                message: "Tài khoản bác sĩ đã bị khóa. Vui lòng liên hệ Admin.", 
            }); 
        }

        if (doctor.isDeleted) {
            return res.json({ 
                success: false, 
                message: 'Tài khoản đã bị xoá khỏi hệ thống' 
            }); 
        }

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