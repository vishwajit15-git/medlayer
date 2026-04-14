const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const baseTenantService = require("./baseTenantService");
const ExpressError=require("../utils/ExpressError");

const createPatient = async (data, user) => {
    return await baseTenantService.create(Patient, data, user);
};

const getPatients = async (user, query = {}) => {
    let { page = 1, limit = 10 } = query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {
        clinicId: user.clinicId,
        isDeleted: false
    };

    if (user.role === 'doctor') {
        let currentDocId = user.doctorId;
        if (!currentDocId) {
            const dbUser = await require("../models/User").findById(user.id);
            currentDocId = dbUser?.doctorId;
        }
        if (!currentDocId) return { patients: [], total: 0, page, limit, totalPages: 0 };

        const appointments = await Appointment.find({ doctorId: currentDocId, clinicId: user.clinicId }).select('patientId');
        const patientIds = appointments.map(a => a.patientId);
        filter._id = { $in: patientIds };
    }

    const total = await Patient.countDocuments(filter);
    const patients = await Patient.find(filter)
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { patients, total, page, limit, totalPages: Math.ceil(total / limit) };
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