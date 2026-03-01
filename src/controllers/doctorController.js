const doctorService = require("../services/doctorService");

const createDoctor = async (req, res) => {
    const doctor = await doctorService.createDoctor(req.body, req.user);

    return res.status(201).json({
        message: "Doctor created successfully"
    });
};

const getDoctors = async (req, res) => {
    const doctors = await doctorService.getDoctors(req.user);

    return res.status(200).json({ doctors });
};

const deleteDoctor=async (req,res)=>{
    const deleted = await doctorService.deleteDoctor(
        req.params.id,
        req.user
    );

    if(!deleted){
        return res.status(404).json({
            message:"Doctor not found"
        });
    };

    return res.status(200).json({
        message:"Doctor deleted successfully"
    });
};

module.exports = {
    createDoctor,
    getDoctors,
    deleteDoctor
};