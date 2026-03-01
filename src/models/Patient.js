const mongoose = require("mongoose");

const patientSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number
    },
    clinicId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Clinic",
        required:true
    }
},{timestamps:true});

module.exports=mongoose.model("Patient",patientSchema);