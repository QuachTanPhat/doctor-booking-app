import React, { useState, useContext, useEffect, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { io } from 'socket.io-client' // Import Socket Client

const Chat = () => {
    const { userData, backendUrl } = useContext(AppContext)
    const [messages, setMessages] = useState([
        { sender: 'ai', text: `Xin chào ${userData ? userData.name : 'bạn'}! Tôi là trợ lý AI Prescripto. Bạn cảm thấy trong người thế nào?` }
    ])
    const [input, setInput] = useState('')
    
    // Dùng useRef để giữ kết nối socket không bị reset khi render lại
    const socketRef = useRef();

    // Tự động cuộn xuống tin nhắn mới nhất
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // 1. KẾT NỐI SOCKET KHI VÀO TRANG
    useEffect(() => {
        if(userData) {
            socketRef.current = io(backendUrl);

            // Tham gia phòng chat (Dùng ID của user làm tên phòng)
            socketRef.current.emit("join-chat", userData._id);

            // Lắng nghe tin nhắn trả về (từ AI hoặc Bác sĩ)
            socketRef.current.on("receive-message", (newMsg) => {
                setMessages((prev) => [...prev, newMsg]);
            });

            return () => {
                socketRef.current.disconnect();
            }
        }
    }, [userData, backendUrl]);

    // Cuộn xuống khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 2. GỬI TIN NHẮN
    const handleSend = () => {
        if (!input.trim() || !userData) return;

        // Gửi lên Server
        socketRef.current.emit("send-message", { 
            userId: userData._id, 
            message: input, 
            sender: 'user' 
        });

        // (Lưu ý: Không cần setMessages ở đây thủ công nữa, 
        // vì Server sẽ emit lại sự kiện 'receive-message' để ta hiển thị đồng bộ)
        
        setInput('');
    }

    return (
        <div className='min-h-[80vh] flex flex-col items-center justify-center pt-10 pb-20 text-gray-800'>
            <div className='w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200'>
                {/* Header Chat */}
                <div className='bg-blue-600 p-4 flex items-center gap-4'>
                    <img className='w-10 h-10 rounded-full bg-white p-1' src={assets.logo} alt="" />
                    <div>
                        <h2 className='text-white font-bold text-lg'>Trợ Lý Y Tế AI</h2>
                        <p className='text-blue-200 text-xs'>● Trực tuyến • Được giám sát bởi bác sĩ</p>
                    </div>
                </div>

                {/* Khu vực hiện tin nhắn */}
                <div className='h-[400px] overflow-y-scroll p-6 bg-gray-50 flex flex-col gap-4'>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-xs'>🤖</div>}
                            {msg.sender === 'doctor' && <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2 text-xs'>👨‍⚕️</div>}
                            
                            <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                                msg.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : msg.sender === 'ai' 
                                    ? 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'
                                    : 'bg-green-50 border border-green-200 text-gray-800 rounded-tl-none shadow-sm' // Style cho bác sĩ
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Khu vực nhập liệu */}
                <div className='p-4 bg-white border-t border-gray-200 flex gap-4'>
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        type="text" 
                        placeholder="Mô tả triệu chứng..." 
                        className='flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-blue-500 transition-all'
                    />
                    <button onClick={handleSend} className='bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-all'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Chat