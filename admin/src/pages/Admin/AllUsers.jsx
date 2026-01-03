import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllUsers = () => {

  const { aToken, users, getAllUsers, changeUserStatus, deleteUser } = useContext(AdminContext)
  const { calculateAge } = useContext(AppContext) 

  const [filterText, setFilterText] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  useEffect(() => {
    if (aToken) {
      getAllUsers()
    }
  }, [aToken])

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN'); 
  }

  const handleDeleteUser = (userId) => {
    if(window.confirm("CẢNH BÁO: Xóa người dùng sẽ mất toàn bộ dữ liệu lịch sử khám.\nBạn chắc chắn muốn xóa?")) {
        deleteUser(userId);
    }
  }

  useEffect(() => {
    if (users) {
        const lowerText = filterText.toLowerCase();
        const filtered = users.filter(item => 
            item.name.toLowerCase().includes(lowerText) || 
            item.email.toLowerCase().includes(lowerText) ||
            (item.username && item.username.toLowerCase().includes(lowerText)) ||
            (item.phone && item.phone.includes(lowerText))
        );
        setFilteredList(filtered.reverse()); 
        setCurrentPage(1); 
    }
  }, [users, filterText]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  return (
    <div className='m-5 max-w-7xl w-full'>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <p className='text-lg font-medium text-gray-700'>Danh sách người dùng</p>
          <div className="relative w-full sm:w-80">
            <input 
                type="text" 
                placeholder="Tìm tên, username, email hoặc sđt..." 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-primary transition-all"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />
             <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
      </div>
      
      <div className='bg-white border rounded-xl overflow-hidden shadow-sm'>
        
        {/* --- Header --- */}
        <div className='hidden sm:grid grid-cols-[0.5fr_1fr_2fr_1.5fr_2fr_1.5fr_0.8fr_1fr_1fr] gap-2 py-3 px-6 border-b bg-gray-50 font-semibold text-gray-600 text-sm'>
          <p>#</p>
          <p>Avatar</p>
          <p>Họ tên</p>
          <p>Tên tài khoản</p>
          <p>Email</p>
          <p>Số điện thoại</p>
          <p>Tuổi</p>
          <p>Ngày tạo</p>
          <p>Hành động</p>
        </div>

        {/* --- Body --- */}
        <div className='min-h-[50vh]'>
            {currentItems.length > 0 ? currentItems.map((item, index) => (
            
            <div className='flex flex-wrap justify-between sm:grid sm:grid-cols-[0.5fr_1fr_2fr_1.5fr_2fr_1.5fr_0.8fr_1fr_1fr] gap-2 items-center py-3 px-6 border-b hover:bg-gray-50 text-sm text-gray-600' key={index}>
                
                <p className='max-sm:hidden'>{indexOfFirstItem + index + 1}</p>
                
                <div className='flex items-center'>
                    <img className='w-10 h-10 rounded-full object-cover border' src={item.image} alt="" />
                </div>
                
                <p className='font-medium text-gray-800'>{item.name}</p>
                
                <p className='font-medium text-gray-600 truncate'>{item.username}</p>

                <p className='truncate'>{item.email}</p>

                <p className='truncate text-blue-600'>{item.phone || '--'}</p>
                
                <p>{item.dob ? calculateAge(item.dob) : '--'}</p>
                
                <p className='text-xs text-gray-500'>
                    {formatDate(item.createdAt || item.date)} 
                </p>

                <div className='flex items-center gap-2'>
                    {item.isBlocked ? (
                          <button onClick={() => changeUserStatus(item._id)} className='px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium border border-red-200 hover:bg-red-200 transition-colors w-24'>
                             Đã khoá
                          </button>
                    ) : (
                        <button onClick={() => changeUserStatus(item._id)} className='px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium border border-green-200 hover:bg-green-200 transition-colors w-24'>
                             Hoạt động
                        </button>
                    )}

                    <button 
                        onClick={() => handleDeleteUser(item._id)}
                        className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all'
                        title="Xóa vĩnh viễn"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>
            </div>
            )) : (
                <div className="flex justify-center items-center h-40 text-gray-500">
                    Không tìm thấy người dùng nào.
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
                Hiển thị {currentItems.length} trên tổng {filteredList.length} user
            </span>
            <div className="flex gap-2">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 text-sm"
                >
                    Trước
                </button>
                <span className="px-3 py-1 text-sm font-medium">{currentPage} / {totalPages || 1}</span>
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 text-sm"
                >
                    Sau
                </button>
            </div>
        </div>

      </div>
    </div>
  )
}

export default AllUsers