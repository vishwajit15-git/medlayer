const Joi = require("joi");

const patientSchema = Joi.object({
  name: Joi.string().min(3).required(),
  age: Joi.number()
}).unknown(false);

module.exports = patientSchema;