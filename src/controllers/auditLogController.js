const auditService=require("../services/auditLogService");

const getLogs= async(req,res)=>{
    const logs=await auditService.getAuditLogs(req.query,req.user);

    res.status(200).json({logs});
}

module.exports={
    getLogs
}