import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: { type: String, required: true }, 
    sender: { type: String, required: true }, 
    text: { type: String, required: true },   
    timestamp: { type: Date, default: Date.now } 
});

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);

export default chatModel;