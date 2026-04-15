const mongoose = require("mongoose");

const basicHealth=async(req,res)=>{
    return res.status(200).json({
        status:"OK",
        message:"Server is Running",
        timestamp:new Date()
    });
};

const dbHealth=async(req,res)=>{
    const dbState=mongoose.connection.readyState;

    const states={
        0:"Disconnected",
        1:"Connected",
        2:"Connecting",
        3:"Disconnecting"
    };

    return res.status(200).json({
        status:dbState ===1 ? "OK" :"FAIL",
        database:states[dbState],
        timestamp:new Date()
    });
};

module.exports={
    basicHealth,
    dbHealth
}