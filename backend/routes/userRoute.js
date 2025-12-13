import express from 'express'
import { resgiterUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'
import { verifyPaymentWebhook, checkPaymentStatus } from '../controllers/userController.js';
const userRouter = express.Router()

userRouter.post('/register', resgiterUser)
userRouter.post('/login', loginUser)
userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser ,updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointment', authUser ,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/payment-webhook', verifyPaymentWebhook);
userRouter.post('/check-payment-status', authUser, checkPaymentStatus);
export default userRouter
