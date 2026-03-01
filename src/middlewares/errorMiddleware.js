module.exports.errorMiddleware=(err,req,res,next)=>{
    console.log(err.message);
    if (err.code === 11000) {
        return res.status(409).json({
            message: "Email already exists"
        });
    }
    
    const status=err.statusCode || 500;
    const message=err.message || "Internal Server Error";

    return res.status(status).json({
        message
    });
};