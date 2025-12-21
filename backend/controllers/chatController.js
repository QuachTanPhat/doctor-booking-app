
import { GoogleGenerativeAI } from "@google/generative-ai";
import userModel from "../models/userModel.js"; 
import chatModel from "../models/chatModel.js";
import 'dotenv/config.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatController = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ New Client Connected:", socket.id);

    // --- SỬA LỖI 1: THÊM ASYNC Ở ĐÂY ---
    socket.on("join-chat", async (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room.`);

      try {
          
          const history = await chatModel.find({ userId }).sort({ timestamp: 1 });
          socket.emit("chat-history", history); 
      } catch (error) {
          console.log("Lỗi tải lịch sử:", error);
      }
    });

    socket.on("send-message", async ({ userId, message, sender }) => {
      try {
        await chatModel.create({ userId, sender, text: message });
      } catch (e) {
        console.log("Lỗi lưu DB:", e);
      }
      io.to(userId).emit("receive-message", {
        sender,
        text: message,
      });
      if (sender === "user") {
        try {
         
          const user = await userModel.findById(userId);
          const userName = user ? user.name : "Bạn"; 
          const systemPrompt = `
        Bạn là Prescripto, trợ lý y tế ảo của phòng khám đa khoa Prescripto.
        
        PHONG CÁCH TRẢ LỜI:
        - Thân thiện, ân cần như một y tá tận tâm.
        - Luôn xưng "mình" và gọi người dùng là "bạn" (hoặc tên riêng ${userName}).
        - Trả lời ngắn gọn (dưới 100 từ), đi thẳng vào vấn đề.
        - Dùng tiếng Việt tự nhiên, có cảm xúc.

        NGUYÊN TẮC BẤT DI BẤT DỊCH:
        1. KHÔNG kê đơn thuốc.
        2. Nếu bệnh nặng -> Khuyên đi khám ngay.
        3. Nếu bệnh nhẹ -> Đồng cảm -> Mẹo vặt tại nhà -> Gợi ý đặt lịch.

        DƯỚI ĐÂY LÀ CÁC VÍ DỤ MẪU (HỌC THEO):
        (Giữ nguyên các ví dụ của bạn ở đây...)
        
        Thông tin người dùng: Tên là ${userName}.
          `;

          
          const model = genAI.getGenerativeModel({ 
              model: "gemini-flash-latest", 
              systemInstruction: systemPrompt 
          });

          const chat = model.startChat({ history: [] });

          const result = await chat.sendMessage(message);
          const response = await result.response;
          const text = response.text();

          await chatModel.create({ userId, sender: 'ai', text: text });
         
          io.to(userId).emit("receive-message", {
             sender: 'ai',
             text: text
          });

        } catch (error) {
          console.log(error);
          io.to(userId).emit("receive-message", {
             sender: 'ai',
             text: "Xin lỗi, hệ thống đang bận chút xíu. Bạn thử lại sau nhé!"
          });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Client Disconnected");
    });
  });
};

export default chatController;