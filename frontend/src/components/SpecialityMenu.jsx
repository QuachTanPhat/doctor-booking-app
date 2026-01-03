import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext' // 1. Import Context

const SpecialityMenu = () => {
    // 2. Lấy danh sách specialities từ Context (đã được fetch từ DB)
    const { specialities } = useContext(AppContext);

    return (
        <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id='speciality'>
            <h1 className='text-3xl font-medium'>Tìm Kiếm Theo Chuyên Khoa</h1>
            <p className='sm:w-1/3 text-center text-sm'>
                Dễ dàng tra cứu danh sách các bác sĩ chuyên khoa hàng đầu, và đặt lịch hẹn nhanh chóng, tiện lợi.
            </p>
            
            <div className='flex sm:justify-center gap-4 pt-5 w-full overflow-scroll custom-scrollbar'>
                {/* 3. Map qua mảng specialities lấy từ DB */}
                {specialities && specialities.length > 0 ? (
                    specialities.map((item, index) => (
                        <Link 
                            onClick={() => scrollTo(0, 0)} 
                            className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500' 
                            key={index} 
                            to={`/doctors/${item.name}`} // Lưu ý: DB thường lưu tên là 'name' hoặc 'speciality' tùy model bạn đặt
                        >
                            {/* item.image là đường dẫn ảnh (Cloudinary) lưu trong DB */}
                            <img className='w-16 sm:w-24 mb-2 rounded-full object-cover h-16 sm:h-24' src={item.image} alt={item.name} />
                            <p>{item.name}</p> 
                        </Link>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm">Đang cập nhật danh sách chuyên khoa...</p>
                )}
            </div>
        </div>
    )
}

export default SpecialityMenu