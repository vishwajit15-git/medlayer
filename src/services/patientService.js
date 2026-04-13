const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const baseTenantService = require("./baseTenantService");
const ExpressError=require("../utils/ExpressError");

const createPatient = async (data, user) => {
    return await baseTenantService.create(Patient, data, user);
};

const getPatients = async (user) => {
    let extraFilters = {};
    if (user.role === 'doctor') {
        let currentDocId = user.doctorId;
        if (!currentDocId) {
            const dbUser = await require("../models/User").findById(user.id);
            currentDocId = dbUser?.doctorId;
        }
        
        if (!currentDocId) return []; // Should never happen unless DB corrupt
        
        const appointments = await Appointment.find({ doctorId: currentDocId, clinicId: user.clinicId }).select('patientId');
        const patientIds = appointments.map(a => a.patientId);
        extraFilters._id = { $in: patientIds };
    }
    return await baseTenantService.findAll(Patient, user, extraFilters);
};

const deletePatient=async(id,user)=>{
    return await baseTenantService.softDelete(Patient,id,user);
}

const searchPatient=async(query,user)=>{
    //check if not user find or we search for user with no input
    if(!query || query.trim().length<1){
        return [];
    }

    //create a filter
    const filter={
        clinicId:user.clinicId,
        isDeleted:false,
        name:{$regex:query,$options:"i"}
    };

    if (user.role === 'doctor') {
        let currentDocId = user.doctorId;
        if (!currentDocId) {
            const dbUser = await require("../models/User").findById(user.id);
            currentDocId = dbUser?.doctorId;
        }

        if (!currentDocId) return []; 

        const appointments = await Appointment.find({ doctorId: currentDocId, clinicId: user.clinicId }).select('patientId');
        const patientIds = appointments.map(a => a.patientId);
        filter._id = { $in: patientIds };
    }

    //find patient
    const patients=await Patient.find(filter)
        .select("name age")
        .sort({name:1})
        .limit(10)
    
    return patients;
};


module.exports = {
    createPatient,
    getPatients,
    deletePatient,
    searchPatient
};