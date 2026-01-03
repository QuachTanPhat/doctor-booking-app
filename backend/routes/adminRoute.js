import express from 'express'
import { 
    loginAdmin, 
    adminDashboard, 
    // User Controller
    allUsers,
    changeUserStatus,
    deleteUser,
    // Doctor Controllers
    addDoctor, 
    allDoctors, 
    updateDoctor, 
    deleteDoctor, 
    addDoctorSchedule,
    // Appointment Controllers
    appointmentsAdmin, 
    appointmentApprove, 
    appointmentComplete, 
    appointmentCancel, 
    appointmentDelete,
    // Speciality Controllers
    addSpeciality, 
    updateSpeciality, 
    getAllSpecialities, 
    deleteSpeciality ,
} from '../controllers/adminController.js'
import { 
    addFaq, 
    listFaq, 
    updateFaq, 
    deleteFaq 
} from '../controllers/faqController.js'
import { changeAvailability } from '../controllers/doctorController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'

const adminRouter = express.Router()
// 1. AUTHENTICATION (Đăng nhập)
adminRouter.post('/login', loginAdmin)
// 2. DASHBOARD (Thống kê)
adminRouter.get('/dashboard', authAdmin, adminDashboard)
// 3. USER (Người dùng)
adminRouter.post('/all-users', authAdmin, allUsers)
adminRouter.post('/change-user-status', authAdmin, changeUserStatus)
adminRouter.post('/delete-user', authAdmin, deleteUser);
// 4. DOCTOR MANAGEMENT (Quản lý Bác sĩ)
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor)
adminRouter.post('/update-doctor', authAdmin, upload.single('image'), updateDoctor)
adminRouter.post('/delete-doctor', authAdmin, deleteDoctor)
adminRouter.post('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/change-availability', authAdmin, changeAvailability)
adminRouter.post('/add-schedule', authAdmin, addDoctorSchedule)
// 5. APPOINTMENT MANAGEMENT (Quản lý Lịch hẹn)
adminRouter.get('/appointments', authAdmin, appointmentsAdmin)          
adminRouter.post('/approve-appointment', authAdmin, appointmentApprove) 
adminRouter.post('/complete-appointment', authAdmin, appointmentComplete) 
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel)   
adminRouter.post('/delete-appointment', authAdmin, appointmentDelete)
// 6. SPECIALITY MANAGEMENT (Quản lý Chuyên khoa)
adminRouter.get('/all-specialities', authAdmin, getAllSpecialities)
adminRouter.post('/add-speciality', authAdmin, upload.single('image'), addSpeciality)
adminRouter.post('/update-speciality', authAdmin, upload.single('image'), updateSpeciality)
adminRouter.post('/delete-speciality', authAdmin, deleteSpeciality)
// 7. FAQ MANAGEMENT (Quản lý FAQ)
adminRouter.post('/add-faq', authAdmin, addFaq)
adminRouter.get('/all-faqs', listFaq) 
adminRouter.post('/update-faq', authAdmin, updateFaq)
adminRouter.post('/delete-faq', authAdmin, deleteFaq) 
export default adminRouter;