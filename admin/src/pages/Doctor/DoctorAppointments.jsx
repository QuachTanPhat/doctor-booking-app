import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {
  // Đảm bảo bạn đã có hàm approveAppointment trong DoctorContext (nếu bác sĩ được quyền duyệt)
  // Nếu chưa có, bạn chỉ cần dùng completeAppointment và cancelAppointment
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  // State tìm kiếm & Phân trang
  const [filterText, setFilterText] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  useEffect(() => {
    if (appointments) {
        const lowerText = filterText.toLowerCase();
        const filtered = appointments.filter(item => 
            item.userData.name.toLowerCase().includes(lowerText)
        );
        setFilteredList(filtered.reverse());
        setCurrentPage(1); 
    }
  }, [appointments, filterText]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const formatCreatedDate = (timestamp) => {
      if(!timestamp) return "--";
      const date = new Date(timestamp);
      return date.toLocaleDateString('vi-VN') + " " + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
  }

  // --- HÀM XỬ LÝ DROPDOWN (Giống Admin) ---
  const handleStatusChange = (e, item) => {
      const value = e.target.value;
      
      // Bác sĩ thường chỉ quan tâm đến việc Hoàn thành hoặc Hủy
      // Nếu bạn muốn Bác sĩ cũng có quyền "Duyệt" (Approve), bạn cần thêm hàm approveAppointment vào DoctorContext
      
      if (value === 'completed') {
          if(window.confirm("Xác nhận bệnh nhân đã khám xong?")) {
              completeAppointment(item._id);
          }
      } else if (value === 'cancelled') {
          if(window.confirm("Bạn muốn hủy lịch hẹn này?")) {
              cancelAppointment(item._id);
          }
      }
      // Lưu ý: Option 'approved' ở dưới đang để disabled vì thường Admin mới là người duyệt.
      // Nếu Bác sĩ cũng được duyệt, bạn mở disabled ra và gọi hàm approveAppointment(item._id)
  }

  return (
    <div className='w-full max-w-6xl m-5'>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <p className="text-xl font-medium text-gray-700">Lịch Hẹn Của Tôi</p>
          <div className="relative w-full sm:w-80">
            <input 
                type="text" 
                placeholder="Tìm tên bệnh nhân..." 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-primary transition-all"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />
             <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
      </div>

      <div className='bg-white border rounded-xl shadow-sm overflow-hidden'>
        
        <div className='hidden sm:grid grid-cols-[0.5fr_2fr_1fr_0.5fr_1.5fr_2fr_1fr_1.5fr] grid-flow-col py-4 px-6 bg-gray-50 border-b font-semibold text-gray-600 text-sm'>
          <p>#</p>
          <p>Bệnh nhân</p>
          <p>Thanh toán</p>
          <p>Tuổi</p>
          <p>Ngày đặt</p>
          <p>Thời gian khám</p>
          <p>Phí</p>
          <p>Trạng thái</p>
        </div>

        <div className='min-h-[50vh]'>
            {currentItems.length > 0 ? currentItems.map((item, index) => (
            <div 
                className='flex flex-wrap justify-between max-sm:gap-4 sm:grid sm:grid-cols-[0.5fr_2fr_1fr_0.5fr_1.5fr_2fr_1fr_1.5fr] items-center text-gray-600 py-4 px-6 border-b hover:bg-gray-50 transition-colors text-sm' 
                key={item._id}
            >
                <p className='max-sm:hidden'>{indexOfFirstItem + index + 1}</p>
                
                <div className='flex items-center gap-3'>
                  <img className='w-9 h-9 rounded-full object-cover border' src={item.userData.image} alt="" />
                  <span className='font-medium text-gray-800 truncate'>{item.userData.name}</span>
                </div>

                <div>
                   <span className={`px-2 py-1 rounded-full text-xs border ${item.paymentMethod === 'ONLINE' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {item.paymentMethod === 'ONLINE' ? 'Online' : 'Tiền mặt'}
                   </span>
                </div>

                <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
                <p className='text-xs text-gray-500'>{formatCreatedDate(item.date)}</p>
                
                <div>
                    <p className='font-medium text-gray-800'>{slotDateFormat(item.slotDate)}</p>
                    <p className='text-xs text-gray-500'>{item.slotTime}</p>
                </div>
                
                <p className='font-medium text-gray-700'>
                    {new Intl.NumberFormat('vi-VN').format(item.amount)} {currency}
                    {item.payment && <span className='block text-[10px] text-green-500'>(Đã TT)</span>}
                </p>

                {/* --- DROPDOWN TRẠNG THÁI (Giống Admin) --- */}
                <div>
                    {item.cancelled ? (
                        <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-medium border border-red-100">Đã hủy</span>
                    ) : item.isCompleted ? (
                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium border border-green-100">Hoàn thành</span>
                    ) : (
                        <select 
                            className={`border rounded-lg px-2 py-1 text-xs font-medium outline-none cursor-pointer
                            ${item.isApproved ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}
                            onChange={(e) => handleStatusChange(e, item)}
                            value={item.isApproved ? "approved" : "pending"}
                        >
                            {/* Option "Chờ xác nhận" */}
                            <option value="pending" disabled={item.isApproved}>
                                {item.isApproved ? "⏳ Chờ khám" : "⏳ Chờ duyệt"}
                            </option>
                            
                            {/* Option "Đã xác nhận" - Bác sĩ thường chỉ nhìn thấy khi Admin đã duyệt, nên thường không cần click chọn cái này */}
                            <option value="approved" disabled>✅ Đã duyệt</option>
                            
                            {/* Option "Hoàn thành" */}
                            <option value="completed">🎉 Hoàn thành</option>
                            
                            {/* Option "Hủy" */}
                            <option value="cancelled">❌ Hủy lịch</option>
                        </select>
                    )}
                </div>
            </div>
            )) : (
                 <div className="flex justify-center items-center h-40 text-gray-500">
                    Không tìm thấy lịch hẹn nào.
                </div>
            )}
        </div>

         <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
                Hiển thị {currentItems.length} trên tổng {filteredList.length} lịch hẹn
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

export default DoctorAppointments