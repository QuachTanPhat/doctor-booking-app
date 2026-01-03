import React, { useState, useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';

const SpecialityModal = ({ onClose, initialData }) => {
    const { backendUrl, aToken, getAllSpecialities, updateSpeciality } = useContext(AdminContext);

    const [image, setImage] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
        }
    }, [initialData]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            if (initialData) {
                // Logic Sửa
                await updateSpeciality(initialData._id, name, description, image);
                onClose();
            } else {
                // Logic Thêm
                if (!image) return toast.error('Vui lòng chọn ảnh');
                const formData = new FormData();
                formData.append('image', image);
                formData.append('name', name);
                formData.append('description', description);

                const { data } = await axios.post(backendUrl + '/api/admin/add-speciality', formData, { headers: { aToken } });
                if (data.success) {
                    toast.success(data.message);
                    getAllSpecialities();
                    onClose();
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Hàm helper reset lỗi khi nhập
    const handleInput = (e) => e.target.setCustomValidity('');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={onSubmitHandler} className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-fadeIn">
                <div className="flex justify-between items-center p-5 border-b">
                    <p className="text-lg font-semibold">{initialData ? 'Cập Nhật Chuyên Khoa' : 'Thêm Chuyên Khoa'}</p>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
                </div>

                <div className="p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                        <label htmlFor="spec-img" className="cursor-pointer group relative">
                            <img 
                                className="w-20 h-20 rounded-lg object-cover border bg-gray-50 group-hover:opacity-75 transition-all" 
                                src={image ? URL.createObjectURL(image) : (initialData?.image || assets.upload_area)} 
                                alt="" 
                            />
                             <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all">
                                <span className="text-white opacity-0 group-hover:opacity-100 text-xs">Đổi ảnh</span>
                             </div>
                        </label>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="spec-img" hidden />
                        <div>
                            <p className="font-medium text-gray-700">Ảnh đại diện</p>
                            <p className="text-xs text-gray-500">Hỗ trợ JPG, PNG</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Tên chuyên khoa <span className="text-red-500">*</span></label>
                        <input 
                            onChange={(e) => setName(e.target.value)} 
                            value={name} 
                            className="border border-gray-300 rounded-lg px-3 py-2 outline-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                            type="text" 
                            placeholder="Ví dụ: Tim mạch" 
                            required 
                           
                            onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập tên chuyên khoa')}
                            onInput={handleInput}
                            
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Mô tả</label>
                        <textarea 
                            onChange={(e) => setDescription(e.target.value)} 
                            value={description} 
                            className="border border-gray-300 rounded-lg px-3 py-2 outline-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
                            rows={3} 
                            placeholder="Mô tả về chuyên khoa..." 
                            required
                            onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập mô tả')}
                            onInput={handleInput}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-5 border-t bg-gray-50 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-100 transition-all">Hủy</button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md transition-all">
                        {initialData ? 'Lưu thay đổi' : 'Thêm mới'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SpecialityModal;