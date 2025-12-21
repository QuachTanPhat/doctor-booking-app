import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'

const Sidebar = () => {
    const {aToken} = useContext(AdminContext)
    const {dToken} = useContext(DoctorContext)

  return (
    <div className='min-h-screen bg-white border-r'>
        {/* ------- Menu dành cho Admin ------- */}
        {
            aToken && <ul className='text-[#515151] mt-5'>
                <NavLink className={({isActive})=>  `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/admin-dashboard'}>
                    <img src={assets.home_icon} alt="" />
                    <p>Bảng điều khiển</p>
                </NavLink>

                <NavLink className={({isActive})=>  `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/all-users'}>
                    <img src={assets.people_icon} alt="" />
                    <p>Quản lý người dùng</p>
                </NavLink>

                <NavLink className={({isActive})=>  `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctors-list'}>
                    <img src={assets.people_icon} alt="" />
                    <p>Quản lý bác sĩ</p>
                </NavLink>

                <NavLink className={({isActive})=>  `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/all-appointments'}>
                    <img src={assets.appointment_icon} alt="" />
                    <p>Quản lý lịch hẹn</p>
                </NavLink>

                <NavLink className={({isActive})=>  `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/speciality-list'}>
                    <img src={assets.add_icon} alt="" />
                    <p>Quản lý chuyên khoa</p>
                </NavLink>

                <NavLink className={({isActive})=>  `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-schedule'}>
                    <img src={assets.add_icon} alt="" />
                    <p>Quản lý lịch làm việc</p>
                </NavLink>

                
            </ul>
        }

        {/* ------- Menu dành cho Bác sĩ ------- */}
         {
            dToken && <ul className='text-[#515151] mt-5'>
                <NavLink className={({isActive})=>  `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-dashboard'}>
                    <img src={assets.home_icon} alt="" />
                    <p className='hidden md:block'>Bảng điều khiển</p>
                </NavLink>

                <NavLink className={({isActive})=>  `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-appointments'}>
                    <img src={assets.appointment_icon} alt="" />
                    <p className='hidden md:block'>Lịch hẹn</p>
                </NavLink>


                <NavLink className={({isActive})=>  `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/doctor-profile'}>
                    <img src={assets.people_icon} alt="" />
                    <p className='hidden md:block'>Hồ sơ cá nhân</p>
                </NavLink>
            </ul>
        }
    </div>
  )
}

export default Sidebar