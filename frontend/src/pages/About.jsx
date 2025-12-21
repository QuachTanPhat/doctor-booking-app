import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
        <div className='text-center text-2xl pt-10 text-gray-500'>
          <p className='text-gray-700 font-medium'>VỀ CHÚNG TÔI</p>
        </div>

        <div className='my-10 flex flex-col  md:flex-row gap-12'>
          <img className='w-full md:max-w-[360px]' src={assets.about_image} alt="" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
            <p>Chào mừng đến với Prescripto, đối tác tin cậy của bạn trong việc quản lý nhu cầu chăm sóc sức khỏe một cách thuận tiện và hiệu quả. Tại Prescripto, chúng tôi thấu hiểu những thách thức mà mọi người gặp phải khi sắp xếp lịch khám bệnh và quản lý hồ sơ sức khỏe cá nhân.</p>
            <p>Prescripto cam kết mang lại sự xuất sắc trong công nghệ y tế. Chúng tôi không ngừng nỗ lực cải tiến nền tảng, tích hợp những tiến bộ mới nhất để nâng cao trải nghiệm người dùng và cung cấp dịch vụ vượt trội. Dù bạn đang đặt lịch khám lần đầu hay quản lý quá trình điều trị lâu dài, Prescripto luôn đồng hành cùng bạn.</p>
            <b className='text-gray-800'>Tầm Nhìn Của Chúng Tôi</b>
            <p>Tầm nhìn của Prescripto là tạo ra trải nghiệm chăm sóc sức khỏe liền mạch cho mọi người dùng. Chúng tôi hướng tới việc thu hẹp khoảng cách giữa bệnh nhân và các nhà cung cấp dịch vụ y tế, giúp bạn tiếp cận dịch vụ chăm sóc cần thiết, đúng lúc bạn cần.</p>
          </div>
        </div>

        <div className='text-xl my-4'>
          <p>TẠI SAO CHỌN CHÚNG TÔI</p>
        </div>

        <div className='flex flex-col md:flex-row mb-20'>
          <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
              <b>HIỆU QUẢ:</b>
              <p>Quy trình đặt lịch được tối ưu hóa, phù hợp với lối sống bận rộn của bạn.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
              <b>TIỆN LỢI:</b>
              <p>Tiếp cận mạng lưới các chuyên gia y tế uy tín ngay trong khu vực của bạn.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
              <b>CÁ NHÂN HÓA:</b>
              <p>Đề xuất phù hợp và nhắc nhở lịch hẹn giúp bạn luôn chủ động về sức khỏe.</p>
          </div>
        </div>
    </div>
  )
}

export default About