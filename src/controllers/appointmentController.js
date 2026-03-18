const appointmentService = require("../services/appointmentService");
const { message } = require("../validators/doctorValidator");

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

const cancelAppointment=async(req,res)=>{
  const {id}=req.params;

  const appointment=await appointmentService.cancelAppointment(
    id,
    req.user
  );

  return res.status(200).json({
    message:"Appointment cancelled successfully",
    appointment
  });
};

const getAppointments= async(req,res)=>{
  const result=await appointmentService.getAppointments(
    req.query,
    req.user
  );

  return res.status(200).json(result);
}

const rescheduleAppointment =async (req,res)=>{
  const appointment=await appointmentService.rescheduleAppointment(
    req.params.id,
    req.body,
    req.user
  );


  return res.status(200).json({
    message:"Appointment rescheduled succesfully",
    appointment
  });
}


const completeAppointment=async(req,res)=>{
  const appointment=await appointmentService.completeAppointment(
    req.params.id,
    req.user
  );

  return res.status(200).json({
    message:"Appointment completed",
    appointment
  });
}

module.exports =  {createAppointment,getAvailableSlots,cancelAppointment,getAppointments,rescheduleAppointment,completeAppointment};
