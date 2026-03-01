module.exports=function wrapAsync(fn){
    return function (req,res,next){
        fn(req,res,next).catch(next);
    };
};

//here wrapAsync fxn converts the rejected Promise to next(err);