import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AiPrediction = () => {
    // State lưu dữ liệu form
    const [formData, setFormData] = useState({
        age: '',
        sex: '1',
        cp: '0',
        trestbps: '',
        chol: '',
        thalach: '',
        exang: '0'
    });
    
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Gọi sang Python Server đang chạy ở cổng 5000
            const { data } = await axios.post('http://127.0.0.1:5000/predict', formData);
            
            if (data.success) {
                setResult(data.result);
                toast.success("Đã có kết quả chẩn đoán!");
            } else {
                toast.error("Lỗi: " + data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không kết nối được với Server AI (Kiểm tra xem file app.py có đang chạy không?)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex flex-col items-center gap-4 py-10 min-h-[80vh] text-gray-800'>
            <div className='w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-100'>
                <h2 className='text-2xl font-bold text-center mb-6 text-primary'>🤖 AI Chẩn Đoán Nguy Cơ Bệnh Tim</h2>
                <p className='text-sm text-center text-gray-500 mb-8'>
                    Nhập các chỉ số sức khỏe để hệ thống phân tích nguy cơ dựa trên mô hình Machine Learning.
                </p>

                <form onSubmit={handlePredict} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* 1. Tuổi */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Tuổi</label>
                        <input type="number" name="age" required className='w-full border rounded p-2 outline-primary' onChange={handleChange} placeholder="VD: 45" />
                    </div>

                    {/* 2. Giới tính */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Giới tính</label>
                        <select name="sex" className='w-full border rounded p-2 outline-primary' onChange={handleChange}>
                            <option value="1">Nam</option>
                            <option value="0">Nữ</option>
                        </select>
                    </div>

                    {/* 3. Huyết áp */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Huyết áp (mmHg)</label>
                        <input type="number" name="trestbps" placeholder="VD: 120" required className='w-full border rounded p-2 outline-primary' onChange={handleChange} />
                    </div>

                    {/* 4. Cholesterol */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Cholesterol (mg/dl)</label>
                        <input type="number" name="chol" placeholder="VD: 200" required className='w-full border rounded p-2 outline-primary' onChange={handleChange} />
                    </div>

                    {/* 5. Nhịp tim tối đa */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Nhịp tim tối đa</label>
                        <input type="number" name="thalach" placeholder="VD: 150" required className='w-full border rounded p-2 outline-primary' onChange={handleChange} />
                    </div>

                    {/* 6. Đau ngực khi vận động */}
                    <div>
                        <label className='block text-sm font-medium mb-1'>Đau ngực khi vận động?</label>
                        <select name="exang" className='w-full border rounded p-2 outline-primary' onChange={handleChange}>
                            <option value="0">Không</option>
                            <option value="1">Có</option>
                        </select>
                    </div>

                    {/* 7. Loại đau ngực */}
                    <div className='md:col-span-2'>
                        <label className='block text-sm font-medium mb-1'>Loại đau ngực</label>
                        <select name="cp" className='w-full border rounded p-2 outline-primary' onChange={handleChange}>
                            <option value="0">Điển hình (Typical Angina)</option>
                            <option value="1">Không điển hình (Atypical Angina)</option>
                            <option value="2">Đau không do tim (Non-anginal Pain)</option>
                            <option value="3">Không có triệu chứng (Asymptomatic)</option>
                        </select>
                    </div>

                    <button type='submit' className='md:col-span-2 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md' disabled={loading}>
                        {loading ? 'Đang phân tích...' : 'PHÂN TÍCH NGAY'}
                    </button>
                </form>

                {/* KẾT QUẢ HIỂN THỊ */}
                {result && (
                    <div className={`mt-8 p-6 rounded-lg text-center border-2 animate-bounce-short ${result.prediction === 1 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <p className='text-lg font-medium text-gray-600'>Kết quả chẩn đoán từ AI:</p>
                        
                        <h3 className={`text-3xl font-bold mt-2 ${result.prediction === 1 ? 'text-red-600' : 'text-green-600'}`}>
                            {result.message}
                        </h3>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4 overflow-hidden">
                            <div className={`h-2.5 rounded-full ${result.prediction === 1 ? 'bg-red-600' : 'bg-green-600'}`} style={{width: `${result.risk_score}%`}}></div>
                        </div>
                        <p className='mt-2 text-sm text-gray-600'>Tỉ lệ nguy cơ: <span className='font-bold'>{result.risk_score}%</span></p>
                        
                        {result.prediction === 1 && (
                            <div className='mt-4 p-3 bg-white rounded border border-red-100 text-left'>
                                <p className='text-sm text-red-500 font-medium'>⚠️ Khuyến nghị:</p>
                                <ul className='list-disc list-inside text-sm text-gray-600 ml-2'>
                                    <li>Kết quả này chỉ mang tính tham khảo dựa trên dữ liệu.</li>
                                    <li>Bạn có nguy cơ cao mắc bệnh tim mạch.</li>
                                    <li>Hãy đặt lịch khám với <b>Bác sĩ Chuyên khoa Tim mạch</b> ngay.</li>
                                </ul>
                            </div>
                        )}
                         {result.prediction === 0 && (
                            <div className='mt-4 p-3 bg-white rounded border border-green-100'>
                                <p className='text-sm text-green-600'>✅ Sức khỏe tim mạch của bạn có vẻ ổn định. Hãy duy trì lối sống lành mạnh!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AiPrediction;