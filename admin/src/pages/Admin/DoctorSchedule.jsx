import React, { useContext, useState, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorSchedule = () => {
  const { doctors, aToken, getAllDoctors, backendUrl } =
    useContext(AdminContext);

  const [docId, setDocId] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Danh sách các khung giờ cố định để Admin chọn
  const timeSlots = [
    { time: "08:00", label: "08:00 - 10:00" },
    { time: "10:00", label: "10:00 - 12:00" },
    { time: "12:00", label: "12:00 - 14:00" },
    { time: "14:00", label: "14:00 - 16:00" },
    { time: "16:00", label: "16:00 - 18:00" },
    { time: "18:00", label: "18:00 - 20:00" },
  ];

  useEffect(() => {
    if (aToken) getAllDoctors();
  }, [aToken]);

  // Xử lý chọn giờ (Chọn rồi thì bỏ, chưa chọn thì thêm)
  const handleSlotClick = (time) => {
    if (selectedSlots.includes(time)) {
      setSelectedSlots((prev) => prev.filter((t) => t !== time));
    } else {
      setSelectedSlots((prev) => [...prev, time].sort());
    }
  };

  const onSubmitHandler = async () => {
        if (!docId) return toast.error("Vui lòng chọn bác sĩ")
        if (!slotDate) return toast.error("Vui lòng chọn ngày")
        // Cho phép lưu mảng rỗng (để xóa lịch ngày đó nếu muốn)
        
        try {
            const dateArray = slotDate.split('-'); 
            const formattedDate = `${dateArray[2]}_${dateArray[1]}_${dateArray[0]}`;

            const { data } = await axios.post(backendUrl + '/api/admin/add-schedule', 
                { docId, slotDate: formattedDate, slotTimes: selectedSlots }, 
                { headers: { aToken } }
            )

            if (data.success) {
                toast.success("Đã cập nhật lịch thành công!")
                
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

  return (
    <div className="m-5 w-full">
      <p className="mb-4 text-lg font-medium">Thiết lập lịch làm việc</p>
      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl">
        {/* 1. Chọn Bác sĩ */}
        <div className="mb-4">
          <p className="mb-2">Chọn bác sĩ</p>
          <select
            onChange={(e) => setDocId(e.target.value)}
            value={docId}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">-- Chọn bác sĩ --</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name} - {doc.speciality}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Chọn Ngày */}
        <div className="mb-4">
          <p className="mb-2">Chọn ngày làm việc</p>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]} // Không cho chọn quá khứ
          />
        </div>
        {/* 2. HIỂN THỊ GRID MỚI */}
        <div className="mb-8">
          <p className="mb-2">Chọn khung giờ làm việc (Ca 2 tiếng)</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {timeSlots.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSlotClick(item.time)}
                className={`px-4 py-3 border rounded cursor-pointer transition-all text-sm font-medium
                            ${
                              selectedSlots.includes(item.time)
                                ? "bg-primary text-white border-primary shadow-md"
                                : "bg-white text-gray-700 hover:border-primary hover:bg-gray-50"
                            }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={onSubmitHandler} className='bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 shadow-lg transition-all'>
                Lưu lịch làm việc
            </button>
      </div>
    </div>
  );
};

export default DoctorSchedule;
