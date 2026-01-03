# 1. Chọn môi trường Node
FROM node:18-alpine

# 2. Thư mục làm việc
WORKDIR /app

# 3. Cài đặt thư viện
COPY package*.json ./
RUN npm install

# 4. Copy code nguồn
COPY . .

# 5. Build dự án ra file tĩnh (folder dist)
RUN npm run build

# 6. Cài đặt 'serve' để chạy web tĩnh
RUN npm install -g serve

# 7. Mở port 5173 (Port mặc định của Vite)
EXPOSE 5173

# 8. Chạy ứng dụng
CMD ["serve", "-s", "dist", "-l", "5173"]