const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const DoctorBreak = require("../models/DoctorBreak");
const ExpressError = require("../utils/ExpressError");


//Helper: Convert "HH:MM" → minutes for comparisons
const toMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};


//Helper: Convert minutes → "HH:MM"
const toTimeString = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};


/*
Helper: Generate slots between two times
Example: 13:00–14:30 → ["13:00","13:30","14:00"]*/
const generateSlots = (start, end) => {

  const slots = [];
  let current = toMinutes(start);
  const endMinutes = toMinutes(end);

  const SLOT_SIZE = 30;

  while (current < endMinutes) {
    slots.push(toTimeString(current));
    current += SLOT_SIZE;
  }

  return slots;
};


//CREATE APPOINTMENT
const createAppointment = async (data, user) => {

  const { doctorId, patientId, appointmentDate, appointmentTime } = data;

  if (!doctorId) {
    throw new ExpressError("Doctor is required", 400);
  }

  if (!patientId) {
    throw new ExpressError("Patient is required", 400);
  }

  // Verify doctor belongs to clinic
  const doctor = await Doctor.findOne({
    _id: doctorId,
    clinicId: user.clinicId,
    isDeleted: false
  });

  if (!doctor) {
    throw new ExpressError("Doctor not found in this clinic", 404);
  }

  // Ensure doctor availability configured 
  if (!doctor.availability || doctor.availability.length === 0) {
    throw new ExpressError("Doctor availability not configured", 400);
  }

  //Validate appointment slot is inside a shift
  const slotMinutes = toMinutes(appointmentTime);
  let insideShift = false;

  for (const shift of doctor.availability) {

    const startMinutes = toMinutes(shift.startTime);
    const endMinutes = toMinutes(shift.endTime);

    if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
      insideShift = true;
      break;
    }
  }

  if (!insideShift) {
    throw new ExpressError("Slot outside doctor availability", 400);
  }

  // Verify patient 
  const patient = await Patient.findOne({
    _id: patientId,
    clinicId: user.clinicId,
    isDeleted: false
  });

  if (!patient) {
    throw new ExpressError("Patient not found in this clinic", 404);
  }

  // Normalize date 
  const normalizedDate = new Date(appointmentDate);
  normalizedDate.setHours(0, 0, 0, 0);

  //Create appointment (race safe via DB index)
  try {

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      clinicId: user.clinicId,
      appointmentDate: normalizedDate,
      appointmentTime
    });

    return appointment;

  } catch (err) {

    if (err.code === 11000) {
      throw new ExpressError("Slot already booked", 409);
    }

    throw err;
  }
};


//GET AVAILABLE SLOTS

const getAvailableSlots = async (doctorId, date, user) => {

  // Verify doctor 
  const doctor = await Doctor.findOne({
    _id: doctorId,
    clinicId: user.clinicId,
    isDeleted: false
  });

  if (!doctor) {
    throw new ExpressError("Doctor not found in this clinic", 404);
  }

  if (!doctor.availability || doctor.availability.length === 0) {
    throw new ExpressError("Doctor availability not configured", 400);
  }

  // Normalize date 
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);


  //Fetch doctor breaks 
  const breaks = await DoctorBreak.find({
    doctorId,
    clinicId: user.clinicId,
    date: normalizedDate,
    isDeleted: false
  });

  //Convert breaks to blocked slots
  let breakSlots = [];

  for (const br of breaks) {
    const slots = generateSlots(br.startTime, br.endTime);
    breakSlots.push(...slots);
  }

  const breakSet = new Set(breakSlots);


  //Generate slots from ALL shifts
  const SLOT_SIZE = 30;
  let allSlots = [];

  for (const shift of doctor.availability) {

    let current = toMinutes(shift.startTime);
    const endMinutes = toMinutes(shift.endTime);

    while (current < endMinutes) {
      allSlots.push(toTimeString(current));
      current += SLOT_SIZE;
    }
  }


  //Fetch booked appointments 
  const bookedAppointments = await Appointment.find({
    doctorId,
    clinicId: user.clinicId,
    appointmentDate: normalizedDate,
    isDeleted: false,
    status: "BOOKED"
  }).select("appointmentTime -_id");

  const bookedSet = new Set(
    bookedAppointments.map(a => a.appointmentTime)
  );


  //Remove booked slots 
  let availableSlots = allSlots.filter(
    slot => !bookedSet.has(slot)
  );


  //Remove break slots 
  availableSlots = availableSlots.filter(
    slot => !breakSet.has(slot)
  );


  return {
    doctorId,
    date,
    availableSlots
  };
};


// CANCEL APPOINTMENT
const cancelAppointment = async (appointmentId, user) => {

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    clinicId: user.clinicId,
    isDeleted: false
  });

  if (!appointment) {
    throw new ExpressError("Appointment not found", 404);
  }

  if (appointment.status === "CANCELLED") {
    throw new ExpressError("Appointment already cancelled", 400);
  }

  appointment.status = "CANCELLED";
  await appointment.save();

  return appointment;
};


//GET APPOINTMENTS (Pagination + Filters)
const getAppointments = async (query, user) => {

  let { page = 1, limit = 10, doctorId, status, date } = query;

  page = parseInt(page);
  limit = parseInt(limit);

  const filter = {
    clinicId: user.clinicId,
    isDeleted: false
  };


  //Default: today's booked appointments 
  if (!date && !doctorId && !status) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filter.appointmentDate = today;
    filter.status = "BOOKED";
  }


  //Filter by date
  if (date) {

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    filter.appointmentDate = normalizedDate;
  }


  // Filter by doctor
  if (doctorId) {
    filter.doctorId = doctorId;
  }


  //Filter by status
  if (status) {
    filter.status = status;
  }


  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate("doctorId", "name specialization")
    .populate("patientId", "name age")
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .skip((page - 1) * limit)
    .limit(limit);


  return {
    page,
    limit,
    total,
    appointments
  };
};


// RESCHEDULE APPOINTMENT

const rescheduleAppointment = async (appointmentId, data, user) => {

  const { appointmentDate, appointmentTime } = data;

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    clinicId: user.clinicId,
    isDeleted: false
  });

  if (!appointment) {
    throw new ExpressError("Appointment not found", 404);
  }

  if (appointment.status !== "BOOKED") {
    throw new ExpressError("Only booked appointments can be rescheduled", 400);
  }

  const normalizedDate = new Date(appointmentDate);
  normalizedDate.setHours(0, 0, 0, 0);

  try {

    appointment.appointmentDate = normalizedDate;
    appointment.appointmentTime = appointmentTime;

    await appointment.save();

    return appointment;

  } catch (err) {

    if (err.code === 11000) {
      throw new ExpressError("Slot already booked", 409);
    }

    throw err;
  }
};


module.exports = {
  createAppointment,
  getAvailableSlots,
  cancelAppointment,
  getAppointments,
  rescheduleAppointment
};