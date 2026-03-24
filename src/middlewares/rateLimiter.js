const rateLimit=require("express-rate-limit");
const { message } = require("../validators/doctorValidator");

const apiLimiter=rateLimit({
    windowMs:15*60*1000,  //15 mmin
    max:100,  //max req per id
    message:{message:"Too many requests, please try again later"},
    standardHeaders:true,
    legacyHeaders:false
});

module.exports=apiLimiter;
