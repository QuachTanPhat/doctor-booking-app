import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets' // Đảm bảo bạn có import các icon cần thiết (nếu có)

const DoctorProfile = () => {

    const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
    const { currency } = useContext(AppContext)

    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)
    const updateProfile = async () => {
        try {
            // Cập nhật thêm các trường dữ liệu mới vào object gửi đi
            const formData = new FormData()

            formData.append('name', profileData.name)
            formData.append('degree', profileData.degree)
            formData.append('experience', profileData.experience)
            formData.append('about', profileData.about)
            formData.append('fees', profileData.fees)
            formData.append('available', profileData.available)
            // Address cần stringify vì nó là object
            formData.append('address', JSON.stringify(profileData.address))
            if (image) {
                formData.append('image', image)
            }

            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', formData, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                setImage(false)
                setProfileData(prev => ({
                    ...prev,
                    image: data.image ? data.image : prev.image
                }))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    useEffect(() => {
        if (dToken) {
            getProfileData()
        }
    }, [dToken])

    return profileData && (
        <div className='w-full max-w-4xl mx-auto p-5'>
            <div className='flex flex-col gap-6'>

                {/* --- HEADER SECTION: IMAGE & MAIN INFO --- */}
                <div className='flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-2xl shadow-md border border-gray-100'>
                    {/* Image Area */}
                    <div className='w-full sm:w-1/3 flex justify-center sm:justify-start'>
                        <label htmlFor="doc-image" className='relative cursor-pointer group'>
                            <div className={`relative w-48 h-48 sm:w-60 sm:h-60 rounded-xl overflow-hidden shadow-sm bg-primary/10 ${isEdit ? 'cursor-pointer' : 'cursor-default'}`}>
                                <img
                                    className={`w-full h-full object-cover transition-opacity ${isEdit ? 'group-hover:opacity-60' : ''}`}
                                    // Nếu có ảnh mới chọn thì hiện preview, không thì hiện ảnh cũ
                                    src={image ? URL.createObjectURL(image) : profileData.image}
                                    alt="Doctor Avatar"
                                />

                                {/* Icon Upload hiện khi hover (chỉ ở chế độ edit) */}
                                {isEdit && (
                                    <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20'>
                                        <img className='w-10 h-10 bg-white p-2 rounded-full' src={assets.upload_icon} alt="Upload" />
                                    </div>
                                )}
                            </div>

                            {/* Input ẩn chỉ hoạt động khi isEdit = true */}
                            {isEdit && (
                                <input
                                    onChange={(e) => setImage(e.target.files[0])}
                                    type="file"
                                    id="doc-image"
                                    hidden
                                />
                            )}
                        </label>
                    </div>

                    {/* Basic Info Area */}
                    <div className='flex-1 flex flex-col justify-center'>
                        {/* Name */}
                        {isEdit ? (
                            <input
                                type="text"
                                className='bg-gray-50 text-3xl font-bold mb-2 outline-none border-b-2 border-gray-300 focus:border-primary px-2 py-1 w-full'
                                value={profileData.name}
                                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        ) : (
                            <p className='text-3xl font-bold text-gray-800 mb-2'>{profileData.name}</p>
                        )}

                        {/* Degree & Speciality & Experience */}
                        <div className='flex flex-wrap items-center gap-2 text-gray-600 mb-4'>
                            {isEdit ? (
                                <input
                                    type="text"
                                    className='bg-gray-50 border rounded px-2 py-1 text-sm outline-primary w-24'
                                    value={profileData.degree}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, degree: e.target.value }))}
                                />
                            ) : (
                                <span className='font-medium'>{profileData.degree}</span>
                            )}
                            <span>-</span>
                            <span className='font-medium'>{profileData.speciality}</span>

                            {/* --- PHẦN KINH NGHIỆM ĐÃ SỬA --- */}
                            {isEdit ? (
                                <div className='flex items-center gap-1'>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Số năm"
                                        className='bg-gray-50 border rounded px-2 py-1 text-sm outline-primary w-20'
                                        // Logic: Lấy số từ chuỗi "X Năm" để hiển thị (Xóa chữ ' Năm' đi để hiện số)
                                        value={profileData.experience.toString().replace(/[^0-9]/g, '')}
                                        // Logic: Khi nhập số, tự động ghép thêm chữ " Năm" vào state
                                        onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value + " Năm" }))}
                                    />
                                    <span className='text-sm'>Năm</span>
                                </div>
                            ) : (
                                <span className='py-0.5 px-2 border text-xs rounded-full bg-gray-50 text-gray-700 shadow-sm'>
                                    {profileData.experience}
                                </span>
                            )}
                            {/* ------------------------------- */}
                        </div>

                        {/* About Section */}
                        <div className='mt-2'>
                            <p className='text-sm font-semibold text-gray-900 mb-1'>Giới thiệu:</p>
                            {isEdit ? (
                                <textarea
                                    className='w-full bg-gray-50 border rounded-lg p-3 text-sm outline-primary resize-none'
                                    rows={4}
                                    value={profileData.about}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                                />
                            ) : (
                                <p className='text-sm text-gray-600 leading-relaxed'>{profileData.about}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- DETAILS SECTION: FEES, ADDRESS, AVAILABILITY --- */}
                <div className='bg-white p-6 rounded-2xl shadow-md border border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-800 mb-4 border-b pb-2'>Thông tin chi tiết</h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='flex items-center gap-3'>
                                <p className='text-gray-600 w-24 font-medium'>Giá khám:</p>
                                {isEdit ? (
                                    <input
                                        type="number"
                                        className='bg-gray-50 border rounded px-3 py-1 w-32 outline-primary'
                                        value={profileData.fees}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                                    />
                                ) : (
                                    <span className='text-gray-800 font-semibold'>{new Intl.NumberFormat().format(profileData.fees)} {currency}</span>
                                )}
                            </div>

                            <div className='flex items-start gap-3'>
                                <p className='text-gray-600 w-24 font-medium mt-1'>Địa chỉ:</p>
                                <div className='flex-1 space-y-2'>
                                    {isEdit ? (
                                        <>
                                            <input
                                                type="text"
                                                className='w-full bg-gray-50 border rounded px-3 py-1 outline-primary'
                                                value={profileData.address.line1}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                                                placeholder="Địa chỉ dòng 1"
                                            />
                                            <input
                                                type="text"
                                                className='w-full bg-gray-50 border rounded px-3 py-1 outline-primary'
                                                value={profileData.address.line2}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                                                placeholder="Địa chỉ dòng 2"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <p className='text-gray-800'>{profileData.address.line1}</p>
                                            <p className='text-gray-800'>{profileData.address.line2}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-4'>
                            <div className='flex items-center gap-3'>
                                <p className='text-gray-600 font-medium'>Trạng thái:</p>
                                <div className='flex items-center gap-2'>
                                    <input
                                        type="checkbox"
                                        checked={profileData.available}
                                        onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
                                        id="available-switch"
                                        className={`w-5 h-5 cursor-pointer ${!isEdit && 'pointer-events-none opacity-60'}`}
                                    />
                                    <label
                                        htmlFor="available-switch"
                                        className={`font-medium ${profileData.available ? 'text-green-600' : 'text-red-500'} cursor-pointer ${!isEdit && 'cursor-default'}`}
                                    >
                                        {profileData.available ? 'Đang hoạt động' : 'Tạm ngưng'}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className='mt-8 flex justify-end'>
                        {isEdit ? (
                            <div className='flex gap-3'>
                                <button
                                    onClick={() => { setIsEdit(false); getProfileData() }}
                                    className='px-6 py-2.5 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition-all font-medium'
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={updateProfile}
                                    className='px-8 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md font-medium'
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEdit(true)}
                                className='px-8 py-2.5 border border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-all font-medium'
                            >
                                Chỉnh sửa hồ sơ
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default DoctorProfile