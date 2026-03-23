const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "doctor", "receptionist").required(),
  doctorId: Joi.string().hex().length(24).optional()
}).unknown(false);

module.exports = userSchema;