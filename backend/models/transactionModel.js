import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    gateway: { type: String, default: 'SePay' },
    transactionDate: { type: Date, default: Date.now },
    accountNumber: { type: String },
    subAccount: { type: String },
    amountIn: { type: Number, default: 0 },
    amountOut: { type: Number, default: 0 },
    accumulated: { type: Number, default: 0 },
    code: { type: String }, 
    transactionContent: { type: String }, 
    referenceCode: { type: String }, 
    bodyError: { type: String }, 
}, { timestamps: true });

const transactionModel = mongoose.models.transaction || mongoose.model("transaction", transactionSchema);
export default transactionModel;