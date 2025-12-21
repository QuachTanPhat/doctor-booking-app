import { useState } from "react";
import { createContext } from "react";
import axios from "axios"
import { toast } from "react-toastify";
import { useEffect } from "react"; // Nhớ import useEffect
import { io } from "socket.io-client"; // Nhớ import io

export const AdminContext = createContext()

const AdminContextProvider = (props) => {
    const [aToken, setAToken] = useState(localStorage.getItem('aToken')? localStorage.getItem('aToken'):'')
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [specialities, setSpecialities] = useState([])
    const [users, setUsers] = useState([])
    // 1. Lắng nghe Socket để tự động cập nhật Dashboard/List
    useEffect(() => {
        const socket = io(backendUrl);
        socket.on('update-appointments', () => {
            if (aToken) {
                getAllAppointments();
                getDashData();
            }
        });
        socket.on('doctor-updated', () => {
             if (aToken) getAllDoctors();
        });
        return () => { socket.disconnect(); }
    }, [backendUrl, aToken])

    const getAllDoctors = async()=>{
        try {
            const {data} = await axios.post(backendUrl + '/api/admin/all-doctors', {}, {headers:{aToken}})
            if(data.success){
                setDoctors(data.doctors)
            } else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const changeAvailability = async (docId) => {
        try {
            const {data} = await axios.post(backendUrl + '/api/admin/change-availability', {docId}, {headers:{aToken}})
            if(data.success){
                toast.success(data.message)
                getAllDoctors()
            } else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)   
        }
    }

    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl+'/api/admin/appointments',{headers:{aToken}})
            if(data.success){
                setAppointments(data.appointments.reverse()) // Reverse để mới nhất lên đầu
            } else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }   

    const cancelAppointment = async (appointmentId) => {
        try {
            const {data} = await axios.post(backendUrl +'/api/admin/cancel-appointment',{appointmentId},{headers:{aToken}})
            if(data.success){
                toast.success(data.message)
                getAllAppointments()
            } else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // --- CÁC HÀM MỚI BỔ SUNG ---

    // 1. Hoàn thành lịch hẹn
    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/complete-appointment', { appointmentId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // 2. Xóa vĩnh viễn lịch hẹn
    const deleteAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/delete-appointment', { appointmentId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAllUsers = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/all-users', {}, { headers: { aToken } })
            if (data.success) {
                setUsers(data.users.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const changeUserStatus = async (userId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/change-user-status', { userId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllUsers() // Load lại danh sách để cập nhật giao diện
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // --- HẾT PHẦN BỔ SUNG ---

    const getAllSpecialities = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/all-specialities', { headers: { aToken } })
            if (data.success) {
                setSpecialities(data.specialities || [])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const addSpeciality = async (name, image) => {
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('image', image);

            const { data } = await axios.post(backendUrl + '/api/admin/add-speciality', formData, { headers: { aToken } });

            if (data.success) {
                toast.success(data.message);
                getAllSpecialities();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const updateSpeciality = async (id, name, description, imageFile) => {
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('name', name);
            formData.append('description', description);
            if (imageFile) formData.append('image', imageFile);

            const { data } = await axios.post(backendUrl + '/api/admin/update-speciality', formData, { headers: { aToken } });
            if (data.success) {
                toast.success(data.message);
                getAllSpecialities(); 
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const deleteSpeciality = async (id) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/delete-speciality', { id }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllSpecialities() 
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', {headers:{aToken}})
            if(data.success){
                setDashData(data.dashData)
            } else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const updateDoctor = async (formData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/update-doctor', formData, { headers: { aToken } });
            if (data.success) {
                toast.success(data.message);
                getAllDoctors(); 
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    }

    const deleteDoctor = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/delete-doctor', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors() 
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const approveAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/approve-appointment', { appointmentId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const value = {
        aToken, setAToken,  
        backendUrl, doctors,
        getAllDoctors, changeAvailability,
        appointments, setAppointments,
        getAllAppointments,
        cancelAppointment,
        dashData, getDashData,
        specialities,
        getAllSpecialities,
        addSpeciality,
        updateSpeciality,
        deleteSpeciality,
        deleteDoctor,
        updateDoctor, 
        completeAppointment, 
        deleteAppointment,
        approveAppointment,
        users, getAllUsers, changeUserStatus
    }

    return(
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider