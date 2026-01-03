import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import DoctorModal from './DoctorModal';
import { AppContext } from '../../context/AppContext';

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, deleteDoctor } = useContext(AdminContext);
  const { currency } = useContext(AppContext)
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số bác sĩ mỗi trang

  useEffect(() => {
    if (aToken) getAllDoctors();
  }, [aToken]);

  // Hàm Format Ngày
  const formatDate = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour12: false }) + ' ' + date.toLocaleDateString('vi-VN');
  }

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bác sĩ này không?")) {
      deleteDoctor(id);
      setOpenMenuId(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setShowModal(true);
  };

  const handleOpenEdit = (doctor) => {
    setEditingDoctor(doctor);
    setShowModal(true);
    setOpenMenuId(null);
  };

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.speciality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LOGIC TÍNH TOÁN PHÂN TRANG ---
  // Reset về trang 1 mỗi khi tìm kiếm thay đổi để tránh lỗi đang ở trang 2 mà tìm ra ít kết quả
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  return (
    <div className='m-5 w-full'>
      <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
        <div className='relative w-full sm:w-96'>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bác sĩ..."
            className='w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={handleOpenAdd} className='bg-primary text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:bg-primary/90 transition-all flex items-center gap-2'>
          + Thêm bác sĩ
        </button>
      </div>

      <div className='bg-white border rounded-xl shadow-sm overflow-hidden'>
        {/* --- Header Table --- */}
        <div className='hidden xl:grid grid-cols-[0.5fr_2fr_1.5fr_1fr_1fr_1.2fr_1.2fr_0.5fr] gap-4 py-4 px-6 bg-gray-50 border-b text-sm font-semibold text-gray-600'>
          <p>#</p>
          <p>Họ và tên</p>
          <p>Chuyên khoa</p>
          <p>Phí khám</p>
          <p>Trạng thái</p>
          <p>Ngày tạo</p>
          <p>Ngày cập nhật</p>
          <p className='text-center'>#</p>
        </div>

        {/* --- List Items (Đã thay filteredDoctors bằng currentItems) --- */}
        <div className='min-h-[50vh]'> {/* Thêm min-h để giữ form khi ít item */}
          {currentItems.length > 0 ? currentItems.map((item, index) => (
            <div key={item._id} className='grid grid-cols-1 xl:grid-cols-[0.5fr_2fr_1.5fr_1fr_1fr_1.2fr_1.2fr_0.5fr] gap-4 py-4 px-6 border-b hover:bg-gray-50 transition-colors items-center text-sm text-gray-700 relative'>

              {/* Tính số thứ tự chính xác dựa trên trang */}
              <p className='hidden xl:block text-gray-500'>#{indexOfFirstItem + index + 1}</p>

              <div className='flex items-center gap-3'>
                <img className='w-10 h-10 rounded-full object-cover border bg-gray-100' src={item.image} alt="" />
                <div>
                  <p className='font-medium text-gray-900'>{item.name}</p>
                  <p className='text-xs text-gray-500 xl:hidden'>{item.speciality}</p>
                </div>
              </div>

              <p className='hidden xl:block'>{item.speciality}</p>
              <p className='font-medium text-gray-900'>
                {new Intl.NumberFormat('vi-VN').format(item.fees)} {currency}
              </p>

              <div className='flex items-center gap-2'>
                <input onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} className='w-4 h-4 cursor-pointer accent-primary' />
                <span className={item.available ? 'text-green-600 font-medium' : 'text-gray-400'}>{item.available ? 'Sẵn sàng' : 'Nghỉ'}</span>
              </div>

              <p className='hidden xl:block text-xs text-gray-500'>{formatDate(item.createdAt)}</p>
              <p className='hidden xl:block text-xs text-gray-500'>{formatDate(item.updatedAt)}</p>

              <div className='relative action-menu-container flex justify-center'>
                <button onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)} className='p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-all'>
                  ...
                </button>
                {openMenuId === item._id && (
                  <div className='absolute right-0 top-full mt-2 w-36 bg-white border rounded-lg shadow-xl z-20 overflow-hidden animate-fadeIn'>
                    <button onClick={() => handleOpenEdit(item)} className='w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600'>Chỉnh sửa</button>
                    <button onClick={() => handleDelete(item._id)} className='w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t'>Xóa</button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="flex justify-center items-center h-40 text-gray-500">
              Không tìm thấy bác sĩ nào.
            </div>
          )}
        </div>

        {/* --- FOOTER: PHÂN TRANG (MỚI THÊM) --- */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Hiển thị {currentItems.length} trên tổng {filteredDoctors.length} bác sĩ
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

      {showModal && <DoctorModal onClose={() => setShowModal(false)} initialData={editingDoctor} />}
    </div>
  );
};

export default DoctorsList;