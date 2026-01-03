import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'

const FaqList = () => {
    const { backendUrl, aToken } = useContext(AdminContext)
    const [faqs, setFaqs] = useState([])
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [editId, setEditId] = useState(null)

    const fetchFaqs = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/all-faqs')
            if (data.success) {
                setFaqs(data.faqs.reverse()) 
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            if (editId) {
                // --- SỬA ---
                const { data } = await axios.post(backendUrl + '/api/admin/update-faq', { id: editId, question, answer }, { headers: { aToken } })
                if (data.success) {
                    toast.success(data.message)
                    setEditId(null)
                    fetchFaqs() 
                } else {
                    toast.error(data.message)
                }
            } else {
                // --- THÊM MỚI ---
                const { data } = await axios.post(backendUrl + '/api/admin/add-faq', { question, answer }, { headers: { aToken } })
                if (data.success) {
                    toast.success(data.message)
                    fetchFaqs() 
                } else {
                    toast.error(data.message)
                }
            }
            setQuestion('')
            setAnswer('')
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    const removeFaq = async (id) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/delete-faq', { id }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                fetchFaqs() 
                if(editId === id) cancelEdit();
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const loadEditData = (item) => {
        setEditId(item._id)
        setQuestion(item.question)
        setAnswer(item.answer)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const cancelEdit = () => {
        setEditId(null)
        setQuestion('')
        setAnswer('')
    }

    useEffect(() => {
        fetchFaqs();
    }, [aToken]); 

    // Hàm helper để reset lỗi khi nhập
    const handleInput = (e) => e.target.setCustomValidity('');

    return (
        <div className='m-5 w-full'>
            <p className='mb-4 text-lg font-medium'>Quản lý câu hỏi thường gặp (FAQ)</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl mb-10'>
                <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
                    <div>
                        <p className='mb-2'>Câu hỏi</p>
                        <input 
                            onChange={(e) => setQuestion(e.target.value)} 
                            value={question} 
                            className='border rounded px-3 py-2 w-full outline-primary' 
                            type="text" 
                            placeholder='Nhập câu hỏi' 
                            required 
                            // --- VIỆT HÓA THÔNG BÁO ---
                            onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập câu hỏi')}
                            onInput={handleInput}
                            // --------------------------
                        />
                    </div>
                    <div>
                        <p className='mb-2'>Câu trả lời</p>
                        <textarea 
                            onChange={(e) => setAnswer(e.target.value)} 
                            value={answer} 
                            className='border rounded px-3 py-2 w-full outline-primary' 
                            rows={3} 
                            placeholder='Nhập câu trả lời' 
                            required 
                            // --- VIỆT HÓA THÔNG BÁO ---
                            onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập câu trả lời')}
                            onInput={handleInput}
                            // --------------------------
                        />
                    </div>
                    
                    <div className='flex gap-4 mt-4'>
                        <button type='submit' className={`text-white px-10 py-3 rounded-full transition-all ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary/90'}`}>
                            {editId ? 'Cập Nhật FAQ' : 'Thêm FAQ'}
                        </button>
                        
                        {editId && (
                            <button type='button' onClick={cancelEdit} className='bg-gray-500 hover:bg-gray-600 text-white px-10 py-3 rounded-full transition-all'>
                                Hủy Bỏ
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className='bg-white border rounded w-full max-w-4xl'>
                <div className='hidden sm:grid grid-cols-[3fr_3fr_1fr] grid-flow-col py-3 px-6 border-b bg-gray-50 font-semibold text-gray-600'>
                    <p>Câu hỏi</p>
                    <p>Câu trả lời</p>
                    <p className='text-center'>Hành động</p>
                </div>
                {faqs && faqs.length > 0 ? (
                    faqs.map((item, index) => (
                        <div className='grid grid-cols-[1fr] sm:grid-cols-[3fr_3fr_1fr] items-center gap-4 py-3 px-6 border-b hover:bg-gray-50' key={index}>
                            <p className='font-medium text-gray-800'>{item.question}</p>
                            <p className='text-gray-600 text-sm truncate'>{item.answer}</p>
                            <div className='flex justify-center gap-2'>
                                <button onClick={() => loadEditData(item)} className='text-blue-500 hover:text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-xs font-medium border border-blue-200'>
                                    Sửa
                                </button>
                                <button onClick={() => removeFaq(item._id)} className='text-red-500 hover:text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-medium border border-red-200'>
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center py-4 text-gray-500">Chưa có câu hỏi nào.</p>
                )}
            </div>
        </div>
    )
}

export default FaqList