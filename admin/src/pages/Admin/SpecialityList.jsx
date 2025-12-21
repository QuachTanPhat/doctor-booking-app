import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import SpecialityModal from './SpecialityModal';

const SpecialityList = () => {
    const { specialities, aToken, getAllSpecialities, deleteSpeciality } = useContext(AdminContext);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);

    useEffect(() => {
        if (aToken) getAllSpecialities();
    }, [aToken]);

    // Format ngày giờ: 19:14:59 22/11/2025
    const formatDate = (isoString) => {
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

    const filteredList = specialities.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='m-5 w-full'>
            {/* --- HEADER --- */}
            <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
                <div className="relative w-full sm:w-96">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên chuyên khoa" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                
                <div className="flex gap-2">
                     <button onClick={() => { setEditData(null); setShowModal(true); }} className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2'>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Thêm chuyên khoa
                    </button>
                    <button className='border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2'>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                        Lọc
                    </button>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden'>
                {/* Header Table */}
                <div className='hidden lg:grid grid-cols-[50px_80px_1.5fr_2fr_1fr_1fr_60px] gap-4 py-3 px-6 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider items-center'>
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <p>Ảnh</p>
                    <p>Tên chuyên khoa</p>
                    <p>Mô tả</p>
                    <p>Ngày tạo</p>
                    <p>Ngày cập nhật</p>
                    <p className='text-center'>#</p>
                </div>

                {/* Body Table */}
                <div className='max-h-[70vh] overflow-y-auto divide-y divide-gray-100'>
                    {filteredList.map((item) => (
                        <div key={item._id} className='grid grid-cols-1 lg:grid-cols-[50px_80px_1.5fr_2fr_1fr_1fr_60px] gap-4 py-4 px-6 hover:bg-blue-50/50 transition-colors items-center text-sm text-gray-700 relative group'>
                             <div className="hidden lg:block">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                             </div>
                            
                            {/* Mobile View Label */}
                            <div className="flex items-center gap-4 lg:contents">
                                <img className='w-12 h-12 rounded-lg object-cover bg-gray-100 border' src={item.image} alt="" />
                                <div className="lg:hidden">
                                    <p className='font-semibold text-gray-900'>{item.name}</p>
                                    <p className='text-xs text-gray-500 truncate max-w-[200px]'>{item.description}</p>
                                </div>
                            </div>

                            <p className='font-semibold text-gray-900 hidden lg:block'>{item.name}</p>
                            <p className='text-gray-500 truncate hidden lg:block pr-4' title={item.description}>{item.description || 'Chưa có mô tả'}</p>
                            
                            <div className="hidden lg:block text-xs text-gray-500">
                                {item.createdAt ? formatDate(item.createdAt) : '--'}
                            </div>
                            <div className="hidden lg:block text-xs text-gray-500">
                                {item.updatedAt ? formatDate(item.updatedAt) : '--'}
                            </div>

                            {/* Action Menu (3 Dots) */}
                            <div className='relative flex justify-center'>
                                <button onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)} className='p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all'>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                                </button>
                                
                                {openMenuId === item._id && (
                                    <div className="absolute right-8 top-0 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-10 py-1 animate-fadeIn origin-top-right">
                                        <button onClick={() => handleEdit(item)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">Sửa</button>
                                        <button onClick={() => handleDelete(item._id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Xóa</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {filteredList.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            Không tìm thấy chuyên khoa nào.
                        </div>
                    )}
                </div>
                
                {/* Footer Pagination (Giống ảnh) */}
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <span>Số bản ghi mỗi trang</span>
                        <select className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-blue-500">
                            <option>10</option>
                            <option>20</option>
                            <option>50</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Trang 1 trên 1</span>
                        <div className="flex gap-1">
                            <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-50" disabled>&laquo;</button>
                            <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-50" disabled>&lsaquo;</button>
                            <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-50" disabled>&rsaquo;</button>
                            <button className="p-1 rounded hover:bg-gray-200 disabled:opacity-50" disabled>&raquo;</button>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && <SpecialityModal onClose={() => setShowModal(false)} initialData={editData} />}
        </div>
    );
};

export default SpecialityList;