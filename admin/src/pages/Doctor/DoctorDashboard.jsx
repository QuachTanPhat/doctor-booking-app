import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const DoctorDashboard = () => {
  const { dToken, dashData, setDashData, getDashData } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const [filterTime, setFilterTime] = useState('30days');

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  return dashData && (
    <div className='m-5 w-full'>
      
      {/* --- PHẦN 1: CÁC THẺ STATS (3 Cột) --- */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        
        {/* Card 1: Thu nhập */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all'>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className='text-gray-500 text-sm font-medium'>Tổng thu nhập</p>
                    <h3 className='text-3xl font-bold text-gray-800 mt-2'>
                        {new Intl.NumberFormat('vi-VN').format(dashData.earnings)} {currency}
                    </h3>
                </div>
                {/* Badge trang trí */}
                <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    $
                </span>
            </div>
            <p className='text-xs text-gray-400'>Thu nhập từ các ca khám hoàn thành</p>
        </div>

        {/* Card 2: Tổng lịch hẹn */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all'>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className='text-gray-500 text-sm font-medium'>Tổng lịch hẹn</p>
                    <h3 className='text-3xl font-bold text-gray-800 mt-2'>{dashData.appointments}</h3>
                </div>
                <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    +
                </span>
            </div>
            <p className='text-xs text-gray-400'>Số lượng bệnh nhân đã đặt lịch</p>
        </div>

        {/* Card 3: Bệnh nhân */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all'>
             <div className="flex justify-between items-start mb-4">
                <div>
                    <p className='text-gray-500 text-sm font-medium'>Số bệnh nhân</p>
                    <h3 className='text-3xl font-bold text-gray-800 mt-2'>{dashData.patients}</h3>
                </div>
                <span className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    User
                </span>
            </div>
            <p className='text-xs text-gray-400'>Bệnh nhân từng khám tại phòng mạch</p>
        </div>

      </div>

      {/* --- PHẦN 2: BIỂU ĐỒ SÓNG (Doanh số/Lịch hẹn) --- */}
      <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
          
          <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
              <div>
                  <h3 className='text-lg font-bold text-gray-800'>Biểu đồ lượt khám</h3>
                  <p className='text-sm text-gray-400 mt-1'>Thống kê số lượng bệnh nhân theo ngày</p>
              </div>
              
              <div className='flex bg-gray-50 p-1 rounded-lg'>
                  <button onClick={()=>setFilterTime('3months')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filterTime === '3months' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>3 tháng</button>
                  <button onClick={()=>setFilterTime('30days')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filterTime === '30days' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>30 ngày</button>
                  <button onClick={()=>setFilterTime('7days')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${filterTime === '7days' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>7 ngày</button>
              </div>
          </div>

          <div className='h-[350px] w-full'>
              {dashData.graphData && dashData.graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashData.graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCountDoc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/> 
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#9CA3AF', fontSize: 12}} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#9CA3AF', fontSize: 12}} 
                            allowDecimals={false} // Không hiện số lẻ
                        />
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                            cursor={{stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4'}} 
                        />
                        {/* Dùng màu xanh lá (Green) để khác biệt với Admin (Blue) */}
                        <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#10B981" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorCountDoc)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                    <p>Chưa có dữ liệu thống kê</p>
                </div>
              )}
          </div>
      </div>
    </div>
  )
}

export default DoctorDashboard