import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    gateway: { type: String, default: 'SePay' },
    transactionDate: { type: Date, default: Date.now },
    accountNumber: { type: String },
    subAccount: { type: String },
    amountIn: { type: Number, default: 0 },
    amountOut: { type: Number, default: 0 },
    accumulated: { type: Number, default: 0 },
    code: { type: String }, // Mã giao dịch ngân hàng
    transactionContent: { type: String }, // Nội dung chuyển khoản
    referenceCode: { type: String }, // Mã đơn hàng (Appointment ID) tìm được
    bodyError: { type: String }, // Lưu lỗi nếu có
}, { timestamps: true });

const transactionModel = mongoose.models.transaction || mongoose.model("transaction", transactionSchema);
export default transactionModel;