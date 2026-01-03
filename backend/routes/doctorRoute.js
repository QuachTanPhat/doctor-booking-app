import express from 'express'
import { appointmentsDoctor, doctorList, loginDoctor, appointmentApprove, doctorListSchedule, appointmentCancel, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'
import upload from '../middlewares/multer.js'

const doctorRouter = express.Router()

doctorRouter.get('/list', doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.get('/appointments',authDoctor, appointmentsDoctor)
doctorRouter.post('/approve-appointment', authDoctor, appointmentApprove)
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel)
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete)
doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
doctorRouter.get('/profile', authDoctor,doctorProfile)
doctorRouter.post('/update-profile', upload.single('image') ,authDoctor, updateDoctorProfile)
doctorRouter.post('/add-schedule', authDoctor, doctorListSchedule)
export default doctorRouter