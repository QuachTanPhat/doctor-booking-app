import React from 'react'
import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, approveAppointment, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)


  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  return (
    <div className='w-full max-w-6xl m-5'>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b font-medium'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments.reverse().map((item, index) => (
          <div
            className='max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 flex flex-wrap justify-between'
            key={index}
          >

            <p className='max-sm:hidden'>{index + 1}</p>
            <div className='flex items-center gap-2'>
              <img className='w-8 rounded-full' src={item.userData.image} alt="" />
              <p>{item.userData.name}</p>
            </div>
            <div>
              <p className='text-xs inline border border-primary px-2 rounded-full'>
                {item.payment ? 'Online' : 'CASH'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{item.amount}</p>
            {
              item.cancelled
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : item.isCompleted
                  ? <p className='text-green-400 text-xs font-medium'>Completed</p>
                  : !item.isApproved ?
                    (
                      <div className='flex gap-2'>
                        <button onClick={() => approveAppointment(item._id)} className='bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600'>Accept</button>
                        <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                      </div>
                    )
                    :
                    (
                  
                    item.paymentMethod === 'CASH'
                    ? (
                         <div className='flex gap-1 items-center'>
                            <p className='text-xs border px-2 py-1 rounded bg-gray-100'>Pay at Clinic</p>
                            <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                        </div>
                    )
                    : (
                        item.payment 
                        ? (
                             <div className='flex gap-1 items-center'>
                                <p className='text-xs text-green-600 border border-green-600 px-2 py-1 rounded'>Paid Online</p>
                                <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                            </div>
                        ) 
                        : (
                            <p className='text-xs text-orange-500 border border-orange-500 px-2 py-1 rounded'>Waiting Payment...</p>
                        )
                    )
                  )
            }

          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorAppointments