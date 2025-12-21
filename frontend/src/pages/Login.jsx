import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {

  const {backendUrl, token, setToken} = useContext(AppContext)
  const navigate = useNavigate()
  const [state, setState] = useState('Sign Up') 

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  
  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if(state === 'Sign Up'){

        const {data} = await axios.post(backendUrl + '/api/user/register', {name,password,email})
        if (data.success){
           localStorage.setItem('token', data.token)
           setToken(data.token)
        }
        else{
          toast.error(data.message)
        }
      }
      else{
        const {data} = await axios.post(backendUrl + '/api/user/login', {password,email})
        if (data.success){
           localStorage.setItem('token', data.token)
           setToken(data.token)
        }
        else{
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/google-login', { 
        googleToken: credentialResponse.credential 
      });

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        toast.success("Đăng nhập Google thành công!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi xác thực Google");
      console.error(error);
    }
  };

  useEffect(() => {
    if(token){
      navigate('/')
    }
  },[token])


  return (
    <form onSubmit={onSubmitHandler} autoComplete="off" className='min-h-[80vh] flex items-center'>
        <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
          <p className='text-2xl font-semibold'>{state === 'Sign Up' ? "Tạo tài khoản" : "Đăng nhập"}</p>
          <p>Vui lòng {state === 'Sign Up' ? "đăng ký" : "đăng nhập"} để đặt lịch khám bệnh</p>
          {
            state === 'Sign Up' && <div className='w-full'>
              <p>Họ và tên</p>
              <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e)=>setName(e.target.value)} value={name} required/>
            </div>
          }
          <div className='w-full'>
            <p>Email</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e)=>setEmail(e.target.value)} value={email} required/>
          </div>
           <div className='w-full'>
            <p>Mật khẩu</p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e)=>setPassword(e.target.value)} value={password} required/>
          </div>
          <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>
            {state === 'Sign Up' ? "Tạo tài khoản" : "Đăng nhập"}
            
          </button>
            {/* --- GOOGLE LOGIN --- */}
          <div className="w-full flex flex-col items-center gap-2 mt-2">
              <div className="relative flex py-1 items-center w-full">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-2 text-gray-400 text-xs">Hoặc</span>
                  <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <div className='w-full flex justify-center'>
                  <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={() => {
                          console.log('Login Failed');
                          toast.error("Đăng nhập Google thất bại");
                      }}
                  />
              </div>
          </div>
          
          {
              state === 'Sign Up'
              ? <p>Bạn đã có tài khoản? <span onClick={()=>setState('Login')} className='text-primary underline cursor-pointer'>Đăng nhập tại đây</span></p>
              : <p>Chưa có tài khoản? <span onClick={()=>setState('Sign Up')} className='text-primary underline cursor-pointer'>Đăng ký ngay</span></p>
          }
        </div>
    </form>
  )
}

export default Login