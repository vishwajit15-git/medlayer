const appointmentService = require("../services/appointmentService");

const createAppointment = async (req, res) => {
  const appointment = await appointmentService.createAppointment(
    req.body,
    req.user
  );

  return res.status(201).json({
    message: "Appointment booked successfully",
    appointment
  });
};

const getAvailableSlots = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  const result = await appointmentService.getAvailableSlots(
    id,
    date,
    req.user
  );

  return res.status(200).json(result);
};

module.exports =  {createAppointment,getAvailableSlots};
