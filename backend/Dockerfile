# 1. Chọn môi trường Node.js nhẹ (Alpine Linux)
FROM node:18-alpine

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package để cài thư viện trước (Tối ưu cache)
COPY package*.json ./

# 4. Cài đặt các thư viện (node_modules)
RUN npm install

# 5. Copy toàn bộ code nguồn vào container
COPY . .

# 6. Mở port 4000 (Port backend của bạn)
EXPOSE 4000

# 7. Lệnh chạy server khi container khởi động
CMD ["npm", "start"]