import React, { useState, useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';

const DoctorModal = ({ onClose, initialData }) => {
    // 1. Lấy updateDoctor và specialities từ Context
    const { specialities, getAllSpecialities, updateDoctor, addDoctor } = useContext(AdminContext); // Giả sử bạn có hàm addDoctor trong context luôn, nếu chưa thì gọi axios trực tiếp cũng được

    const [docImg, setDocImg] = useState(false);
    const [name, setName] = useState(initialData?.name || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [password, setPassword] = useState('');
    const [experience, setExperience] = useState(initialData?.experience || '1 Năm');
    const [fees, setFees] = useState(initialData?.fees || '');
    const [about, setAbout] = useState(initialData?.about || '');
    const [speciality, setSpeciality] = useState(initialData?.speciality || ''); 
    const [degree, setDegree] = useState(initialData?.degree || '');
    const [address1, setAddress1] = useState(initialData?.address?.line1 || '');
    const [address2, setAddress2] = useState(initialData?.address?.line2 || '');

    const isEditMode = !!initialData;

    // Load danh sách chuyên khoa khi mở modal
    useEffect(() => {
        getAllSpecialities();
    }, []);

    // Set chuyên khoa mặc định nếu chưa chọn
    useEffect(() => {
        if (!speciality && specialities.length > 0 && !initialData) {
            setSpeciality(specialities[0].name);
        }
    }, [specialities, initialData, speciality]);

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        try {
            if (!docImg && !isEditMode) {
                return toast.error('Chưa chọn ảnh đại diện');
            }

            const formData = new FormData();
            
            // Nếu có ảnh mới thì gửi, không thì thôi
            if(docImg) formData.append('image', docImg);
            
            formData.append('name', name);
            formData.append('experience', experience);
            formData.append('fees', Number(fees));
            formData.append('about', about);
            formData.append('speciality', speciality);
            formData.append('degree', degree);
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));

            if (isEditMode) {
                // --- LOGIC SỬA: DÙNG HÀM updateDoctor TỪ CONTEXT ---
                formData.append('docId', initialData._id); // Gửi thêm ID để biết sửa ai
                
                const success = await updateDoctor(formData); // Gọi hàm từ Context
                
                if (success) {
                    onClose();
                }
            } else {
                // --- LOGIC THÊM MỚI ---
                formData.append('email', email);
                formData.append('password', password);
              
                 const { AdminContext } = await import('../../context/AdminContext'); // Lazy import trick if needed, but better use context
                
            }

        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={onSubmitHandler} className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <p className="text-xl font-semibold text-gray-800">
                        {isEditMode ? 'Cập Nhật Thông Tin Bác Sĩ' : 'Thêm Bác Sĩ Mới'}
                    </p>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
                </div>

                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8 text-gray-500">
                        <label htmlFor="doc-img">
                            <img 
                                className="w-20 h-20 bg-gray-100 rounded-full object-cover cursor-pointer border hover:border-primary" 
                                src={docImg ? URL.createObjectURL(docImg) : (initialData?.image || assets.upload_area)} 
                                alt="" 
                            />
                        </label>
                        <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
                        <p className="font-medium">Tải ảnh đại diện <br /> <span className="text-xs text-gray-400">(Nhấp vào ảnh để thay đổi)</span></p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Cột Trái */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Tên bác sĩ</label>
                                <input onChange={(e) => setName(e.target.value)} value={name} className="border rounded px-3 py-2 outline-primary" type="text" placeholder="Nhập tên" required />
                            </div>
                            
                            {!isEditMode && (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium">Email</label>
                                        <input onChange={(e) => setEmail(e.target.value)} value={email} className="border rounded px-3 py-2 outline-primary" type="email" placeholder="Nhập email" required />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium">Mật khẩu</label>
                                        <input onChange={(e) => setPassword(e.target.value)} value={password} className="border rounded px-3 py-2 outline-primary" type="password" placeholder="Nhập mật khẩu" required />
                                    </div>
                                </>
                            )}
                             <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Phí khám ($)</label>
                                <input onChange={(e) => setFees(e.target.value)} value={fees} className="border rounded px-3 py-2 outline-primary" type="number" required />
                            </div>
                             <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Kinh nghiệm</label>
                                <select onChange={(e) => setExperience(e.target.value)} value={experience} className="border rounded px-3 py-2 outline-primary">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                                        <option key={item} value={`${item} Năm`}>{item} Năm</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Cột Phải */}
                        <div className="flex flex-col gap-4">
                            {/* --- SELECT CHUYÊN KHOA ĐỘNG (Lấy từ DB) --- */}
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Chuyên khoa</label>
                                <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className="border rounded px-3 py-2 outline-primary">
                                    {specialities && specialities.length > 0 ? (
                                        specialities.map((item, index) => (
                                            <option key={index} value={item.name}>{item.name}</option>
                                        ))
                                    ) : (
                                        <option value="">Đang tải danh sách...</option>
                                    )}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Bằng cấp</label>
                                <input onChange={(e) => setDegree(e.target.value)} value={degree} className="border rounded px-3 py-2 outline-primary" type="text" placeholder="Ví dụ: MBBS" required />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Địa chỉ</label>
                                <input onChange={(e) => setAddress1(e.target.value)} value={address1} className="border rounded px-3 py-2 mb-2 outline-primary" type="text" placeholder="Địa chỉ dòng 1" required />
                                <input onChange={(e) => setAddress2(e.target.value)} value={address2} className="border rounded px-3 py-2 outline-primary" type="text" placeholder="Địa chỉ dòng 2" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="text-sm font-medium mb-2 block">Giới thiệu</label>
                        <textarea onChange={(e) => setAbout(e.target.value)} value={about} className="w-full px-4 py-2 border rounded outline-primary" rows={4} placeholder="Viết giới thiệu..." required />
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl sticky bottom-0">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all">
                        Hủy bỏ
                    </button>
                    <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-md">
                        {isEditMode ? 'Lưu thay đổi' : 'Thêm bác sĩ'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DoctorModal;