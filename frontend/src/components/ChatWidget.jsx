import React, { useState, useContext, useEffect, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { io } from 'socket.io-client'

const ChatWidget = () => {
    const { userData, backendUrl, isChatOpen, setIsChatOpen, token } = useContext(AppContext)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false) // <--- THÊM STATE NÀY

    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (userData && token && isChatOpen) {
            // Khởi tạo socket
            socketRef.current = io(backendUrl);
            socketRef.current.emit("join-chat", userData._id); 

            // Lắng nghe tin nhắn đến
            socketRef.current.on("receive-message", (newMsg) => {
                setMessages((prev) => [...prev, newMsg]);
            });

            // Lắng nghe lịch sử chat
            socketRef.current.on("chat-history", (history) => {
                setMessages(history); 
                if(history.length === 0) {
                     setMessages([{ sender: 'ai', text: `Chào ${userData.name}, tôi là trợ lý ảo Prescripto. Tôi có thể giúp gì cho bạn?` }])
                }
            });

            // Lắng nghe sự kiện AI đang gõ (QUAN TRỌNG)
            socketRef.current.on("ai-typing", (status) => {
                setIsTyping(status);
            });
            
            return () => {
                if(socketRef.current) socketRef.current.disconnect();
            }
        }
    }, [userData, backendUrl, isChatOpen, token]);

    // Tự động cuộn xuống dưới cùng khi có tin nhắn mới hoặc AI đang gõ
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;
        // Gửi tin nhắn lên server
        socketRef.current.emit("send-message", { userId: userData._id, message: input, sender: 'user' });
        setInput('');
    }
   
    if (!token || !isChatOpen) return null;

    return (
        <div className='fixed bottom-5 right-5 z-50 w-80 md:w-96 bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 transform scale-100'>
            
            {/* Header */}
            <div className='bg-primary p-4 flex justify-between items-center cursor-pointer shadow-sm' onClick={() => setIsChatOpen(false)}>
                <div className='flex items-center gap-3'>
                    <div className='relative'>
                        <img className='w-8 h-8 rounded-full border-2 border-white' src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="bot" />
                        <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-white animate-pulse'></div>
                    </div>
                    <div>
                        <p className='text-white font-bold text-sm'>Trợ lý Prescripto</p>
                        <p className='text-blue-100 text-[10px]'>Luôn sẵn sàng hỗ trợ</p>
                    </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setIsChatOpen(false); }} className='text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Body Chat */}
            <div className='h-96 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 custom-scrollbar'>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] mr-2 self-end mb-1">AI</div>
                        )}
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                            msg.sender === 'user' 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {/* Hiệu ứng AI đang gõ... */}
                {isTyping && (
                    <div className="flex justify-start items-end">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] mr-2 mb-1">AI</div>
                        <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm w-16">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className='p-3 border-t bg-white flex gap-2 items-center'>
                <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className='flex-1 bg-gray-100 border-none rounded-full px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all'
                    placeholder='Nhập câu hỏi của bạn...'
                />
                <button 
                    disabled={!input.trim() || isTyping} 
                    onClick={handleSend} 
                    className={`p-2.5 rounded-full transition-all ${input.trim() ? 'bg-primary text-white shadow-md hover:bg-primary/90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
export default ChatWidget