const { required } = require("joi");
const mongoose=require("mongoose");

const doctorHolidaySchema=new mongoose.Schema({
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
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

doctorHolidaySchema.index(
  { doctorId: 1, date: 1, clinicId: 1 },
  { unique: true }
);

module.exports=mongoose.model("DoctorHoliday",doctorHolidaySchema);