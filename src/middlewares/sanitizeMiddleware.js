const xss =require("xss");

const sanitize=(req,res,next)=>{
    const clean=(obj)=>{
        if(!obj) return obj;

        for(let key in obj){
            if( typeof obj[key]=== "string"){
                obj[key]=xss(obj[key]);
            }else if(typeof obj[key]=== "object"){
                clean(obj[key]);
            }
        }
    };

    clean(req.body);
    clean(req.query);

    next();
};

module.exports= sanitize;