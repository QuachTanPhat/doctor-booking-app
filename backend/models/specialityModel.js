import mongoose from "mongoose";

const specialitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    description: { type: String, default: "" } 
}, { 
    timestamps: true 
});

const specialityModel = mongoose.models.speciality || mongoose.model("speciality", specialitySchema);

export default specialityModel;