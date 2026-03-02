const { required } = require("joi");
const mongoose = require("mongoose");

const patientSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number
    },
    clinicId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Clinic",
        required:true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},{timestamps:true});

module.exports=mongoose.model("Patient",patientSchema);