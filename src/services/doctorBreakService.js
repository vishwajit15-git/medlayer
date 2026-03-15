const Doctor=require("../models/Doctor");
const DoctorBreak=require("../models/DoctorBreak");
const ExpressError=require("../utils/ExpressError");

const createDoctorBreak=async(data,user)=>{
    const {doctorId,date,startTime,endTime}=data;

    const doctor=await Doctor.findOne({
        _id:doctorId,
        clinicId:user.clinicId,
        isDeleted:false
    });

    if(!doctor){
        throw new ExpressError("Doctor not found in this Clinic",404);
    }

    const normalizedDate=new Date(date);
    normalizedDate.setHours(0,0,0,0);

    const doctorBreak=await DoctorBreak.create({
        doctorId,
        clinicId:user.clinicId,
        date:normalizedDate,
        startTime,
        endTime
    });

    return doctorBreak;
};

module.exports={
    createDoctorBreak
};