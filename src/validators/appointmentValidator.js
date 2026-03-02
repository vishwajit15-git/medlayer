const Joi = require("joi");

const appointmentSchema = Joi.object({
  doctorId: Joi.string().hex().length(24).required(),
  patientId: Joi.string().hex().length(24).required(),
  appointmentDate: Joi.date().required(),
  appointmentTime: Joi.string().trim().pattern(/^(?:[01]\d|2[0-3]):(00|30)$/).required()
}).unknown(false);

module.exports=appointmentSchema;