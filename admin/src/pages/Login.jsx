// src/pages/Login.jsx
import React, { use } from 'react'
import {assets} from '../assets/assets'
import { useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../context/DoctorContext.jsx'

const Login = () => {
  
  const [state, setState] = useState('Admin') 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


  const {setAToken, backendUrl} = useContext(AdminContext)
  const {setDToken} = useContext(DoctorContext)

  const onSubmitHandler = async(event) => {
    event.preventDefault()

    try {

      if(state === 'Admin'){
          const {data} = await axios.post(backendUrl + '/api/admin/login',{email,password})
          if(data.success){
            localStorage.setItem('aToken',data.token)
            setAToken(data.token)
          }
          else{
            toast.error(data.message)
          }
      }
      else{
          const {data} = await axios.post(backendUrl + '/api/doctor/login',{email,password})
          if(data.success){
            localStorage.setItem('dToken',data.token)
            setDToken(data.token)
            console.log(data.token)
          }
          else{
            toast.error(data.message)
          }
      }
    } catch (error) {
      
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'>
            Đăng Nhập <span className='text-primary'>{state === 'Admin' ? 'Quản Trị Viên' : 'Bác Sĩ'}</span>
        </p>
        <div className='w-full' >
          <p>Email</p>
          <input onChange={(e)=>setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
        </div>
        <div className='w-full'> 
          <p>Mật khẩu</p>
          <input onChange={(e)=>setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
        </div>
        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Đăng nhập</button>
        {
          state === 'Admin' 
          ? <p>Đăng nhập dành cho Bác sĩ? <span className='text-primary underline cursor-pointer' onClick={()=>setState('Doctor')}>Tại đây</span></p>
          : <p>Đăng nhập dành cho Admin?  <span className='text-primary underline cursor-pointer' onClick={()=>setState('Admin')}>Tại đây</span></p>
        }
      </div>
    </form>
  )
}

export default Login