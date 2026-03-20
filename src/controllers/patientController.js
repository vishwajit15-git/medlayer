const patientService = require("../services/patientService");
const { message } = require("../validators/patientValidator");

const createPatient = async (req, res) => {
    const patient = await patientService.createPatient(req.body, req.user);

    return res.status(201).json({
        message: "Patient created successfully",
        patient
    });
};

const getPatients = async (req, res) => {
    const patients = await patientService.getPatients(req.user);

    return res.status(200).json({ patients });
};

const deletePatient=async (req,res)=>{
    const deleted = await patientService.deletePatient(
        req.params.id,
        req.user
    );

    if(!deleted){
        return res.status(404).json({
            message:"Patient not found"
        });
    };

    return res.status(200).json({
        message:"Patient deleted successfully"
    });
};

const searchPatient=async(req,res)=>{
    const {query}=req.query;

    const patients = await patientService.searchPatient(
        query,
        req.user
    );

    return res.status(200).json({
        patients
    });
}

module.exports = {
    createPatient,
    getPatients,
    deletePatient,
    searchPatient
};