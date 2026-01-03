import React, { useContext, useState, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorMySchedule = () => {
  const { dToken, backendUrl, getDoctorProfile, profileData } = useContext(DoctorContext);

  const [slotDate, setSlotDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);

  // --- 1. TẠO SLOT 30 PHÚT (08:00 - 21:00) ---
  const timeSlots = [];
  const startHour = 8; 
  const endHour = 21;  

  for (let i = startHour; i < endHour; i++) {
    for (let j = 0; j < 60; j += 30) {
      const startH = i.toString().padStart(2, "0");
      const startM = j.toString().padStart(2, "0");
      const timeString = `${startH}:${startM}`;

      const nextTime = new Date();
      nextTime.setHours(i);
      nextTime.setMinutes(j + 30);
      const endH = nextTime.getHours().toString().padStart(2, "0");
      const endM = nextTime.getMinutes().toString().padStart(2, "0");
      
      timeSlots.push({
        time: timeString, 
        label: `${timeString} - ${endH}:${endM}`
      });
    }
  }

  // --- 2. LOGIC TẢI LỊCH CŨ ---
  useEffect(() => {
    if (profileData && slotDate) {
        const dateArray = slotDate.split('-');
        const formattedDate = `${dateArray[2]}_${dateArray[1]}_${dateArray[0]}`;

        // ĐỌC TỪ slots_scheduled
        if (profileData.slots_scheduled && profileData.slots_scheduled[formattedDate]) {
            const savedSlots = profileData.slots_scheduled[formattedDate].map(slot => slot.time);
            setSelectedSlots(savedSlots);
        } else {
            setSelectedSlots([]);
        }
    }
  }, [slotDate, profileData]);

  // Load profile khi vào trang
  useEffect(() => {
      if(dToken) getDoctorProfile();
  }, [dToken])

  // --- 3. HÀM KIỂM TRA THỜI GIAN ĐÃ QUA (MỚI THÊM) ---
  const isPastTime = (timeString) => {
    if (!slotDate) return true; // Chưa chọn ngày thì disable hết

    const currentDate = new Date();
    const [year, month, day] = slotDate.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day);

    // Nếu ngày chọn < ngày hiện tại (xét theo ngày) -> Đã qua
    if (selectedDateObj.setHours(0,0,0,0) < currentDate.setHours(0,0,0,0)) {
        return true;
    }

    // Nếu ngày chọn == ngày hiện tại -> Check từng giờ
    if (selectedDateObj.setHours(0,0,0,0) === currentDate.setHours(0,0,0,0)) {
        const [h, m] = timeString.split(':').map(Number);
        const slotTimeObj = new Date(year, month - 1, day, h, m);
        
        // Nếu giờ slot nhỏ hơn giờ hiện tại -> Đã qua
        return slotTimeObj < new Date();
    }

    return false;
  }

  const handleSlotClick = (time) => {
    // Chặn không cho click nếu là giờ quá khứ
    if (isPastTime(time)) {
        return toast.warn("Không thể chọn thời gian trong quá khứ!");
    }

    if (selectedSlots.includes(time)) {
      setSelectedSlots((prev) => prev.filter((t) => t !== time));
    } else {
      setSelectedSlots((prev) => [...prev, time].sort());
    }
  };

  const onSubmitHandler = async () => {
        if (!slotDate) return toast.error("Vui lòng chọn ngày")
        
        // // Cảnh báo nếu có slot quá khứ
        // const hasPastSlot = selectedSlots.some(slot => isPastTime(slot));
        // if (hasPastSlot) {
        //      if(!window.confirm("Cảnh báo: Bạn đang lưu một số khung giờ đã trôi qua. Người dùng sẽ không thấy các giờ này. Bạn có muốn tiếp tục?")) {
        //          return;
        //      }
        // }

        try {
            const dateArray = slotDate.split('-'); 
            const formattedDate = `${dateArray[2]}_${dateArray[1]}_${dateArray[0]}`;

            const { data } = await axios.post(backendUrl + '/api/doctor/add-schedule', 
                { slotDate: formattedDate, slotTimes: selectedSlots }, 
                { headers: { dToken } } 
            )

            if (data.success) {
                toast.success("Đã cập nhật lịch thành công!")
                getDoctorProfile(); 
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

  return (
    <div className="m-5 w-full">
      <p className="mb-4 text-lg font-medium">Quản lý lịch khám bệnh</p>
      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl">
        
        <div className="mb-4">
          <p className="mb-2">Chọn ngày đăng ký</p>
          <input 
            type="date" 
            className="border rounded px-3 py-2" 
            value={slotDate} 
            onChange={(e) => setSlotDate(e.target.value)} 
            min={new Date().toISOString().split("T")[0]} // Chặn chọn ngày cũ
          />
        </div>

        <div className="mb-8">
          <p className="mb-2">Chọn khung giờ làm việc</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {timeSlots.map((item, index) => {
               // Logic kiểm tra giờ quá khứ
               const isExpired = isPastTime(item.time);

               return (
                <button
                    key={index}
                    onClick={() => handleSlotClick(item.time)}
                    disabled={isExpired} // Disable nút nếu đã qua giờ
                    className={`px-2 py-3 border rounded transition-all text-xs font-medium truncate
                        ${isExpired 
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60" // Style mờ đi
                            : selectedSlots.includes(item.time)
                                ? "bg-primary text-white border-primary shadow-md cursor-pointer"
                                : "bg-white text-gray-700 hover:border-primary hover:bg-gray-50 cursor-pointer"
                        }`}
                >
                    {item.label}
                </button>
               )
            })}
          </div>
        </div>

        <button onClick={onSubmitHandler} className='bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 shadow-lg transition-all'>
             Lưu lịch làm việc
        </button>
      </div>
    </div>
  );
};

export default DoctorMySchedule;