import React from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useContext } from 'react';
import { AdminContext } from './context/AdminContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard.jsx';
import AllAppointment from './pages/Admin/AllAppointment.jsx';
import DoctorsList from './pages/Admin/DoctorsList.jsx';
import SpecialityList from './pages/Admin/SpecialityList.jsx';
import { DoctorContext } from './context/DoctorContext.jsx';
import DoctorDashboard from './pages/Doctor/DoctorDashboard.jsx';
import DoctorAppointments from './pages/Doctor/DoctorAppointments.jsx';
import DoctorProfile from './pages/Doctor/DoctorProfile.jsx';
import DoctorSchedule from './pages/Admin/DoctorSchedule.jsx';
import AllUsers from './pages/Admin/AllUsers';
const App = () => {
  const {aToken} = useContext(AdminContext)
  const {dToken} = useContext(DoctorContext)
  return aToken || dToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'> 
        <Sidebar />
        <Routes>
          {/* Admin Route */}
          <Route path='/' element={<></>}/>
          <Route path='/admin-dashboard' element={<Dashboard/>}/>
          <Route path='/all-appointments' element={<AllAppointment/>}/>
          <Route path='/speciality-list' element={<SpecialityList/>}/>
          <Route path='/doctors-list' element={<DoctorsList/>}/>
          <Route path='/doctor-schedule' element={<DoctorSchedule/>}/>
          {/* --- THÊM DÒNG NÀY ĐỂ HIỆN TRANG QUẢN LÝ NGƯỜI DÙNG --- */}
          <Route path='/all-users' element={<AllUsers />} />
          {/* Doctor Route */}
          <Route path='/doctor-dashboard' element={<DoctorDashboard/>}/>
          <Route path='/doctor-appointments' element={<DoctorAppointments/>}/>
          <Route path='/doctor-profile' element={<DoctorProfile/>}/>
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login/>
      <ToastContainer />
    </>
  )
}

export default App