import express from 'express'
import { resgiterUser, loginUser, getProfile, updateProfile, getAllSpecialities, bookAppointment, listAppointment, cancelAppointment, sendContactEmail, googleLogin } from '../controllers/userController.js'
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
userRouter.get('/get-specialities', getAllSpecialities)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/payment-webhook', verifyPaymentWebhook);
userRouter.post('/check-payment-status', authUser, checkPaymentStatus);
userRouter.post('/send-contact-email', sendContactEmail)
userRouter.post('/google-login', googleLogin)
export default userRouter
