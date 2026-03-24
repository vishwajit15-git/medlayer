const Joi=require("joi");

const clinicSettingsSchema=Joi.object({
  workingHours:Joi.object({
    startTime:Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    endTime:Joi.string().pattern(/^\d{2}:\d{2}$/).required()
  }),
  settings:Joi.object({
    workingDays: Joi.array()
      .items(Joi.string().valid("SUN","MON","TUE","WED","THU","FRI","SAT"))
      .min(1)
  })
}).min(1);
module.exports =clinicSettingsSchema;