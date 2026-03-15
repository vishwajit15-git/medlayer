const doctorBreakService=require("../services/doctorBreakService");

const createBreak=async(req,res)=>{
    const doctorBreak=await doctorBreakService.createDoctorBreak(
        req.body,
        req.user
    )

    return res.status(201).json({
        message:"Doctor Break Created Successfully",
        doctorBreak
    });
};

module.exports={
    createBreak
}