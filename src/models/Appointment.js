const { required } = require("joi");
const mongoose =require("mongoose");
const { type } = require("../validators/doctorValidator");

const appointmentSchema=new mongoose.Schema({
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor",
        required:true
    },
    patientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Patient",
        required:true
    },
    clinicId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Clinic",
        required:true,
        index:true
    },
    appointmentDate: {
        type:Date,
        required:true
    },
    appointmentTime:{
        type:String,
        required:true,
        trim:true
    },
    status:{
        type:String,
        enum:["BOOKED","CANCELLED","COMPLETED","NO_SHOW","CHECKED_IN","AVAILABLE"],
        default:"BOOKED"
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    notes:{
        type:String,
        default:null,
        trim:true
    }

},{timestamps:true});

appointmentSchema.index(
  {
    doctorId: 1,
    appointmentDate: 1,
    appointmentTime: 1,
    clinicId: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["BOOKED", "CHECKED_IN", "COMPLETED"] }
    }
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);