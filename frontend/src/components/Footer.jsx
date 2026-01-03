import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
    const navigate = useNavigate()
  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-20 text-sm bg-gray-50 rounded-lg p-10'>
            <div>
                {/* ------Left Section ----------- */}
                <img className='mb-5 w-40' src={assets.logo} alt="" />
                <p className='w-full md:w-2/3 text-gray-800 leading-6'>
                    Chúng tôi cung cấp nền tảng đặt lịch khám bệnh trực tuyến uy tín, 
                    kết nối bệnh nhân với mạng lưới các bác sĩ chuyên khoa hàng đầu. 
                    Sức khỏe của bạn là ưu tiên số một của chúng tôi.
                </p>
            </div>

            <div>
                {/* ------Center Section ----------- */}
                
                <p className='text-xl font-bold mb-5 text-black'>VỀ CHÚNG TÔI</p>
                <ul className='flex flex-col gap-2 text-gray-800 cursor-pointer'>
                    <li onClick={()=> {navigate('/'); window.scrollTo(0,0)}} className='hover:text-primary transition-colors'>Trang chủ</li>
                    <li onClick={()=> {navigate('/about'); window.scrollTo(0,0)}} className='hover:text-primary transition-colors'>Giới thiệu</li>
                    <li onClick={()=> {navigate('/doctors'); window.scrollTo(0,0)}} className='hover:text-primary transition-colors'>Danh sách bác sĩ</li>
                    <li onClick={()=> {navigate('/contact'); window.scrollTo(0,0)}} className='hover:text-primary transition-colors'>Liên hệ</li>
                    
                </ul>
            </div>

            <div>
                {/* ------Right Section ----------- */}
                <p className='text-xl font-bold mb-5 text-black'>LIÊN HỆ</p>
                <ul className='flex flex-col gap-2 text-gray-800'>
                    <li>(+84) 386 972 871</li>
                    <li>phat.qt.64cntt@ntu.edu.vn</li>
                </ul>
            </div>
        </div>

        {/* --------Copyright Text */}
        <div>
            <p className='py-5 text-sm text-center text-gray-600'>Bản quyền © 2026 thuộc về tanphat.dev - Bảo lưu mọi quyền.</p>
        </div>
        
    </div>
  )
}

export default Footer