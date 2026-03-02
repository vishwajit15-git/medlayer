const Patient = require("../models/Patient");
const baseTenantService = require("./baseTenantService");

const createPatient = async (data, user) => {
    return await baseTenantService.create(Patient, data, user);
};

const getPatients = async (user) => {
    return await baseTenantService.findAll(Patient, user);
};

const deletePatient=async(id,user)=>{
    return await baseTenantService.softDelete(Patient,id,user);
}

module.exports = {
    createPatient,
    getPatients,
    deletePatient
};