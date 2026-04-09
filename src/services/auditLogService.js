const AuditLog=require("../models/AuditLog");

const logAction=async({user,action,entity,entityId,description,meta={}})=>{

    await AuditLog.create({
        clinicId:user.clinicId,
        role:user.role,
        userId:user.id,
        action,
        entity,
        entityId,
        description,
        meta
    });
};

const getAuditLogs=async(query,user)=>{
    const {page=1,limit=20}=query;

    const logs=await AuditLog.find({
        clinicId:user.clinicId
    })
    .populate("userId","name role")
    .sort({ createdAt:-1 })
    .skip((page-1)*limit)
    .limit(parseInt(limit));

    return logs;
}

module.exports={
    logAction,
    getAuditLogs
};