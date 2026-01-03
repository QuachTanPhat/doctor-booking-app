import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import { toast } from 'react-toastify'
import axios from 'axios'

const Appointments = () => {
  const { docId } = useParams()
  const { doctors, currentSymbol, backendUrl, token, getDoctorsData } = useContext(AppContext)
  const daysofWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [timeFilter, setTimeFilter] = useState('Sáng') 
  const [startDate, setStartDate] = useState(new Date())

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
  }

  // --- HÀM FORMAT AN TOÀN TUYỆT ĐỐI ---
  const formatTimeDisplay = (time) => {
    if (!time || typeof time !== 'string') return ""; 
    try {
        const [hour, minute] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hour);
        date.setMinutes(minute + 30); 
        const endHour = date.getHours().toString().padStart(2, '0');
        const endMinute = date.getMinutes().toString().padStart(2, '0');
        return `${time} - ${endHour}:${endMinute}`;
    } catch (e) {
        return time; 
    }
  }

  const getAvailableSlots = async () => {
    setDocSlots([])
    let today = new Date(startDate)
    let allSlots = []

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      let day = currentDate.getDate()
      let month = currentDate.getMonth() + 1
      let year = currentDate.getFullYear()

      // --- TẠO CẢ 2 LOẠI KEY ĐỂ TÌM KIẾM ---
      const keyNoPad = `${day}_${month}_${year}` // VD: 2_1_2026
      const keyPad = `${day.toString().padStart(2, '0')}_${month.toString().padStart(2, '0')}_${year}` // VD: 02_01_2026
      
      // 1. Tìm lịch làm việc (Ưu tiên key có Pad vì Admin thường lưu dạng này)
      let doctorScheduledSlots = 
          (docInfo.slots_scheduled && docInfo.slots_scheduled[keyPad]) ? docInfo.slots_scheduled[keyPad] :
          (docInfo.slots_scheduled && docInfo.slots_scheduled[keyNoPad]) ? docInfo.slots_scheduled[keyNoPad] : 
          [];

      let timeSlots = []

      doctorScheduledSlots.forEach(slotItem => {
        let time = null;
        if (typeof slotItem === 'object' && slotItem?.time) time = slotItem.time;
        else if (typeof slotItem === 'string') time = slotItem;

        if (!time) return;

        let [hour, minute] = time.split(':').map(Number);
        let slotTimeDate = new Date(currentDate);
        slotTimeDate.setHours(hour, minute, 0, 0);

        if (currentDate.getDate() === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && slotTimeDate < new Date()) {
          return; // Bỏ qua giờ quá khứ
        }

        // 2. CHECK BOOKED (KIỂM TRA CẢ 2 KEY)
        // Để đảm bảo dù user đặt lịch lưu dạng 2_1_2026 hay 02_01_2026 đều bị ẩn
        let isBooked = false;
        
        // Check key có số 0 (02_01_2026)
        if (docInfo.slots_booked && docInfo.slots_booked[keyPad] && docInfo.slots_booked[keyPad].includes(time)) {
            isBooked = true;
        }
        // Check key không số 0 (2_1_2026)
        else if (docInfo.slots_booked && docInfo.slots_booked[keyNoPad] && docInfo.slots_booked[keyNoPad].includes(time)) {
            isBooked = true;
        }

        if (!isBooked) {
             timeSlots.push({
              datetime: slotTimeDate,
              time: time
            })
        }
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
    if (!slotTime) return toast.warn('Vui lòng chọn giờ khám')

    try {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + slotIndex)
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()
      const slotDate = `${day.toString().padStart(2, '0')}_${month.toString().padStart(2, '0')}_${year}`

      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime, paymentMethod }, { headers: { token } })

      if (data.success) {
        toast.success(data.message)
        getDoctorsData() 
        navigate('/my-appointments')
      } else {
        if (data.message === 'account_blocked') {
            toast.error("Tài khoản đã bị khóa!");
            localStorage.removeItem('token');
            navigate('/login');
        } else {
            toast.error(data.message)
        }
      }
    } catch (error) {
      console.log(error); toast.error(error.message)
    }
  }

  useEffect(() => { fetchDocInfo() }, [doctors, docId])
  useEffect(() => { if (docInfo) getAvailableSlots() }, [docInfo, startDate])

  // --- FILTER AN TOÀN ---
  const filterSlots = (slots) => {
    if (!slots) return { sang: [], chieu: [], toi: [] };
    
    // Hàm helper để lấy giờ an toàn
    const getHour = (item) => {
        if (!item || !item.time || typeof item.time !== 'string') return -1;
        return parseInt(item.time.split(':')[0]);
    }

    const sang = slots.filter(item => { const h = getHour(item); return h >= 0 && h < 12 });
    const chieu = slots.filter(item => { const h = getHour(item); return h >= 12 && h < 17 });
    const toi = slots.filter(item => { const h = getHour(item); return h >= 17 });
    
    return { sang, chieu, toi };
  };

  const currentDaySlots = docSlots.length ? docSlots[slotIndex] : [];
  const categorized = filterSlots(currentDaySlots);
  const displaySlots = timeFilter === 'Sáng' ? categorized.sang : timeFilter === 'Chiều' ? categorized.chieu : categorized.toi;

  const handleDateChange = (e) => {
    if (!e.target.value) return;
    setStartDate(new Date(e.target.value));
    setSlotIndex(0);
    setSlotTime('');
  }

  const getInputValue = () => {
    const offset = startDate.getTimezoneOffset();
    const localDate = new Date(startDate.getTime() - (offset * 60 * 1000));
    try { return localDate.toISOString().split('T')[0]; } catch { return ""; }
  }

  return docInfo && (
    <div className='pb-10'>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div><img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" /></div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-600'>{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>Kinh nghiệm: {docInfo.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>Giới thiệu <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'> {docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>Phí khám bệnh: <span className='text-gray-600'> {docInfo.fees} {currentSymbol}</span></p>
        </div>
      </div>

      <div className='sm:ml-72 sm:pl-4 mt-8'>
        <p className='text-lg font-bold mb-3 text-gray-800'>Lịch trống gần nhất</p>
        <div className='flex items-center gap-3 mb-4'>
          <input type="date" value={getInputValue()} onChange={handleDateChange} min={new Date().toISOString().split('T')[0]} className='border border-gray-300 text-gray-700 text-sm rounded-lg p-2.5' />
          <span className='text-sm text-gray-500 italic'>*Chọn ngày khám</span>
        </div>

        <div className='flex gap-3 overflow-x-auto pb-4 scrollbar-hide'>
          {docSlots.length > 0 && docSlots.map((item, index) => {
            const dateObj = new Date(startDate); dateObj.setDate(startDate.getDate() + index);
            const isRealToday = dateObj.getDate() === new Date().getDate() && dateObj.getMonth() === new Date().getMonth();
            const dayName = isRealToday ? "Hôm nay" : daysofWeek[dateObj.getDay()];
            const dateString = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
            const totalSlots = item.length;
            const isSelected = slotIndex === index;
            return (
              <div key={index} onClick={() => { setSlotIndex(index); setSlotTime(''); }} className={`min-w-[100px] p-3 border rounded-lg cursor-pointer flex flex-col items-center gap-1 ${isSelected ? 'border-primary bg-blue-50' : 'bg-white'}`}>
                <p className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-gray-500'}`}>{dayName}</p>
                <p className={`text-xl font-bold ${isSelected ? 'text-gray-800' : 'text-gray-700'}`}>{dateString}</p>
                <p className={`text-[10px] ${totalSlots > 0 ? 'text-green-600' : 'text-red-500'}`}>{totalSlots > 0 ? `${totalSlots} khung giờ` : 'Hết lịch'}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-gray-100 p-1 rounded-xl flex mb-6 max-w-md mt-2">
          {['Sáng', 'Chiều', 'Tối'].map((type) => {
            const count = type === 'Sáng' ? categorized.sang.length : type === 'Chiều' ? categorized.chieu.length : categorized.toi.length;
            return <button key={type} onClick={() => { setTimeFilter(type); setSlotTime(''); }} className={`flex-1 py-2 text-sm font-medium rounded-lg ${timeFilter === type ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>{type} ({count})</button>
          })}
        </div>

        <div className='min-h-[150px]'>
          {displaySlots.length > 0 ? (
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {displaySlots.map((item, index) => (
                <p key={index} onClick={() => setSlotTime(item.time)} className={`text-sm py-3 px-2 rounded-lg border text-center cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'bg-white border-gray-200 hover:border-primary'}`}>
                  {formatTimeDisplay(item.time)}
                </p>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed rounded-lg"><p className="text-gray-400 text-sm">Không có lịch {timeFilter.toLowerCase()}</p></div>
          )}
        </div>

        <button onClick={bookAppointment} className={`w-full max-w-sm mt-8 py-4 rounded-xl text-white font-semibold text-lg ${slotTime ? 'bg-primary' : 'bg-blue-300 cursor-not-allowed'}`}>Xác nhận đặt lịch</button>
        
        <div className='flex items-center gap-4 mt-8 pt-6 border-t'>
           <span className='text-sm font-medium'>Thanh toán:</span>
           <div className='flex gap-3'>
              <button onClick={() => setPaymentMethod('CASH')} className={`px-4 py-2 text-xs font-semibold rounded-full border ${paymentMethod === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-white'}`}>Tiền mặt</button>
              <button onClick={() => setPaymentMethod('ONLINE')} className={`px-4 py-2 text-xs font-semibold rounded-full border ${paymentMethod === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-white'}`}>Chuyển khoản</button>
           </div>
        </div>
      </div>
      <div className='mt-16'><RelatedDoctors docId={docId} speciality={docInfo.speciality} /></div>
    </div>
  )
}
export default Appointments