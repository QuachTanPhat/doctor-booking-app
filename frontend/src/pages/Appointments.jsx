import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointments = () => {
  const { docId } = useParams()
  // Lấy thêm specialities từ context (nếu cần dùng sau này)
  const { doctors, currentSymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  
  const daysofWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [timeFilter, setTimeFilter] = useState('Sáng') // Bộ lọc Sáng/Chiều/Tối
  
  const [startDate, setStartDate] = useState(new Date())

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  // --- HÀM FORMAT HIỂN THỊ GIỜ (VD: 08:00 -> 08:00 - 10:00) ---
  const formatTimeDisplay = (time) => {
      if(!time) return "";
      const [hour, minute] = time.split(':').map(Number);
      // Giả sử ca khám là 2 tiếng
      const endHour = hour + 2; 
      return `${time} - ${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  const getAvailableSlots = async () => {
        setDocSlots([])
        // Dùng startDate thay vì new Date() để support DatePicker
        let today = new Date(startDate) 
        let allSlots = [] 

        for (let i = 0; i < 7; i++) {
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            let day = currentDate.getDate()
            let month = currentDate.getMonth() + 1
            let year = currentDate.getFullYear()
            const slotDate = `${day}_${month}_${year}` 

            // Logic lấy lịch Admin đã xếp
            let adminScheduledSlots = docInfo.slots_scheduled && docInfo.slots_scheduled[slotDate] 
                ? docInfo.slots_scheduled[slotDate] 
                : []; 

            let timeSlots = []

            adminScheduledSlots.forEach(time => {
                let [hour, minute] = time.split(':').map(Number);
                let slotTimeDate = new Date(currentDate);
                slotTimeDate.setHours(hour, minute, 0, 0);

                // Kiểm tra quá khứ (so với thời gian thực tế hiện tại)
                if (currentDate.getDate() === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && slotTimeDate < new Date()) {
                    return; 
                }

                // Kiểm tra đã bị đặt chưa
                if (docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(time)) {
                    return; 
                }

                timeSlots.push({
                    datetime: slotTimeDate,
                    time: time
                })
            });
            
            allSlots.push(timeSlots)
        }

        setDocSlots(allSlots)
    }

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Vui lòng đăng nhập để đặt lịch hẹn')
      return navigate('/login')
    }
    if (!slotTime) {
      toast.warn('Vui lòng chọn giờ khám')
      return
    }

    try {
      // --- SỬA LỖI CRASH Ở ĐÂY ---
      // Tính ngày dựa trên startDate + slotIndex thay vì lấy từ docSlots
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + slotIndex)
      
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()
      const slotDate = day + "_" + month + "_" + year

      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime, paymentMethod }, { headers: { token } })
      
      if (data.success) {
        toast.success(data.message)
        getDoctorsData() // Load lại data để cập nhật slot đã booked
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error); toast.error(error.message)
    }
  }

  // Reload khi doctors thay đổi (Socket cập nhật -> Context cập nhật doctors -> Component render lại)
  useEffect(() => { fetchDocInfo() }, [doctors, docId])
  
  // Reload slot khi docInfo hoặc ngày chọn thay đổi
  useEffect(() => { 
      if(docInfo) getAvailableSlots() 
  }, [docInfo, startDate])

  // Logic lọc Sáng/Chiều/Tối
  const filterSlots = (slots) => {
    if (!slots) return { sang: [], chieu: [], toi: [] };

    const sang = slots.filter(item => {
        const h = parseInt(item.time.split(':')[0]);
        return h < 12; 
    });

    const chieu = slots.filter(item => {
        const h = parseInt(item.time.split(':')[0]);
        return h >= 12 && h < 17; 
    });

    const toi = slots.filter(item => {
        const h = parseInt(item.time.split(':')[0]);
        return h >= 17; 
    });

    return { sang, chieu, toi };
  };

  const currentDaySlots = docSlots.length ? docSlots[slotIndex] : [];
  const categorized = filterSlots(currentDaySlots);
  const displaySlots = timeFilter === 'Sáng' ? categorized.sang : timeFilter === 'Chiều' ? categorized.chieu : categorized.toi;

  const handleDateChange = (e) => {
      setStartDate(new Date(e.target.value));
      setSlotIndex(0);
      setSlotTime('');
  }
  
  // Fix lỗi múi giờ khi chọn date picker
  const getInputValue = () => {
      const offset = startDate.getTimezoneOffset();
      const localDate = new Date(startDate.getTime() - (offset*60*1000));
      return localDate.toISOString().split('T')[0];
  }

  return docInfo && (
    <div className='pb-10'>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-600'>
            {docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>Giới thiệu <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'> {docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Phí khám bệnh: <span className='text-gray-600'> {docInfo.fees} {currentSymbol}</span>
          </p>
        </div>
      </div>

      {/* Booking Section */}
      <div className='sm:ml-72 sm:pl-4 mt-8'>
        <p className='text-lg font-bold mb-3 text-gray-800'>Lịch trống gần nhất</p>

        {/* Date Picker */}
        <div className='flex items-center gap-3 mb-4'>
            <div className='relative max-w-xs'>
                <input 
                    type="date" 
                    value={getInputValue()}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className='border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 p-2.5 cursor-pointer font-medium'
                />
            </div>
            <span className='text-sm text-gray-500 italic'>*Chọn ngày bạn muốn khám</span>
        </div>

        {/* Danh sách 7 ngày */}
        <div className='flex gap-3 overflow-x-auto pb-4 scrollbar-hide'>
            {docSlots.length > 0 && docSlots.map((item, index) => {
                const dateObj = new Date(startDate);
                dateObj.setDate(startDate.getDate() + index);
                
                const realToday = new Date();
                const isRealToday = dateObj.getDate() === realToday.getDate() && dateObj.getMonth() === realToday.getMonth();
                const dayName = isRealToday ? "Hôm nay" : daysofWeek[dateObj.getDay()];
                const dateString = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
                
                const totalSlots = item.length;
                const isSelected = slotIndex === index;

                return (
                    <div 
                        key={index}
                        onClick={() => { setSlotIndex(index); setSlotTime(''); }}
                        className={`min-w-[100px] sm:min-w-[130px] p-3 border rounded-lg cursor-pointer flex flex-col items-center justify-center gap-1 transition-all
                        ${isSelected ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-400 bg-white'}`}
                    >
                        <p className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-gray-500'}`}>{dayName}</p>
                        <p className={`text-xl font-bold ${isSelected ? 'text-gray-800' : 'text-gray-700'}`}>{dateString}</p>
                        <p className={`text-[10px] ${totalSlots > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {totalSlots > 0 ? `${totalSlots} khung giờ` : 'Hết lịch'}
                        </p>
                    </div>
                )
            })}
        </div>

        {/* Tab Sáng/Chiều/Tối */}
        <div className="bg-gray-100 p-1 rounded-xl flex mb-6 max-w-md mt-2">
            {['Sáng', 'Chiều', 'Tối'].map((type) => {
                const count = type === 'Sáng' ? categorized.sang.length : type === 'Chiều' ? categorized.chieu.length : categorized.toi.length;
                const isActive = timeFilter === type;
                return (
                    <button
                        key={type}
                        onClick={() => { setTimeFilter(type); setSlotTime(''); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all 
                        ${isActive ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {type} ({count})
                    </button>
                )
            })}
        </div>

        {/* Danh sách giờ */}
        <div className='min-h-[150px]'>
            {displaySlots.length > 0 ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                    {displaySlots.map((item, index) => (
                        <p 
                            key={index}
                            onClick={() => setSlotTime(item.time)}
                            className={`text-sm py-3 px-2 rounded-lg border text-center cursor-pointer transition-all font-medium
                            ${item.time === slotTime ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-primary hover:bg-gray-50'}`}
                        >
                            {/* Hiển thị dạng khoảng giờ: 08:00 - 10:00 */}
                            {formatTimeDisplay(item.time)} 
                        </p>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <img src={assets.verified_icon} className="w-8 h-8 opacity-20 grayscale mb-2" alt="" />
                    <p className="text-gray-400 font-medium text-sm">Không có lịch {timeFilter.toLowerCase()} cho ngày này.</p>
                </div>
            )}
        </div>

        <button 
            onClick={bookAppointment}
            className={`w-full max-w-sm mt-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all
            ${slotTime ? 'bg-primary hover:bg-blue-600 transform hover:-translate-y-1' : 'bg-blue-300 cursor-not-allowed'}`}
        >
            Xác nhận đặt lịch
        </button>

        {/* Payment Method */}
        <div className='flex items-center gap-4 mt-8 pt-6 border-t'>
           <span className='text-sm text-gray-600 font-medium'>Phương thức thanh toán:</span>
           <div className='flex gap-3'>
              <button onClick={() => setPaymentMethod('CASH')} className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${paymentMethod === 'CASH' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>Tiền mặt</button>
              <button onClick={() => setPaymentMethod('ONLINE')} className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${paymentMethod === 'ONLINE' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>Chuyển khoản (SePay)</button>
           </div>
        </div>
      </div>
      
      <div className='mt-16'>
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    </div>
  )
}

export default Appointments