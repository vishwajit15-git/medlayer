const Joi = require("joi");

const clinicSettingsSchema = Joi.object({
  workingDays: Joi.array()
    .items(Joi.string().valid("MON","TUE","WED","THU","FRI","SAT","SUN"))
    .min(1)
    .required()
}).unknown(false);

module.exports = clinicSettingsSchema;