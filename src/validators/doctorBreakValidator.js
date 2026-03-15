const Joi= require("joi");

const doctorBreakSchema=Joi.object({
    doctorId:Joi.string().hex().length(24).required(),
    date:Joi.date().required(),
    startTime: Joi.string()
        .pattern(/^(?:[01]\d|2[0-3]):(00|30)$/)
        .required(),

    endTime: Joi.string()
        .pattern(/^(?:[01]\d|2[0-3]):(00|30)$/)
        .required()
});

module.exports=doctorBreakSchema;