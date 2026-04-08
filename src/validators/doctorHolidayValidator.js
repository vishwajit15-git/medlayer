const Joi=require("joi");

const doctorHolidaySchema=Joi.object({
    doctorId:Joi.string().hex().length(24).required(),
    date:Joi.date().required(),
    endDate:Joi.date().optional()
}).unknown(false);

module.exports=doctorHolidaySchema;