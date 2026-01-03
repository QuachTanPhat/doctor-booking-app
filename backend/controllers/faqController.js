// File: controllers/faqController.js
import faqModel from "../models/faqModel.js";

// API thêm FAQ mới
const addFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const newFaq = new faqModel({ question, answer });
        await newFaq.save();
        
        // Gửi thông báo socket (nếu có)
        if (req.io) req.io.emit('faq-updated'); 
        
        res.json({ success: true, message: "Đã thêm câu hỏi mới" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API cập nhật FAQ
const updateFaq = async (req, res) => {
    try {
        const { id, question, answer } = req.body;
        await faqModel.findByIdAndUpdate(id, { question, answer });

        if (req.io) req.io.emit('faq-updated');

        res.json({ success: true, message: "Đã cập nhật câu hỏi thành công" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API lấy danh sách FAQ
const listFaq = async (req, res) => {
    try {
        const faqs = await faqModel.find({});
        // Lưu ý: listFaq thường không cần emit socket trừ khi bạn muốn refresh gì đó đặc biệt
        res.json({ success: true, faqs });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API xóa FAQ
const deleteFaq = async (req, res) => {
    try {
        const { id } = req.body;
        await faqModel.findByIdAndDelete(id);
        
        if (req.io) req.io.emit('faq-updated'); 
        
        res.json({ success: true, message: "Đã xóa câu hỏi" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Export các hàm ra để Route sử dụng
export { addFaq, updateFaq, listFaq, deleteFaq };