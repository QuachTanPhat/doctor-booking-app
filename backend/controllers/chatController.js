import { GoogleGenerativeAI } from "@google/generative-ai";
import userModel from "../models/userModel.js"; 
import chatModel from "../models/chatModel.js";
import 'dotenv/config.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatController = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ New Client Connected:", socket.id);

    socket.on("join-chat", async (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room.`);
      try {
        // Lấy lịch sử cũ để hiển thị lên giao diện (không đổi)
        const history = await chatModel.find({ userId }).sort({ timestamp: 1 });
        socket.emit("chat-history", history); 
      } catch (error) {
        console.log("Lỗi tải lịch sử:", error);
      }
    });

    socket.on("send-message", async ({ userId, message, sender }) => {
      try {
        // 1. Lưu tin nhắn User vào DB
        await chatModel.create({ userId, sender, text: message });
        
        // Gửi lại cho chính user để hiện lên màn hình ngay lập tức
        io.to(userId).emit("receive-message", { sender, text: message });

        if (sender === "user") {
          // --- BẮT ĐẦU XỬ LÝ AI ---

          // 2. Báo hiệu AI đang soạn tin (Hiệu ứng UX)
          io.to(userId).emit("ai-typing", true); 

          const user = await userModel.findById(userId);
          const userName = user ? user.name : "Bạn"; 

          // 3. Lấy 20 tin nhắn gần nhất làm "Trí nhớ" cho AI
          const previousMessages = await chatModel.find({ userId })
            .sort({ timestamp: -1 }) // Lấy mới nhất trước
            .limit(20);              // Giới hạn 20 câu để tiết kiệm token và tiền

          // Format lại lịch sử theo chuẩn của Gemini
          // Gemini quy định: User là 'user', AI là 'model'
          const historyForGemini = previousMessages.reverse().map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }));

          // 4. Cấu hình Prompt
          const systemPrompt = `
            Bạn là Prescripto, trợ lý y tế ảo... (Giữ nguyên prompt của bạn)...
            Thông tin người dùng: Tên là ${userName}.
          `;

          const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", // Nên dùng bản 1.5 flash cho nhanh và rẻ
            systemInstruction: systemPrompt 
          });

          // 5. Khởi tạo chat với LỊCH SỬ đã lấy từ DB
          const chat = model.startChat({ 
            history: historyForGemini // <--- QUAN TRỌNG NHẤT: Nạp lịch sử vào đây
          });

          // 6. Gửi tin nhắn mới
          const result = await chat.sendMessage(message);
          const response = await result.response;
          const text = response.text();

          // 7. Lưu câu trả lời của AI vào DB
          await chatModel.create({ userId, sender: 'ai', text: text });
          
          // 8. Tắt hiệu ứng đang gõ và gửi tin nhắn
          io.to(userId).emit("ai-typing", false);
          io.to(userId).emit("receive-message", { sender: 'ai', text: text });
        }

      } catch (error) {
        console.log("Lỗi xử lý chat:", error);
        io.to(userId).emit("ai-typing", false); // Tắt typing nếu lỗi
        io.to(userId).emit("receive-message", {
           sender: 'ai',
           text: "Xin lỗi, Prescripto đang gặp chút trục trặc. Bạn chờ xíu rồi thử lại nhé!"
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client Disconnected");
    });
  });
};

export default chatController;