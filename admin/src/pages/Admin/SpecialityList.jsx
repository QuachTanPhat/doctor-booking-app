import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import SpecialityModal from './SpecialityModal';

const SpecialityList = () => {
    const { specialities, aToken, getAllSpecialities, deleteSpeciality } = useContext(AdminContext);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);

    // --- STATE PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        if (aToken) getAllSpecialities();
    }, [aToken]);

    const formatDate = (isoString) => {
        if (!isoString) return '--';
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', { hour12: false }) + ' ' + date.toLocaleDateString('vi-VN');
    }

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc muốn xóa chuyên khoa này?")) {
            deleteSpeciality(id);
            setOpenMenuId(null);
        }
    };

    const handleEdit = (item) => {
        setEditData(item);
        setShowModal(true);
        setOpenMenuId(null);
    }

    // --- LOGIC LỌC VÀ PHÂN TRANG ---
    const filteredList = specialities.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset về trang 1 khi tìm kiếm
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);

    return (
        <div className='m-5 w-full'>
            {/* --- HEADER --- */}
            <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
                <div className="relative w-full sm:w-96">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên chuyên khoa..." 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                
                {/* Đã xóa nút Lọc, chỉ giữ nút Thêm */}
                <button onClick={() => { setEditData(null); setShowModal(true); }} className='bg-primary text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-primary/90 transition-all flex items-center gap-2'>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Thêm chuyên khoa
                </button>
            </div>

            {/* --- TABLE --- */}
            <div className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden'>
                {/* Header Table - Đã xóa cột checkbox & chỉnh lại Grid */}
                <div className='hidden lg:grid grid-cols-[80px_1.5fr_2fr_1fr_1fr_60px] gap-4 py-3 px-6 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider items-center'>
                    <p>Ảnh</p>
                    <p>Tên chuyên khoa</p>
                    <p>Mô tả</p>
                    <p>Ngày tạo</p>
                    <p>Ngày cập nhật</p>
                    <p className='text-center'>#</p>
                </div>

                {/* Body Table */}
                <div className='min-h-[50vh] divide-y divide-gray-100'>
                    {currentItems.length > 0 ? currentItems.map((item) => (
                        <div key={item._id} className='grid grid-cols-1 lg:grid-cols-[80px_1.5fr_2fr_1fr_1fr_60px] gap-4 py-4 px-6 hover:bg-blue-50/30 transition-colors items-center text-sm text-gray-700 relative group'>
                            
                            {/* Mobile View Combine */}
                            <div className="flex items-center gap-4 lg:contents">
                                <img className='w-14 h-14 rounded-lg object-cover bg-gray-100 border shadow-sm' src={item.image} alt="" />
                                <div className="lg:hidden">
                                    <p className='font-semibold text-gray-900 text-base'>{item.name}</p>
                                    <p className='text-xs text-gray-500 line-clamp-2 mt-1'>{item.description}</p>
                                </div>
                            </div>

                            <p className='font-semibold text-gray-900 hidden lg:block text-base'>{item.name}</p>
                            <p className='text-gray-500 truncate hidden lg:block pr-4' title={item.description}>{item.description || <span className='italic text-gray-400'>Chưa có mô tả</span>}</p>
                            
                            <div className="hidden lg:block text-xs text-gray-500">
                                {item.createdAt ? formatDate(item.createdAt) : '--'}
                            </div>
                            <div className="hidden lg:block text-xs text-gray-500">
                                {item.updatedAt ? formatDate(item.updatedAt) : '--'}
                            </div>

                            {/* Action Menu (3 Dots) */}
                            <div className='relative flex justify-center'>
                                <button onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)} className='p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all'>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                                </button>
                                
                                {openMenuId === item._id && (
                                    <div className="absolute right-8 top-0 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-10 py-1 animate-fadeIn origin-top-right">
                                        <button onClick={() => handleEdit(item)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                                            <span>✏️</span> Chỉnh sửa
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                                            <span>🗑️</span> Xóa bỏ
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                           <div className='bg-gray-100 p-4 rounded-full mb-3'>
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           </div>
                           <p>Không tìm thấy chuyên khoa nào.</p>
                        </div>
                    )}
                </div>
                
                {/* Footer Pagination - Đã kích hoạt chức năng */}
                <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 gap-4">
                    <div className="flex items-center gap-2">
                        <span>Hiển thị</span>
                        <select 
                            className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>bản ghi</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span>Trang {currentPage} trên {totalPages || 1}</span>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setCurrentPage(1)} 
                                disabled={currentPage === 1}
                                className="p-1.5 border rounded hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all"
                            >
                                &laquo;
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                disabled={currentPage === 1}
                                className="p-1.5 border rounded hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all"
                            >
                                &lsaquo;
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-1.5 border rounded hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all"
                            >
                                &rsaquo;
                            </button>
                            <button 
                                onClick={() => setCurrentPage(totalPages)} 
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-1.5 border rounded hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-all"
                            >
                                &raquo;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && <SpecialityModal onClose={() => setShowModal(false)} initialData={editData} />}
        </div>
    );
};

export default SpecialityList;