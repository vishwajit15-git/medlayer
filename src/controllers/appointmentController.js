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

module.exports =  {createAppointment};
