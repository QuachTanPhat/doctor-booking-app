import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom' 
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {

  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()
  const location = useLocation() 

  const [state, setState] = useState('Login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('') 

  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Hàm helper để reset lỗi khi user bắt đầu gõ
  const handleInput = (e) => e.target.setCustomValidity('');

  useEffect(() => {
    // Kiểm tra xem có cờ "blocked_msg" trong localStorage không
    if (localStorage.getItem("blocked_msg")) {
        toast.error("Phiên đăng nhập hết hạn hoặc tài khoản đã bị vô hiệu hóa!");
        localStorage.removeItem("blocked_msg"); 
    }
  }, []);

  // Tự động chuyển tab nếu có yêu cầu từ Navbar
  useEffect(() => {
    if (location.state?.openSignUp) {
      setState('Sign Up')
    } else {
      setState('Login') 
    }
  }, [location.state])

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password, username })
        if (data.success) {
          toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.");
          setState('Login');
          setPassword('');
        } else {
          toast.error(data.message)
        }
      }
      else if (state === 'Login') {
        const { data } = await axios.post(backendUrl + '/api/user/login', { username, password })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success("Đăng nhập thành công!");
        } else {
          toast.error(data.message)
        }
      }
      else if (state === 'Forgot') {
        const { data } = await axios.post(backendUrl + '/api/user/send-otp', { email })
        if (data.success) {
          toast.success(data.message)
          setState('Reset')
        } else {
          toast.error(data.message)
        }
      }
      else if (state === 'Reset') {
        const { data } = await axios.post(backendUrl + '/api/user/reset-password', { email, otp, newPassword })
        if (data.success) {
          toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập!")
          setState('Login')
          setOtp('')
          setNewPassword('')
          setPassword('')
        } else {
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
        toast.success("Đăng nhập bằng Google thành công!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi xác thực Google");
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} autoComplete="off" className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>

        <p className='text-2xl font-semibold'>
          {state === 'Sign Up' ? "Tạo tài khoản" :
            state === 'Login' ? "Đăng nhập" :
            state === 'Forgot' ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
        </p>

        <p>
          {state === 'Sign Up' ? "Đăng ký ngay để đặt lịch khám bệnh" :
            state === 'Login' ? "Vui lòng đăng nhập để đặt lịch khám bệnh" :
            state === 'Forgot' ? "Nhập email đã đăng ký để nhận mã OTP" : "Nhập mã OTP và mật khẩu mới"}
        </p>

        {/* 1. Tên tài khoản (Username): Hiện khi Đăng ký HOẶC Đăng nhập */}
        {(state === 'Sign Up' || state === 'Login') && (
          <div className='w-full'>
            <p>Tên đăng nhập</p>
            <input 
              className='border border-zinc-300 rounded w-full p-2 mt-1 outline-primary' 
              type="text" 
              onChange={(e) => setUsername(e.target.value)} 
              value={username} 
              required 
              placeholder="Nhập tên đăng nhập"
              // Việt hóa lỗi
              onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập tên đăng nhập')}
              onInput={handleInput}
            />
          </div>
        )}

        {/* 2. Họ và tên: Chỉ hiện khi Đăng ký */}
        {state === 'Sign Up' && (
          <div className='w-full'>
            <p>Họ và tên</p>
            <input 
                className='border border-zinc-300 rounded w-full p-2 mt-1 outline-primary' 
                type="text" 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                required 
                placeholder="Nhập họ và tên đầy đủ"
                // Việt hóa lỗi
                onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập họ và tên')}
                onInput={handleInput}
            />
          </div>
        )}

        {/* 3. Email: Hiện khi Đăng ký, Quên MK, Reset. KHÔNG hiện khi Đăng nhập */}
        {(state === 'Sign Up' || state === 'Forgot' || state === 'Reset') && (
          <div className='w-full'>
            <p>Email</p>
            <input 
                className='border border-zinc-300 rounded w-full p-2 mt-1 outline-primary' 
                type="email" 
                onChange={(e) => setEmail(e.target.value)} 
                value={email} 
                required 
                placeholder="Nhập địa chỉ email"
                // Việt hóa lỗi
                onInvalid={(e) => {
                    if (e.target.validity.valueMissing) {
                        e.target.setCustomValidity('Vui lòng nhập email');
                    } else if (e.target.validity.typeMismatch) {
                        e.target.setCustomValidity('Email không đúng định dạng');
                    }
                }}
                onInput={handleInput}
            />
          </div>
        )}

        {/* Mật khẩu: Hiện khi Đăng nhập hoặc Đăng ký */}
        {(state === 'Login' || state === 'Sign Up') && (
          <div className='w-full'>
            <p>Mật khẩu</p>
            <input 
                className='border border-zinc-300 rounded w-full p-2 mt-1 outline-primary' 
                type="password" 
                onChange={(e) => setPassword(e.target.value)} 
                value={password} 
                required 
                placeholder="Nhập mật khẩu"
                // Việt hóa lỗi
                onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập mật khẩu')}
                onInput={handleInput}
            />
          </div>
        )}

        {/* Phần Reset MK: OTP và MK Mới */}
        {state === 'Reset' && (
          <>
            <div className='w-full'>
              <p>Mã OTP (6 số)</p>
              <input 
                className='border border-zinc-300 rounded w-full p-2 mt-1 text-center tracking-widest text-lg outline-primary' 
                type="text" 
                maxLength="6" 
                onChange={(e) => setOtp(e.target.value)} 
                value={otp} 
                required 
                placeholder="------" 
                // Việt hóa lỗi
                onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập mã OTP')}
                onInput={handleInput}
              />
            </div>
            <div className='w-full'>
              <p>Mật khẩu mới</p>
              <input 
                className='border border-zinc-300 rounded w-full p-2 mt-1 outline-primary' 
                type="password" 
                onChange={(e) => setNewPassword(e.target.value)} 
                value={newPassword} 
                required 
                placeholder="Nhập mật khẩu mới"
                // Việt hóa lỗi
                onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập mật khẩu mới')}
                onInput={handleInput}
              />
            </div>
          </>
        )}

        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base hover:bg-primary/90 transition-all'>
          {state === 'Sign Up' ? "Tạo tài khoản" :
            state === 'Login' ? "Đăng nhập" :
            state === 'Forgot' ? "Gửi mã xác nhận" : "Đổi mật khẩu"}
        </button>

        {/* Nút đăng nhập Google */}
        {(state === 'Login' || state === 'Sign Up') && (
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
        )}

        {/* Footer chuyển đổi trạng thái */}
        {state === 'Login' ? (
          <div className="w-full text-sm mt-1">
            <p className="mb-2">Quên mật khẩu? <span onClick={() => setState('Forgot')} className='text-primary underline cursor-pointer'>Lấy lại mật khẩu</span></p>
            <p>Chưa có tài khoản? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Đăng ký ngay</span></p>
          </div>
        ) : (
          (state === 'Forgot' || state === 'Reset') ? (
            <p className="mt-2 w-full text-center">Quay lại <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Đăng nhập</span></p>
          ) : (
            <p className="mt-2">Bạn đã có tài khoản? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Đăng nhập tại đây</span></p>
          )
        )}

      </div>
    </form>
  )
}

export default Login