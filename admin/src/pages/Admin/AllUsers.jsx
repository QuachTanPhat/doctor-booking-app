import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllUsers = () => {

  const { aToken, users, getAllUsers, changeUserStatus } = useContext(AdminContext)
  const { calculateAge } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getAllUsers()
    }
  }, [aToken])

  return (
    <div className='m-5 max-w-6xl w-full'>
      <p className='mb-3 text-lg font-medium text-gray-700'>Danh sách người dùng ({users.length})</p>
      
      <div className='bg-white border rounded-xl overflow-hidden shadow-sm'>
        
        {/* Header */}
        <div className='hidden sm:grid grid-cols-[0.5fr_1fr_2fr_1.5fr_1fr_1fr] gap-2 py-3 px-6 border-b bg-gray-50 font-semibold text-gray-600 text-sm'>
          <p>#</p>
          <p>Avatar</p>
          <p>Họ tên</p>
          <p>Email</p>
          <p>Tuổi</p>
          <p>Trạng thái</p>
        </div>

        {/* List */}
        <div className='min-h-[50vh]'>
            {users.map((item, index) => (
            <div className='flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_1fr_2fr_1.5fr_1fr_1fr] gap-2 items-center py-3 px-6 border-b hover:bg-gray-50 text-sm text-gray-600' key={index}>
                <p className='max-sm:hidden'>{index + 1}</p>
                
                <div className='flex items-center'>
                    <img className='w-10 h-10 rounded-full object-cover border' src={item.image} alt="" />
                </div>
                
                <p className='font-medium text-gray-800'>{item.name}</p>
                <p>{item.email}</p>
                <p>{item.dob ? calculateAge(item.dob) : '--'}</p>

                {/* Nút Block/Active */}
                <div className='flex items-center gap-2'>
                    {item.isBlocked ? (
                         <button onClick={() => changeUserStatus(item._id)} className='px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium border border-red-200 hover:bg-red-200 transition-colors'>
                             Đã khóa 🔒
                         </button>
                    ) : (
                        <button onClick={() => changeUserStatus(item._id)} className='px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium border border-green-200 hover:bg-green-200 transition-colors'>
                             Hoạt động ✅
                        </button>
                    )}
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default AllUsers