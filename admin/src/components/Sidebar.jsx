import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { NavLink } from 'react-router-dom'
import { adminMenu, doctorMenu } from '../utils/menuConfig' 

const Sidebar = () => {
    const { aToken } = useContext(AdminContext)
    const { dToken } = useContext(DoctorContext)
    const navLinkStyle = ({ isActive }) => 
        `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`

    return (
        <div className='min-h-screen bg-white border-r'>
            {/* ------- Menu dành cho Admin ------- */}
            {
                aToken && (
                    <ul className='text-[#515151] mt-5'>
                        {adminMenu.map((item, index) => (
                            <NavLink 
                                key={index} 
                                to={item.path} 
                                className={navLinkStyle}
                            >
                                <img src={item.icon} alt={item.label} />
                                <p>{item.label}</p>
                            </NavLink>
                        ))}
                    </ul>
                )
            }

            {/* ------- Menu dành cho Bác sĩ ------- */}
            {
                dToken && (
                    <ul className='text-[#515151] mt-5'>
                        {doctorMenu.map((item, index) => (
                            <NavLink 
                                key={index} 
                                to={item.path} 
                                className={navLinkStyle}
                            >
                                <img src={item.icon} alt={item.label} />
                                <p className='hidden md:block'>{item.label}</p>
                            </NavLink>
                        ))}
                    </ul>
                )
            }
        </div>
    )
}

export default Sidebar