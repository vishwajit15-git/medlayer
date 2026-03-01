const Joi = require("joi");

const doctorSchema = Joi.object({
    name: Joi.string().min(3).required(),
    specialization: Joi.string().min(3).required()
});

module.exports = doctorSchema;