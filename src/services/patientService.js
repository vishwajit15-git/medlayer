const Patient = require("../models/Patient");
const baseTenantService = require("./baseTenantService");
const ExpressError=require("../utils/ExpressError");

const createPatient = async (data, user) => {
    return await baseTenantService.create(Patient, data, user);
};

const getPatients = async (user) => {
    return await baseTenantService.findAll(Patient, user);
};

const deletePatient=async(id,user)=>{
    return await baseTenantService.softDelete(Patient,id,user);
}

const searchPatient=async(query,user)=>{
    //check if not user find or we search for user with no input
    if(!query || query.trim().length<2){
        return [];
    }

    //create a filter
    const filter={
        clinicId:user.clinicId,
        isDeleted:false,
        name:{$regex:query,$options:"i"}
    };

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