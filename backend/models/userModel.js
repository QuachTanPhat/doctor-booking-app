import mongoose from "mongoose";
import { DEFAULT_AVATAR_BASE64 } from "../utils/constants.js";
const userSchema = new mongoose.Schema(
    {
        name: {type:String, required:true},
        email: {type:String, required:true, unique:true},
        password: {type:String, required:true, minLength:6},
        image: {type:String, default:DEFAULT_AVATAR_BASE64},
        address:{type:Object, default:{line1:'',line2:''}},
        gender:{type:String, default:"Not Selected"},
        dob:{type:String, default:"Not Selected"},
        phone:{type:String, default:"0386972871"},
        isBlocked: { type: Boolean, default: false }
    },{minimize:false,timestamps:true }
)
const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel;