import { assets } from '../assets/assets';

export const adminMenu = [
  {
    path: '/admin-dashboard',
    label: 'Dashboard',
    icon: assets.home_icon 
  },
  {
    path: '/all-users',
    label: 'Người dùng',
    icon: assets.people_icon
  },
  {
    path: '/doctors-list',
    label: 'Danh sách bác sĩ',
    icon: assets.people_icon
  },
  {
    path: '/all-appointments',
    label: 'Quản lí lịch hẹn',
    icon: assets.appointment_icon
  },
  
  {
    path: '/doctor-schedule',
    label: 'Thêm lịch trình bác sĩ',
    icon: assets.appointment_icon 
  },
  {
    path: '/speciality-list',
    label: 'Chuyên khoa',
    icon: assets.add_icon 
  },
  {
    path: '/faq-list',
    label: 'Hỏi đáp (FAQ)',
    icon: assets.list_icon 
  }
];

export const doctorMenu = [
  {
    path: '/doctor-dashboard',
    label: 'Dashboard',
    icon: assets.home_icon
  },
  {
    path: '/doctor-appointments',
    label: 'Cuộc hẹn',
    icon: assets.appointment_icon
  },
  {
    path: '/doctor-my-schedule',
    label: 'Lịch trình của tôi',
    icon: assets.appointment_icon 
  },
  {
    path: '/doctor-profile',
    label: 'Hồ sơ cá nhân',
    icon: assets.people_icon
  }
];