import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'
import { io } from "socket.io-client";

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currentSymbol = 'VNĐ'
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    
    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)
    const [userData, setUserData] = useState(false)
    const [appointments, setAppointments] = useState([])
    const [specialities, setSpecialities] = useState([]); // State lưu chuyên khoa
    const [isChatOpen, setIsChatOpen] = useState(false);

    // 1. Hàm lấy danh sách Bác sĩ
    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // 2. Hàm lấy danh sách Chuyên khoa (Public)
    const getSpecialityData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-specialities');
            if (data.success) {
                setSpecialities(data.specialities);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    // 3. Hàm lấy User Profile
    const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });

      if (data.success) {
        setUserData(data.userData);
      } else {
        // --- LOGIC ĐÁ NGƯỜI DÙNG RA KHI BỊ BLOCK ---
        if (data.message === 'Tài khoản đã bị khóa bởi Admin!') {
            localStorage.setItem("blocked_msg", "true");
           
            
            // 1. Xóa sạch dữ liệu
            setToken(false);
            localStorage.removeItem("token");
            setUserData(false);
            
            window.location.href = '/login'; 
        } else {
            toast.error(data.message);
        }
      }
    } catch (error) {
      console.log(error);
      // Không toast lỗi ở đây để tránh spam thông báo mỗi 10s nếu mất mạng
    }
  };

    // 4. Hàm lấy danh sách Lịch hẹn của User
    const getUserAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointment', { headers: { token } })
            if (data.success) {
                setAppointments(data.appointment.reverse())
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // 5. USE EFFECT KHỞI TẠO (Chạy 1 lần)
    useEffect(() => {
        getDoctorsData()
        getSpecialityData() // <--- GỌI HÀM NÀY ĐỂ LẤY CHUYÊN KHOA KHI APP CHẠY
    }, [])

    // 6. USE EFFECT KHI TOKEN THAY ĐỔI (Đăng nhập/Đăng xuất)
    useEffect(() => {
        if (token) {
            loadUserProfileData()
            getUserAppointments()
        } else {
            setUserData(false)
            setAppointments([])
        }
    }, [token])

    // useEffect(() => {
    //     if (token) {
    //         const timer = setInterval(() => {
    //             loadUserProfileData(); // Gọi hàm này để check trạng thái
    //         }, 5000); // 5 giây check 1 lần

    //         return () => clearInterval(timer);
    //     }
    // }, [token]);
    // 7. SOCKET IO (Realtime)
    useEffect(() => {
        // Kết nối socket
        const socket = io(backendUrl);

        socket.on('update-availability', () => {
            getDoctorsData(); // Load lại danh sách bác sĩ
        });

        socket.on('update-appointments', () => {
            if (token) {
                getUserAppointments(); // Load lại lịch hẹn cá nhân
                getDoctorsData(); // Load lại bác sĩ (để cập nhật slot đã đặt)
            }
        });
        socket.on('doctor-updated', () => {
            getDoctorsData(); 
           
        });
        socket.on('doctor-added', (newDoctor) => {
            setDoctors((prev) => [...prev, newDoctor]);
            toast.info(`👨‍⚕️ Bác sĩ ${newDoctor.name} vừa gia nhập hệ thống!`);
        });

        // B. Sự kiện: Thêm chuyên khoa mới
        socket.on('speciality-added', (newSpeciality) => {
            setSpecialities((prev) => [...prev, newSpeciality]);
            // toast.info(`🏥 Chuyên khoa mới: ${newSpeciality.name}`);
        });

        // C. Sự kiện: Cập nhật chuyên khoa (Sửa tên/ảnh)
        socket.on('speciality-updated', (updatedSpeciality) => {
            setSpecialities((prev) => 
                prev.map((item) => 
                    item._id === updatedSpeciality._id ? updatedSpeciality : item
                )
            );
        });
        return () => {
            socket.disconnect();
        }
    }, [backendUrl, token]) 

    const value = {
        doctors, getDoctorsData,
        currentSymbol,
        token, setToken,
        backendUrl,
        userData, setUserData, loadUserProfileData,
        appointments, setAppointments, getUserAppointments,
        specialities, getSpecialityData, 
        isChatOpen, setIsChatOpen
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;