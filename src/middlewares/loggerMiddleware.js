const logger=(req,res,next)=>{
    const start =Date.now();

    res.on("finish",()=>{
        const duration=Date.now() - start;

        console.log({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user ? req.user.id : "anonymous"
        });
    });

    next();
}

module.exports=logger;