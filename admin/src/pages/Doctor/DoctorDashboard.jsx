import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend // Import thêm BarChart
} from 'recharts';

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  
  // 1. STATE CHO LỊCH
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  useEffect(() => {
    const today = new Date();
    const priorDate = new Date();
    priorDate.setDate(today.getDate() - 30); 

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(priorDate.toISOString().split('T')[0]);
  }, []);

  // Hàm format tiền tệ
  const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + (currency || 'VND');
  }

  // 2. HÀM LỌC DỮ LIỆU
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

  // 3. LỌC DỮ LIỆU CHO CẢ 2 BIỂU ĐỒ
  const filteredGraphData = dashData.graphData ? filterByDate(dashData.graphData) : [];
  const filteredRevenueData = dashData.revenueData ? filterByDate(dashData.revenueData) : []; // Dữ liệu doanh thu

  return dashData && (
    <div className='m-5 w-full'>
      
      {/* --- PHẦN 1: CÁC THẺ STATS --- */}
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
                <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full flex items-center">$</span>
            </div>
            <p className='text-xs text-gray-400'>Thu nhập từ các ca khám hoàn thành</p>
        </div>

        {/* Card 2: Tổng lịch hẹn */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all'>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className='text-gray-500 text-sm font-medium'>Tổng lịch khám đã hoàn thành</p>
                    <h3 className='text-3xl font-bold text-gray-800 mt-2'>{dashData.appointments}</h3>
                </div>
                <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full flex items-center">+</span>
            </div>
            <p className='text-xs text-gray-400'>Số lượng lịch khám đã hoàn thành</p>
        </div>

        {/* Card 3: Bệnh nhân */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all'>
             <div className="flex justify-between items-start mb-4">
                <div>
                    <p className='text-gray-500 text-sm font-medium'>Số bệnh nhân</p>
                    <h3 className='text-3xl font-bold text-gray-800 mt-2'>{dashData.patients}</h3>
                </div>
                <span className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-1 rounded-full flex items-center">User</span>
            </div>
            <p className='text-xs text-gray-400'>Bệnh nhân từng khám</p>
        </div>
      </div>

      {/* --- PHẦN 2: HỆ THỐNG BIỂU ĐỒ (2 CỘT) --- */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          
          {/* CỘT TRÁI: BIỂU ĐỒ LƯỢT KHÁM */}
          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
                  <div>
                      <h3 className='text-lg font-bold text-gray-800'>Lượt khám</h3>
                      <div className='text-sm text-gray-400 mt-1 flex items-center gap-2'>
                        {/* INPUT CHỌN NGÀY */}
                        <div className='flex items-center gap-2 bg-gray-50 p-1 rounded border border-gray-200'>
                             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className='bg-transparent text-xs outline-none w-24' />
                             <span>-</span>
                             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className='bg-transparent text-xs outline-none w-24' />
                        </div>
                      </div>
                  </div>
              </div>

              <div className='h-[300px] w-full'>
                  {filteredGraphData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredGraphData}>
                            <defs>
                                <linearGradient id="colorCountDoc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/> 
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} allowDecimals={false} />
                            <Tooltip contentStyle={{borderRadius: '8px'}} cursor={{stroke: '#10B981', strokeDasharray: '4 4'}} />
                            <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorCountDoc)" name="Lượt khám" />
                        </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 border border-dashed rounded-lg">Không có dữ liệu</div>
                  )}
              </div>
          </div>

          {/* CỘT PHẢI: BIỂU ĐỒ DOANH THU (MỚI) */}
          <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
              <div className='flex justify-between items-center mb-6'>
                  <h3 className='text-lg font-bold text-gray-800'>Doanh thu</h3>
                  <div className='p-1 bg-blue-50 text-blue-700 rounded text-xs font-bold px-3'>
                      {startDate && endDate ? `${startDate.split('-').reverse().join('/')} - ${endDate.split('-').reverse().join('/')}` : '...'}
                  </div>
              </div>

              <div className='h-[300px] w-full'>
                  {dashData.revenueData && filteredRevenueData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={filteredRevenueData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                              <Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                              <Legend />
                              {/* Cột màu xanh dương cho tiền */}
                              <Bar dataKey="revenue" name="Doanh thu" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                          </BarChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
                          Chưa có dữ liệu doanh thu
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  )
}

export default DoctorDashboard