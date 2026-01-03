import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend 
} from 'recharts';
import { assets } from '../../assets/assets'

const Dashboard = () => {
  // Bỏ cancelAppointment vì không dùng danh sách lịch hẹn nữa
  const { aToken, getDashData, dashData } = useContext(AdminContext)
  const { currency } = useContext(AppContext) 
  
  // 1. STATE CHO LỊCH
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Set mặc định 30 ngày gần nhất
  useEffect(() => {
    const today = new Date();
    const priorDate = new Date();
    priorDate.setDate(today.getDate() - 30); 

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(priorDate.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + (currency || 'VND');
  }

  // 2. HÀM LỌC DỮ LIỆU CHUNG
  const filterByDate = (dataArray) => {
    if (!dataArray || !startDate || !endDate) return [];

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return dataArray.filter(item => {
        let itemDate;
        if (typeof item.date === 'string') {
            if (item.date.includes('/') || item.date.includes('_')) {
                const separator = item.date.includes('/') ? '/' : '_';
                const parts = item.date.split(separator);
                itemDate = new Date(parts[2], parts[1] - 1, parts[0]);
            } else {
                itemDate = new Date(item.date);
            }
        } else {
            itemDate = new Date(item.date);
        }
        
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= start && itemDate <= end;
    });
  }

  // 3. DỮ LIỆU ĐÃ LỌC
  const filteredAppointments = filterByDate(dashData.graphData);
  const filteredRevenue = filterByDate(dashData.revenueData);

  return dashData && (
    <div className='m-5 w-full'>
      
      {/* --- PHẦN 1: CÁC THẺ STATS --- */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
        <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all'>
            <div className="flex items-center gap-3 mb-2">
                <div className='p-2 bg-indigo-50 rounded-lg text-indigo-600'>
                    <img className="w-6 h-6" src={assets.list_icon || assets.speciality_icon} alt="" />
                </div>
                <p className='text-gray-500 text-sm font-medium'>Chuyên khoa</p>
            </div>
            <h3 className='text-2xl font-bold text-gray-800'>{dashData.specialities || 0}</h3>
        </div>
        <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all'>
            <div className="flex items-center gap-3 mb-2">
                <div className='p-2 bg-blue-50 rounded-lg text-blue-600'>
                     <img className="w-6 h-6" src={assets.people_icon} alt="" />
                </div>
                <p className='text-gray-500 text-sm font-medium'>Tổng bác sĩ</p>
            </div>
            <h3 className='text-2xl font-bold text-gray-800'>{dashData.doctors || 0}</h3>
        </div>
        <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all'>
             <div className="flex items-center gap-3 mb-2">
                <div className='p-2 bg-green-50 rounded-lg text-green-600'>
                    <img className="w-6 h-6" src={assets.people_icon} alt="" />
                </div>
                <p className='text-gray-500 text-sm font-medium'>Bệnh nhân</p>
            </div>
            <h3 className='text-2xl font-bold text-gray-800'>{dashData.patients || 0}</h3>
        </div>
        <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all'>
             <div className="flex items-center gap-3 mb-2">
                <div className='p-2 bg-yellow-50 rounded-lg text-yellow-600'>
                    <img className="w-6 h-6" src={assets.appointment_icon} alt="" />
                </div>
                <p className='text-gray-500 text-sm font-medium'>Lịch hẹn đã hoàn thành</p>
            </div>
            <h3 className='text-2xl font-bold text-gray-800'>{dashData.appointments || 0}</h3>
        </div>
        <div className='bg-gradient-to-br from-primary to-blue-600 p-4 rounded-xl shadow-md text-white hover:shadow-lg transition-all'>
             <div className="flex items-center gap-3 mb-2">
                <div className='p-2 bg-white/20 rounded-lg text-white'>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className='text-blue-100 text-sm font-medium'>Tổng Doanh Thu</p>
            </div>
            <h3 className='text-2xl font-bold'>{dashData.totalRevenue ? formatCurrency(dashData.totalRevenue) : ('0 ' + (currency || 'VND'))}</h3>
            <p className='text-xs text-blue-100 mt-1'>Đã xác nhận thanh toán</p>
        </div>
      </div>

      {/* --- PHẦN 2: HỆ THỐNG BIỂU ĐỒ --- */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          
          {/* Biểu đồ 1: Số lượng đặt lịch */}
          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
             <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
                  <h3 className='text-lg font-bold text-gray-800'>Xu hướng đặt lịch</h3>
                  
                  {/* --- BỘ CHỌN NGÀY --- */}
                  <div className='flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200'>
                     <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-semibold px-1">Từ ngày</span>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className='bg-white border border-gray-200 text-gray-700 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none' 
                        />
                     </div>
                     <span className="text-gray-400">-</span>
                     <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-semibold px-1">Đến ngày</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className='bg-white border border-gray-200 text-gray-700 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none' 
                        />
                     </div>
                  </div>

              </div>
              
              <div className='h-[350px] w-full'>
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredAppointments}>
                          <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                          <Tooltip contentStyle={{borderRadius: '8px'}} />
                          <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" name="Lịch hẹn" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Biểu đồ 2: Doanh thu */}
          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
             <div className='flex justify-between items-center mb-6'>
                  <h3 className='text-lg font-bold text-gray-800'>Doanh thu</h3>
                  <div className='p-1 bg-green-50 text-green-700 rounded text-xs font-bold px-3'>
                      {startDate && endDate 
                        ? `${startDate.split('-').reverse().join('/')} - ${endDate.split('-').reverse().join('/')}`
                        : 'Toàn bộ thời gian'
                      }
                  </div>
              </div>
              
              <div className='h-[350px] w-full'>
                  {dashData.revenueData && filteredRevenue.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={filteredRevenue}> 
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                              <Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                              <Legend />
                              <Bar dataKey="revenue" name="Doanh thu" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                          </BarChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
                          Chưa có dữ liệu doanh thu trong khoảng thời gian này
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  )
}

export default Dashboard