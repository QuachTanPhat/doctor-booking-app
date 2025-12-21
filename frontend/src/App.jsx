import React from 'react'
import Home from './pages/Home'
import {Route, Routes} from 'react-router-dom'
import Doctor from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointments from './pages/Appointments'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import { ToastContainer, toast } from 'react-toastify'
import AiPrediction from './pages/AiPrediction';
const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]' >
      <ToastContainer/>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/doctors' element={<Doctor/>}></Route>
        <Route path='/doctors/:speciality' element={<Doctor/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/about' element={<About/>}></Route>
        <Route path='/contact' element={<Contact/>}></Route>
        <Route path='/my-profile' element={<MyProfile/>}></Route>
        <Route path='/my-appointments' element={<MyAppointments/>}></Route>
        <Route path='/appointment/:docId' element={<Appointments/>}></Route>
        <Route path='/ai-predict' element={<AiPrediction />} />
      </Routes>
      <ChatWidget />
      <Footer/>
    </div>
  )
}

export default App