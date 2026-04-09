const mongoose=require("mongoose");

const auditLogSchema=new mongoose.Schema({
    clinicId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Clinic",
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    role:{
        type:String,
        required:true
    },
    action:{
        type:String,
        required:true
    },
    entity:{
        type:String,   //"Appiontment" ,"Doctor" ,etc
        required:true
    },
    entityId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    description:{
        type:String,
        required:false
    },
    meta:{
        type:Object,   //Optiona extra info
        default:{}
    }
},{timestamps:true});

module.exports=mongoose.model("AuditLog",auditLogSchema);