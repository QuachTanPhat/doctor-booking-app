import React, { useState, useContext, useEffect, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { io } from 'socket.io-client'

const ChatWidget = () => {
    const { userData, backendUrl, isChatOpen, setIsChatOpen, token } = useContext(AppContext)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    
    useEffect(() => {
        if (userData && token && isChatOpen) {
            socketRef.current = io(backendUrl);
            socketRef.current.emit("join-chat", userData._id); 

            socketRef.current.on("receive-message", (newMsg) => {
                setMessages((prev) => [...prev, newMsg]);
            });

            socketRef.current.on("chat-history", (history) => {
                // history là mảng lấy từ DB, ta set thẳng vào state
                setMessages(history); 
                
                // Nếu lịch sử trống trơn thì mới cho AI chào mở hàng
                if(history.length === 0) {
                     setMessages([{ sender: 'ai', text: `Chào ${userData.name}, tôi có thể giúp gì cho bạn?` }])
                }
            });
            
            return () => {
                if(socketRef.current) socketRef.current.disconnect();
            }
        }
    }, [userData, backendUrl, isChatOpen, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        socketRef.current.emit("send-message", { userId: userData._id, message: input, sender: 'user' });
        setInput('');
    }
   
    if (!token || !isChatOpen) return null;

    return (
    
        <div className='fixed bottom-5 right-5 z-50 w-80 md:w-96 bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden flex flex-col'>
            <div className='bg-blue-600 p-3 flex justify-between items-center cursor-pointer' onClick={() => setIsChatOpen(false)}>
                <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                    <span className='text-white font-bold text-sm'>Hỗ trợ trực tuyến</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className='text-white hover:bg-blue-700 rounded-full p-1'>
                    ✕
                </button>
            </div>
            <div className='h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3'>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-2 px-3 rounded-lg text-sm ${
                            msg.sender === 'user' ? 'bg-blue-600 text-white' : 
                            msg.sender === 'ai' ? 'bg-gray-200 text-gray-800' :
                            'bg-green-100 border border-green-300 text-gray-800' 
                        }`}>
                            {msg.sender === 'doctor' && <p className='text-[10px] font-bold text-green-700 mb-1'>Bác sĩ</p>}
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className='p-3 border-t flex gap-2 bg-white'>
                <input 
                    value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className='flex-1 border rounded-full px-3 py-2 text-sm outline-none focus:border-blue-500'
                    placeholder='Nhập tin nhắn...'
                />
                <button onClick={handleSend} className='text-blue-600 font-bold px-2'>➤</button>
            </div>
        </div>
    )
}
export default ChatWidget