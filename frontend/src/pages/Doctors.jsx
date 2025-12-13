import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { specialityData } from '../assets/assets';

const Doctor = () => {
  const {speciality} = useParams()
  const [filterDoc,setFilterDoc] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate();
  
  const {doctors} = useContext(AppContext);
  const applyFilter = () =>{
    if(speciality){
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else{
      setFilterDoc(doctors)
    }
  }
  useEffect(()=>{
    applyFilter()
  },[doctors,speciality])
  
  const specialities = specialityData.map(item=>item.speciality)

  return (
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilters ? 'bg-primary text-white' : ''}`} onClick={()=>setShowFilters(prev => !prev)}>Filters</button>
        <div className={`flex flex-col gap-4 text-sm text-gray-600 ${showFilters ? 'flex' : 'hidden sm:flex'} `}>
          {specialities.map((spec, index) => (
            <p 
              key={index}
              onClick={() => speciality === spec ? navigate('/doctors') : navigate(`/doctors/${spec}`)}
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer 
              ${speciality === spec ? "bg-indigo-100 text-black font-medium" : ""}`}>
              {spec}
            </p>
          ))}
        </div>
        <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 px-3 sm:px-0'>
          {
            filterDoc.map((item,index) =>(
            <div onClick={()=>navigate(`/appointment/${item._id}`)} className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={index}>
              <img className='bg-blue-50' src={item.image} alt="" />
              <div className='p-4'>
                <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                  <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
                </div>
                <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                <p className='text-gray-600 text-sm'>{item.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Doctor