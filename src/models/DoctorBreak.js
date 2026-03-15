const mongoose=require("mongoose");

const doctorBreakSchema=new mongoose.Schema({
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor",
        required:true
    },
    clinicId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Clinic",
        required:true,
        index:true
    },
    date:{
        type:Date,
        required:true
    },
    startTime:{
        type:String,
        required:true
    },
    endTime:{
        type:String,
        required:true
    },
    type:{
        type:String,
        enum:["BREAK","LEAVE","MEETING"],
        default:"BREAK"
    },
    isDeleted:{
        type:Boolean,
        default:false
    }

},{timestamps:true});

module.exports=mongoose.model("DoctorBreak",doctorBreakSchema);