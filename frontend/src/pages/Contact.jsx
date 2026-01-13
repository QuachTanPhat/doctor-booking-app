import React, { useContext, useRef, useState, useEffect } from 'react' // Nhớ import useEffect
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { io } from 'socket.io-client'
const Contact = () => {
    const [activeQuestion, setActiveQuestion] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const { token, setIsChatOpen } = useContext(AppContext);
    const formRef = useRef(null);
    
    // 1. KHAI BÁO STATE (Đúng)
    const [faqs, setFaqs] = useState([]); 

    // 2. XÓA BỎ MẢNG "const faqs = [...]" CỨNG Ở ĐÂY ĐI NHÉ!
    // (Vì chúng ta sẽ lấy dữ liệu từ Backend đổ vào state ở trên)

    // 3. Hàm lấy dữ liệu
    const getFaqs = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/all-faqs'); 
            if (data.success) {
                // Nếu DB chưa có câu hỏi nào thì faqs sẽ rỗng, không sao cả
                setFaqs(data.faqs);
            }
        } catch (error) {
            console.log(error);
            // Không cần toast lỗi ở đây để tránh làm phiền user nếu chỉ là lỗi hiển thị
        }
    }

    useEffect(() => {
        getFaqs();
        const socket = io(backendUrl);
        socket.on('faq-updated', () => {
            getFaqs(); // Gọi lại API để cập nhật danh sách mới nhất
        });
        return () => {
            socket.disconnect();
        }
    }, [backendUrl]);

    const toggleQuestion = (index) => {
        setActiveQuestion(activeQuestion === index ? null : index);
    };

    // ... (Các phần handleMapClick, handleEmailClick, handleSubmit giữ nguyên) ...
    const handleMapClick = () => {
        window.open('https://www.google.com/maps/search/?api=1&query=Bệnh+viện+đa+khoa+Nha+Trang+Khánh+Hòa', '_blank');
    };

    const handleEmailClick = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: 'Tư vấn chung', message: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.name || !formData.email || !formData.message) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        try {
            const { data } = await axios.post(backendUrl + '/api/user/send-contact-email', formData);

            if (data.success) {
                toast.success("Đã gửi tin nhắn thành công! Vui lòng kiểm tra email.");
                setFormData({ name: '', email: '', phone: '', subject: 'Tư vấn chung', message: '' });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Gửi thất bại. Vui lòng thử lại sau.");
        }
    };

    const handleChatClick = () => {
        if (token) {
            setIsChatOpen(true);
        } else {
            toast.warning("Vui lòng đăng nhập để chat!");
            navigate('/login');
        }
    };

    return (
        <div className='pb-20'>
            {/* ... (Phần Header giữ nguyên) ... */}
            <div className='text-center pt-14 pb-10'>
                <div className='inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold mb-4'>
                    ● Chúng tôi luôn ở đây để hỗ trợ
                </div>
                <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
                    Liên Hệ <span className='text-blue-600'>Prescripto</span>
                </h1>
                <p className='text-gray-500 max-w-2xl mx-auto text-sm md:text-base'>
                    Kết nối với đội ngũ y tế của chúng tôi để được giải đáp thắc mắc hoặc hỗ trợ kịp thời.
                </p>
            </div>

            {/* ... (Phần 3 ô thông tin liên hệ giữ nguyên) ... */}
            <div className='max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20'>
               <div className='bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300'>
                    <div className='w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-blue-200 shadow-lg'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>Địa Chỉ Phòng Khám</h3>
                    <p className='text-gray-500 text-sm mb-6 leading-relaxed'>Số 79 Đường 23/10 <br /> TP. Nha Trang, Tỉnh Khánh Hòa</p>
                    <button onClick={handleMapClick} className='w-full py-3 bg-gray-50 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors'>Xem Bản Đồ</button>
                </div>
                <div className='bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300'>
                    <div className='w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-green-200 shadow-lg'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                        </svg>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>Hotline Tư Vấn</h3>
                    <p className='text-gray-500 text-sm mb-6 leading-relaxed'>0386 972 871 <br /> Hỗ trợ 24/7</p>
                    <button className='w-full py-3 bg-gray-50 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors'>Gọi Ngay</button>
                </div>
                <div className='bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300'>
                    <div className='w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-purple-200 shadow-lg'>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-7"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>Email Hỗ Trợ</h3>
                    <p className='text-gray-500 text-sm mb-6 leading-relaxed'>phat.qt.64cntt@ntu.edu.vn <br /> Phản hồi nhanh chóng</p>
                    <button onClick={handleEmailClick} className='w-full py-3 bg-gray-50 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors'>
                        Gửi Email
                    </button>
                </div>
            </div>

            {/* ... (Phần Form gửi tin nhắn giữ nguyên) ... */}
            <div className='max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24'>
                <div className='flex flex-col gap-8'>
                    <img className='w-full rounded-2xl object-cover h-[300px] lg:h-[400px] shadow-lg' src={assets.contact_image} alt="Doctor" />
                    <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
                        <div className='flex items-center gap-3 mb-4'>
                            <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <h3 className='font-bold text-lg text-gray-800'>Giờ Làm Việc</h3>
                        </div>
                        <div className='space-y-3 text-sm text-gray-600'>
                            <div className='flex justify-between border-b pb-2 border-gray-50'>
                                <span>Thứ 2 - Thứ 6</span>
                                <span className='font-medium'> 8:00 - 20:00</span>
                            </div>
                            <div className='flex justify-between border-b pb-2 border-gray-50'>
                                <span>Thứ 7</span>
                                <span className='font-medium'> 8:00 - 14:00</span>
                            </div>
                            <div className='flex justify-between pt-2'>
                                <span className='text-gray-800 font-medium'>Chủ Nhật</span>
                                <span className='font-medium text-red-500'>Không làm việc</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div ref={formRef} className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-8'>Gửi Tin Nhắn Cho Chúng Tôi</h2>
                    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder='Họ và tên của bạn' className='border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500' required />
                            <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder='Địa chỉ Email' className='border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500' required />
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder='Số điện thoại' className='border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500' />
                            <select name="subject" value={formData.subject} onChange={handleInputChange} className='border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 bg-white'>
                                <option value="Tư vấn chung">Tư vấn chung</option>
                                <option value="Đặt lịch hẹn">Đặt lịch hẹn</option>
                                <option value="Góp ý dịch vụ">Góp ý dịch vụ</option>
                            </select>
                        </div>
                          <textarea name="message" value={formData.message} onChange={handleInputChange} rows="4" placeholder='Nội dung cần hỗ trợ...' className='border border-gray-300 rounded-lg p-3 outline-none focus:border-blue-500 resize-none' required></textarea>

                          <button type="submit" className='bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200'>
                              Gửi Tin Nhắn
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
                          </button>
                    </form>
                </div>
            </div>

            <div className='max-w-4xl mx-auto px-4 mb-24'>
                <div className='text-center mb-10'>
                    <h2 className='text-3xl font-bold text-gray-900'>Câu Hỏi <span className='text-blue-600'>Thường Gặp</span></h2>
                    <p className='text-gray-500 mt-2'>Giải đáp nhanh các thắc mắc về dịch vụ của chúng tôi</p>
                </div>

                <div className='flex flex-col gap-4'>
                    {/* KIỂM TRA MẢNG FAQS RỖNG HAY KHÔNG TRƯỚC KHI MAP */}
                    {faqs && faqs.length > 0 ? (
                        faqs.map((faq, index) => (
                            <div key={index} className='bg-white border border-gray-200 rounded-xl overflow-hidden'>
                                <button 
                                    onClick={() => toggleQuestion(index)}
                                    className='w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition-colors'
                                >
                                    <span className='font-semibold text-gray-800 text-lg'>{faq.question}</span>
                                    <div className={`w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center transition-transform duration-300 ${activeQuestion === index ? 'rotate-180' : ''}`}>
                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                         </svg>
                                    </div>
                                </button>
                                
                                <div className={`transition-all duration-300 ease-in-out ${activeQuestion === index ? 'max-h-40 opacity-100 p-6 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                    <p className='text-gray-600 leading-relaxed'>{faq.answer}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">Đang cập nhật câu hỏi...</p>
                    )}
                </div>
            </div>

            {/* ... (Phần Nút cấp cứu giữ nguyên) ... */}
            <div className='max-w-6xl mx-auto px-4'>
                <div className='bg-blue-50 rounded-2xl p-8 md:p-12 flex flex-col items-center text-center'>
                    <h2 className='text-2xl font-bold text-gray-800 mb-2'>Cần Hỗ Trợ Khẩn Cấp?</h2>
                    <p className='text-gray-600 mb-8'>Đội ngũ trực ban 24/7 sẵn sàng hỗ trợ các trường hợp khẩn cấp</p>
                    <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
                        
                        <button className='flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-all font-medium shadow-md shadow-blue-200'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                            Gọi Cấp Cứu (115)
                        </button>
                        <button onClick={handleChatClick} className='flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-200 px-8 py-4 rounded-full hover:bg-gray-50 transition-all font-medium'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
                            Chat Trực Tuyến
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Contact