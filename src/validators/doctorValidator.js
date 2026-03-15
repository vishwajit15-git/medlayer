const Joi = require("joi");

const doctorSchema = Joi.object({
  name: Joi.string().min(2).required(),
  specialization: Joi.string().min(2).required(),

  availability: Joi.array()
  .items(
    Joi.object({
      startTime: Joi.string()
        .pattern(/^(?:[01]\d|2[0-3]):(00|30)$/)
        .required(),

      endTime: Joi.string()
        .pattern(/^(?:[01]\d|2[0-3]):(00|30)$/)
        .required()
      })
    ).required()

}).unknown(false);

module.exports = doctorSchema;