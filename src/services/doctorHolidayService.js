const Doctor=require("../models/Doctor");
const DoctorHoliday=require("../models/DoctorHoliday");
const ExpressError=require("../utils/ExpressError");

const createHoliday=async(data,user)=>{
    const {doctorId,date}=data;

    //check if doctor belongs to that clinic only

    const doctor=await Doctor.findOne({
        _id:doctorId,
        clinicId:user.clinicId,
        isDeleted:false
    });

    if(!doctor){
        throw new ExpressError("Doctor not found in this clinic",404);
    }

    const normalizedDate=new Date(date);
    normalizedDate.setHours(0,0,0,0);

    try{

        const holiday=await DoctorHoliday.create({
            doctorId,
            clinicId:user.clinicId,
            date:normalizedDate
        });

        return holiday;

    }catch(err){
        if(err.code===11000){
            throw new ExpressError("Holiday already exists",409);
        }

        throw err;
    }
};

const getHoliday = async (query, user) => {
    const { doctorId } = query;

    const filter = {
        clinicId: user.clinicId,
        isDeleted: false
    };

    if (doctorId) {
        filter.doctorId = doctorId;
    }

    return await DoctorHoliday.find(filter).sort({ date: 1 });
};

const deleteHoliday=async(id,user)=>{
    const holiday=await DoctorHoliday.findOne({
        _id:id,
        clinicId:user.clinicId,
        isDeleted:false
    });

    if(!holiday){
        throw new ExpressError("Holiday not found",404);
    }

    holiday.isDeleted=true;
    await holiday.save();

    return holiday;
};

module.exports={
    createHoliday,
    getHoliday,
    deleteHoliday
};