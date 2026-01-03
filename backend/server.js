import express from 'express';
import cors from 'cors';
import 'dotenv/config.js'; // File config biến môi trường
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import chatController from './controllers/chatController.js';
import startCleanupJob from './jobs/cleanupSlots.js';
// 1. CHỈ CẦN IMPORT 1 LẦN DUY NHẤT
import { createServer } from 'http';
import { Server } from 'socket.io';

// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middleware
app.use(express.json());
app.use(cors());

// 2. TẠO SERVER HTTP VÀ SOCKET
const httpServer = createServer(app); // Tạo server từ app express

const io = new Server(httpServer, {
    cors: {
        origin: '*', // Cho phép mọi nguồn kết nối
    }
});

// 3. QUAN TRỌNG: GẮN IO VÀO APP ĐỂ DÙNG Ở CONTROLLER (req.app.get('io'))
app.use((req, res, next) => {
    req.io = io;
    next();
});
io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);
});

// Kích hoạt Chat Controller (nếu có logic chat riêng)
if (typeof chatController === 'function') {
    chatController(io);
}
startCleanupJob();
// api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
    res.send('API WORKING Great');
});

httpServer.listen(port, () => console.log("Server Started on PORT", port));