# 🏥 Doctor Appointment Booking System

Hệ thống đặt lịch khám bệnh trực tuyến kết nối Bệnh nhân và Bác sĩ. Hỗ trợ quản lý lịch trình, thanh toán và thông báo thời gian thực.

## 🚀 Tính năng chính (Key Features)

* **Đa phân quyền (Multi-role):** Hệ thống phân quyền cho Admin, Bác sĩ và Bệnh nhân.
* **Đặt lịch & Thanh toán:** Quy trình đặt lịch khám và tích hợp cổng thanh toán.
* **Real-time Notifications:** Thông báo trạng thái lịch hẹn tức thì sử dụng **Socket.io**.
* **Tự động hoá:** Gửi nhắc nhở lịch khám hoặc xử lý tác vụ định kỳ với **Node-cron**.

## 🛠 Công nghệ sử dụng (Tech Stack)

* **Frontend:** ReactJS, TailwindCSS
* **Backend:** NodeJS, ExpressJS
* **Database:** MongoDB
* **Real-time & Utils:** Socket.io, Node-cron

## 📸 Demo
<img width="1916" height="908" alt="image" src="https://github.com/user-attachments/assets/124fde5f-49b8-4f80-bff2-0f0258fec553" />
<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/0513f8e0-a4e8-481a-96f7-ad49f94721c5" />
<img width="1919" height="915" alt="image" src="https://github.com/user-attachments/assets/b273e2f3-2c77-4f39-97d7-5654ffbb6f04" />

## 🐳 Cài đặt & Chạy với Docker (Docker Setup)
Dự án đã được đóng gói container, bạn có thể chạy toàn bộ hệ thống (Frontend, Backend, Database) chỉ với vài thao tác.
1. Clone repo:
   ```bash
   https://github.com/QuachTanPhat/doctor-booking-app
2. Chạy dự án: docker-compose up --build
