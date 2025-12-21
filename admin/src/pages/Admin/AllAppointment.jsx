import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from '../../assets/assets'

const AllAppointment = () => {
  // Lấy thêm hàm approveAppointment
  const { aToken, appointments, getAllAppointments, cancelAppointment, completeAppointment, deleteAppointment, approveAppointment } = useContext(AdminContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  // ... (Phần state filter/pagination giữ nguyên như cũ) ...
  const [filterText, setFilterText] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { if (aToken) getAllAppointments() }, [aToken]);

  // ... (Logic Filter & Pagination giữ nguyên) ...
  // (Copy lại đoạn logic useEffect filter và logic pagination ở bài trước)
  useEffect(() => {
    if (appointments) {
        const lowerText = filterText.toLowerCase();
        const filtered = appointments.filter(item => 
            item.userData.name.toLowerCase().includes(lowerText) || 
            item.docData.name.toLowerCase().includes(lowerText)
        );
        setFilteredList(filtered.reverse());
        setCurrentPage(1); 
    }
  }, [appointments, filterText]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  // Xử lý thay đổi trạng thái từ Dropdown
  const handleStatusChange = (e, item) => {
      const value = e.target.value;
      
      if (value === 'approved') {
          if(window.confirm("Xác nhận duyệt lịch hẹn này?")) {
              approveAppointment(item._id);
          }
      } else if (value === 'completed') {
          if(window.confirm("Xác nhận bệnh nhân đã khám xong?")) {
              completeAppointment(item._id);
          }
      } else if (value === 'cancelled') {
          if(window.confirm("Bạn muốn hủy lịch hẹn này?")) {
              cancelAppointment(item._id);
          }
      }
      // Reset về giá trị cũ nếu user bấm Cancel trong confirm (React sẽ tự re-render khi props không đổi)
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <p className="text-xl font-medium text-gray-700">Quản Lý Lịch Hẹn</p>
          {/* Ô tìm kiếm giữ nguyên */}
          <div className="relative w-full sm:w-80">
            <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-primary transition-all"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />
             {/* Icon search */}
          </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {/* HEADER: Thêm cột Trạng thái */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_0.5fr_2fr_1.5fr_2fr_1fr_1.5fr_0.5fr] grid-flow-col py-4 px-6 bg-gray-50 border-b font-semibold text-gray-600 text-sm">
          <p>#</p>
          <p>Bệnh nhân</p>
          <p>Tuổi</p>
          <p>Lịch khám</p>
          <p>Ngày đặt</p>
          <p>Bác sĩ</p>
          <p>Phí</p>
          <p>Trạng thái</p>
          <p className="text-center">Xóa</p>
        </div>

        <div className="min-h-[50vh]">
            {currentItems.length > 0 ? currentItems.map((item, index) => (
            <div className="flex flex-wrap justify-between max-sm:gap-4 sm:grid sm:grid-cols-[0.5fr_2fr_0.5fr_2fr_1.5fr_2fr_1fr_1.5fr_0.5fr] items-center text-gray-600 py-4 px-6 border-b hover:bg-gray-50 transition-colors text-sm" key={item._id}>
                <p className="max-sm:hidden">{indexOfFirstItem + index + 1}</p>
                {/* ... Các cột thông tin Bệnh nhân, Tuổi, Lịch khám, Ngày đặt, Bác sĩ, Phí... GIỮ NGUYÊN ... */}
                <div className="flex items-center gap-3">
                    <img className="w-9 h-9 rounded-full object-cover border" src={item.userData.image} alt="" /> 
                    <span className="font-medium text-gray-800 truncate">{item.userData.name}</span>
                </div>
                <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
                <div>
                    <p className="font-medium text-gray-800">{slotDateFormat(item.slotDate)}</p>
                    <p className="text-xs text-gray-500">{item.slotTime}</p>
                </div>
                <p className="text-xs text-gray-500">{(new Date(item.date)).toLocaleDateString()}</p>
                <div className="flex items-center gap-2">
                    <img className="w-6 h-6 rounded-full bg-gray-200" src={item.docData.image} alt="" /> 
                    <p className="truncate max-w-[100px]" title={item.docData.name}>{item.docData.name}</p>
                </div>
                <p className="font-medium">{item.amount.toLocaleString()} {currency}</p>

                {/* --- CỘT TRẠNG THÁI (DROPDOWN) --- */}
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
                            <option value="pending" disabled>⏳ Chờ xác nhận</option>
                            <option value="approved">✅ Đã xác nhận</option>
                            <option value="completed">🎉 Hoàn thành</option>
                            <option value="cancelled">❌ Hủy lịch</option>
                        </select>
                    )}
                </div>

                {/* Cột Xóa vĩnh viễn (Luôn hiện để dọn rác) */}
                <div className="text-center">
                    <button onClick={() => { if(window.confirm("Xóa vĩnh viễn?")) deleteAppointment(item._id) }} className="p-2 text-gray-400 hover:text-red-600 transition">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
            )) : (
                <div className="flex justify-center items-center h-40 text-gray-500">Không tìm thấy lịch hẹn.</div>
            )}
        </div>
        
        {/* Footer Phân trang (Giữ nguyên) */}
         <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            {/* ... code phân trang ... */}
        </div>
      </div>
    </div>
  );
};

export default AllAppointment;