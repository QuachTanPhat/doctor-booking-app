import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData, appointments, getUserAppointments } = useContext(AppContext);

  const [paymentOrderId, setPaymentOrderId] = useState(null);
  const [paymentOrderData, setPaymentOrderData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const months = ["", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const SEPAY_ACCOUNT = import.meta.env.VITE_SEPAY_ACCOUNT;
  const SEPAY_BANK = import.meta.env.VITE_SEPAY_BANK;

  // --- 1. POLLING: Tự động tải lại dữ liệu mỗi 5 giây ---
  useEffect(() => {
    if (token) {
        // Gọi ngay lần đầu
        getUserAppointments();

        // Thiết lập gọi định kỳ
        const intervalId = setInterval(() => {
            // console.log("🔄 Đang cập nhật dữ liệu..."); // Debug
            getUserAppointments(); 
        }, 5000); // 5000ms = 5 giây

        // Dọn dẹp khi component bị hủy (rời trang)
        return () => clearInterval(intervalId);
    }
  }, [token]);

  // --- 2. Logic tự động đóng Popup nếu đơn bị hủy ---
  useEffect(() => {
    if (paymentOrderId && appointments.length > 0) {
        const currentOrder = appointments.find(app => app._id === paymentOrderId);
        
        // Nếu đơn hàng đang mở thanh toán bỗng nhiên bị Hủy hoặc Đã xong
        if (currentOrder && (currentOrder.cancelled || currentOrder.isCompleted || currentOrder.payment)) {
            closePaymentPopup();
            if (currentOrder.cancelled) toast.error("Đơn hàng đã bị hủy do quá hạn!");
            if (currentOrder.payment) toast.success("Đơn hàng đã được thanh toán!");
        }
    }
  }, [appointments]); // Theo dõi sự thay đổi của danh sách đơn

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return dateArray[0] + " " + months[Number(dateArray[1])] + ", " + dateArray[2];
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/cancel-appointment", { appointmentId }, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handlePayClick = (item) => {
    // --- Kiểm tra chặn trước khi mở Popup ---
    if (item.cancelled) {
        toast.error("Lịch hẹn này đã bị hủy!");
        getUserAppointments();
        return;
    }
    
    if (item.payment) {
        toast.info("Lịch hẹn này đã được thanh toán!");
        getUserAppointments();
        return;
    }

    const savedSession = localStorage.getItem(`payment_session_${item._id}`);
    let expireTime;
    const now = Date.now();

    if (savedSession) {
      const sessionData = JSON.parse(savedSession);
      if (sessionData.expireTime > now) {
        expireTime = sessionData.expireTime;
      } else {
        expireTime = now + 300 * 1000;
        localStorage.setItem(`payment_session_${item._id}`, JSON.stringify({ expireTime }));
      }
    } else {
      expireTime = now + 300 * 1000;
      localStorage.setItem(`payment_session_${item._id}`, JSON.stringify({ expireTime }));
    }

    setPaymentOrderId(item._id);
    setPaymentOrderData(item);
    setTimeLeft(Math.floor((expireTime - now) / 1000));
    localStorage.setItem("current_active_payment_id", item._id);
    window.scrollTo(0, 0);
  };

  const closePaymentPopup = () => {
    setPaymentOrderId(null);
    setPaymentOrderData(null);
    localStorage.removeItem("current_active_payment_id");
  };

  // Logic giữ Popup khi F5 (giữ nguyên code cũ của bạn)
  useEffect(() => {
    if (appointments.length > 0) {
      const activeId = localStorage.getItem("current_active_payment_id");
      if (activeId) {
        const item = appointments.find((app) => app._id === activeId);
        const savedSession = localStorage.getItem(`payment_session_${activeId}`);

        if (item && !item.payment && !item.cancelled && savedSession) {
          const { expireTime } = JSON.parse(savedSession);
          const now = Date.now();
          if (expireTime > now) {
            setPaymentOrderId(activeId);
            setPaymentOrderData(item);
            setTimeLeft(Math.floor((expireTime - now) / 1000));
          } else {
            localStorage.removeItem("current_active_payment_id");
            localStorage.removeItem(`payment_session_${activeId}`);
          }
        }
      }
    }
  }, [appointments]);

  // Logic đếm ngược thời gian và check payment thủ công (giữ nguyên)
  useEffect(() => {
    let intervalId;
    let timerId;

    if (paymentOrderId) {
      intervalId = setInterval(async () => {
        try {
          // Vẫn giữ check thủ công này để phản hồi nhanh hơn Polling chung
          const { data } = await axios.post(backendUrl + "/api/user/check-payment-status", { appointmentId: paymentOrderId }, { headers: { token } });
          if (data.success && data.paid) {
            clearInterval(intervalId);
            clearInterval(timerId);
            localStorage.removeItem("current_active_payment_id");
            localStorage.removeItem(`payment_session_${paymentOrderId}`);
            setPaymentOrderId(null);
            setPaymentOrderData(null);
            toast.success("Thanh toán thành công!");
            getUserAppointments();
          }
        } catch (error) {
          console.log("Check error:", error);
        }
      }, 3000);

      timerId = setInterval(() => {
        const savedSession = localStorage.getItem(`payment_session_${paymentOrderId}`);
        if (savedSession) {
          const { expireTime } = JSON.parse(savedSession);
          const secondsLeft = Math.floor((expireTime - Date.now()) / 1000);
          if (secondsLeft <= 0) {
            clearInterval(intervalId);
            clearInterval(timerId);
            localStorage.removeItem("current_active_payment_id");
            localStorage.removeItem(`payment_session_${paymentOrderId}`);
            setPaymentOrderId(null);
            setPaymentOrderData(null);
            toast.error("Giao dịch đã hết hạn!");
          } else {
            setTimeLeft(secondsLeft);
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timerId) clearInterval(timerId);
    };
  }, [paymentOrderId, backendUrl, token]);


  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">Lịch hẹn của tôi</p>

      {/* --- POPUP THANH TOÁN SEPAY QR --- */}
      {paymentOrderId && paymentOrderData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 md:p-8 relative flex flex-col md:flex-row gap-8">
            <button onClick={closePaymentPopup} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl leading-none transition-colors">&times;</button>
            <div className="flex-1 border-r border-gray-100 pr-0 md:pr-8 pt-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán đơn hàng</h2>
              <p className="text-sm text-gray-500 mb-6">Vui lòng thanh toán trước khi thời gian kết thúc</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <img className="w-16 h-16 object-cover rounded-full bg-white border shadow-sm" src={paymentOrderData.docData.image} alt="" />
                  <div>
                    <p className="text-lg font-bold text-blue-900">{paymentOrderData.docData.name}</p>
                    <p className="text-sm text-blue-600 font-medium">{paymentOrderData.docData.speciality}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ngày khám</span>
                    <span className="font-medium text-gray-800">{slotDateFormat(paymentOrderData.slotDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Giờ khám</span>
                    <span className="font-medium text-gray-800">{paymentOrderData.slotTime}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Tổng cộng</span>
                    <span className="text-2xl font-bold text-blue-600">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(paymentOrderData.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 mb-6">
                <img className="w-64 h-64 object-contain" src={`https://qr.sepay.vn/img?acc=${SEPAY_ACCOUNT}&bank=${SEPAY_BANK}&amount=${paymentOrderData.amount}&des=${paymentOrderData._id}`} alt="SePay QR" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Giao dịch hết hạn sau</p>
                <div className={`text-4xl font-mono font-bold tracking-widest ${timeLeft < 60 ? "text-red-600 animate-pulse" : "text-gray-800"}`}>{formatTime(timeLeft)}</div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                <span>Đang chờ xác nhận thanh toán...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DANH SÁCH LỊCH HẸN --- */}
      <div>
        {appointments.map((item, index) => (
          <div className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b" key={index}>
            <div>
              <img className="w-32 bg-indigo-50" src={item.docData.image} alt="" />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">Thời gian:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>

            <div className="flex flex-col gap-2 justify-end">

              {/* --- ƯU TIÊN 1: ĐÃ HỦY --- */}
              {item.cancelled && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500 bg-white cursor-default">
                  Đã hủy
                </button>
              )}

              {/* --- ƯU TIÊN 2: ĐÃ HOÀN THÀNH (Quan trọng nhất) --- */}
              {!item.cancelled && item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-blue-500 rounded text-blue-500 bg-blue-50 cursor-default font-medium">
                  Đã hoàn thành
                </button>
              )}

              {/* --- CÁC TRẠNG THÁI TRUNG GIAN --- */}
              {!item.cancelled && !item.isCompleted && (
                <>
                  {/* TRƯỜNG HỢP 1: ONLINE */}
                  {item.paymentMethod === 'ONLINE' && (
                    <>
                      {/* Chưa thanh toán -> Nút thanh toán */}
                      {!item.payment && !item.isApproved && (
                        <button
                          onClick={() => handlePayClick(item)}
                          className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                        >
                          Thanh toán Online
                        </button>
                      )}

                      {/* Đã thanh toán nhưng chưa duyệt -> Chờ duyệt */}
                      {item.payment && !item.isApproved && (
                        <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500 bg-green-50 cursor-default">
                          Đã thanh toán (Chờ duyệt)
                        </button>
                      )}
                    </>
                  )}

                  {/* TRƯỜNG HỢP 2: TIỀN MẶT (Chưa duyệt) */}
                  {item.paymentMethod === 'CASH' && !item.isApproved && (
                    <button className="text-sm text-stone-500 sm:min-w-48 py-2 border rounded bg-gray-50 cursor-default">
                      Chờ xác nhận...
                    </button>
                  )}

                  {/* TRƯỜNG HỢP 3: ĐÃ ĐƯỢC DUYỆT */}
                  {item.isApproved && (
                    <button className='text-sm sm:min-w-48 py-2 border rounded bg-green-100 text-green-700 font-medium cursor-default border-green-200'>
                      Đã được xác nhận ✅
                    </button>
                  )}

                  {/* NÚT HỦY */}
                  {!item.isApproved && !item.payment && (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      Hủy lịch hẹn
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;