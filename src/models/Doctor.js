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
    }
},{timestamps:true});

module.exports = mongoose.model("Doctor", doctorSchema);