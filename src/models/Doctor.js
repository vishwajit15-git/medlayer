const { required } = require("joi");
const mongoose = require("mongoose");

const doctorSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    specialization:{
        type:String,
        required:true
    },
    clinicId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Clinic",
        required:true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    availability:[{
        startTime:{
            type:String,
            required:true
        },
        endTime:{
            type:String,
            required:true
        }
    }]
},{timestamps:true});

module.exports = mongoose.model("Doctor", doctorSchema);