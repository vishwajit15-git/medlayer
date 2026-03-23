const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const DoctorBreak = require("../models/DoctorBreak");
const ExpressError = require("../utils/ExpressError");
const DoctorHoliday = require("../models/DoctorHoliday");
const { message } = require("../validators/doctorValidator");
const { date } = require("joi");
const { all } = require("../routes/authRoutes");
const appointmentSchema = require("../validators/appointmentValidator");
const Clinic = require("../models/Clinic");
const {logAction}=require("./auditLogService");

//Helper function:check if it is past appointment
const isPastAppointment=(date,time)=>{
  const [h,m]=time.split(":").map(Number);

  const appointmentDateTime=new Date(date);
  appointmentDateTime.setHours(h,m,0,0);

  return appointmentDateTime< new Date();
};

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

//helper function get days of week
const getDayofWeek=(date)=>{
  const days=["SUN","MON","TUE","WED","THU","FRI","SAT"];
  return days[new Date(date).getDay()];
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

  // Normalize date FIRST
  const normalizedDate = new Date(appointmentDate);
  normalizedDate.setHours(0, 0, 0, 0);

   //fetch clinic for checking if it lies in/outside the clinic working hours
  const clinic=await Clinic.findById(user.clinicId);

  const day=getDayofWeek(normalizedDate);

  if(!clinic.settings.workingDays.includes(day)){
    throw new ExpressError("Clinic closed on this day",400);
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

  if(!clinic || !clinic.workingHours){
    throw new ExpressError("Clinic working hours not configured",400);
  }

  //validate the slot inside the working hours 
  const clinicStart=toMinutes(clinic.workingHours.startTime);
  const clinicEnd=toMinutes(clinic.workingHours.endTime);
  const slotMinutes=toMinutes(appointmentTime);

  if (slotMinutes < clinicStart || slotMinutes >= clinicEnd) {
    throw new ExpressError("Slot outside clinic working hours", 400);
  }

  //holiday check 
  const holiday=await DoctorHoliday.findOne({
    doctorId,
    clinicId:user.clinicId,
    date:normalizedDate,
    isDeleted:false
  });

  if(holiday){
    throw new ExpressError("Doctor is on Holiday",400)
  }

  // Ensure doctor availability configured 
  if (!doctor.availability || doctor.availability.length === 0) {
    throw new ExpressError("Doctor availability not configured", 400);
  }

  //Validate appointment slot is inside a shift
  // const slotMinutes = toMinutes(appointmentTime);
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


  //break check ,wheater the patient booked the slot that is doctors break slot
  const breaks=await DoctorBreak.find({
    doctorId,
    clinicId:user.clinicId,
    date:normalizedDate,
    isDeleted:false
  });

  for(const br of breaks){
    const breakSlots=generateSlots(br.startTime,br.endTime);

    if(breakSlots.includes(appointmentTime)){
      throw new ExpressError("Slot you are booking falls under Doctor Break",400);
    }
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

  //Create appointment (race safe via DB index)
  try {

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      clinicId: user.clinicId,
      appointmentDate: normalizedDate,
      appointmentTime
    });

    //action i.e done
    await logAction({
      user,
      action:"CREATE_APPOINTMENT",
      entity:"Appointment",
      entityId:appointment._id
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

  const clinic = await Clinic.findById(user.clinicId);

  const day = getDayofWeek(normalizedDate);

  if (!clinic.settings.workingDays.includes(day)) {
    return {
      doctorId,
      date,
      availableSlots: [],
      message: "Clinic closed"
    };
  }

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

  //Is there leave for doctor
  const holiday=await DoctorHoliday.findOne({
    doctorId,
    clinicId:user.clinicId,
    date:normalizedDate,
    isDeleted:false
  })

  if(holiday){
    return{
      doctorId,
      date,
      availableSlots:[],
      message:"Doctor is on holiday"
    };
  }

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

  const clinicStart = toMinutes(clinic.workingHours.startTime);
  const clinicEnd = toMinutes(clinic.workingHours.endTime);

  allSlots = allSlots.filter(slot => {
    const m = toMinutes(slot);
    return m >= clinicStart && m < clinicEnd;
  });

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

  //cannot cancel if time of slot has passed
  if(isPastAppointment(appointment.appointmentDate,appointment.appointmentTime)){
    throw new ExpressError("Cannot cancel Passed Appointment",400);
  }

  appointment.status = "CANCELLED";
  await appointment.save();

  //action i.e done
    await logAction({
      user,
      action:"CANCEL_APPOINTMENT",
      entity:"Appointment",
      entityId:appointment._id
    });

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


  //change the status of appointment
  for(const appt of appointments){
    if(appt.status === "BOOKED" && isPastAppointment(appt.appointmentDate,appt.appointmentTime)){
      appt.status="NO_SHOW";
      await appt.save();
    }
  }


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

  //cannot reschedule passed appointments
  if (!appointment) {
    throw new ExpressError("Appointment not found", 404);
  }
  
  if(isPastAppointment(appointment.appointmentDate,appointment.appointmentTime)){
    throw new ExpressError("Cannot reschedule Passed Appointment",400);
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

//Appointment "COMPLETED" API
const completeAppointment=async(id,user)=>{
  const appointment=await Appointment.findOne({
    _id:id,
    clinicId:user.clinicId,
    isDeleted:false
  });

  if(!appointment){
    throw new ExpressError("Appointment not found",404);
  }

  if (!["BOOKED", "CHECKED_IN"].includes(appointment.status)) {
    throw new ExpressError(
      "Only BOOKED or CHECKED_IN appointments can be completed",
      400
    );
  }

  if(!isPastAppointment(appointment.appointmentDate,appointment.appointmentTime)){
    throw new ExpressError("Cannot complete future Appointments",400);
  }

  appointment.status="COMPLETED";
  await appointment.save();

  return appointment;
}

//Appointment Check-In
const checkInAppointment=async(id,user)=>{
  const appointment=await Appointment.findOne({
    _id:id,
    clinicId:user.clinicId,
    isDeleted:false
  });

  if(!appointment){
    throw new ExpressError("Appointment not found",404);
  }

  if(appointment.status !== "BOOKED"){
    throw new ExpressError("Only BOOKED appointments can be CHECKD_IN");
  }

  appointment.status="CHECKED_IN";

  await appointment.save();

  //action i.e done
    await logAction({
      user,
      action:"CHECKIN_APPOINTMENT",
      entity:"Appointment",
      entityId:appointment._id
    });

  return appointment;
}

//ADD APPOINTMENT NOTES
const addAppointmentNotes=async (id,data,user)=>{
  const {notes}=data;

  if(!notes || notes.trim()=== ""){
    throw new ExpressError("Notes cannot be empty",400);
  }

  const appointment=await Appointment.findOne({
    _id:id,
    clinicId:user.clinicId,
    isDeleted:false
  });

  if(!appointment){
    throw new ExpressError("Appointment not found",404);
  }

  if(appointment.status !== "COMPLETED"){
    throw new ExpressError("Notes can be added only to COMPLETED appointments",400);
  }

  appointment.notes=notes.trim();
  await appointment.save();

  await logAction({
    user,
    action: "ADD_NOTES",
    entity: "Appointment",
    entityId: appointment._id
  });

  return appointment;
}

const getDoctorSchedule = async (doctorId, date, user) => {

  //validate doctor
  const doctor = await Doctor.findOne({
    _id: doctorId,
    clinicId: user.clinicId,
    isDeleted: false
  });

  if (!doctor) {
    throw new ExpressError("Doctor not found in this Clinic", 404);
  }

  //normalize date
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  const clinic = await Clinic.findById(user.clinicId);

  const day = getDayofWeek(normalizedDate);

  if (!clinic.settings.workingDays.includes(day)) {
    return {
      doctorId,
      date,
      schedule: [],
      message: "Clinic closed"
    };
  }  

  //check holiday (EARLY EXIT)
  const holiday = await DoctorHoliday.findOne({
    doctorId,
    clinicId: user.clinicId,
    date: normalizedDate,
    isDeleted: false
  });

  if (holiday) {
    return {
      doctorId,
      date,
      schedule: [],
      message: "Doctor on Holiday"
    };
  }

  //validate availability
  if (!doctor.availability || doctor.availability.length === 0) {
    throw new ExpressError("Doctor Availability not configured", 400);
  }

  //generate all slots
  const SLOT_SIZE = 30;
  let allSlots = [];

  for (const shift of doctor.availability) {
    let current = toMinutes(shift.startTime);
    const end = toMinutes(shift.endTime);

    while (current < end) {
      allSlots.push(toTimeString(current));
      current += SLOT_SIZE;
    }
  }

  //apply CLINIC WORKING HOURS

  if (!clinic || !clinic.workingHours) {
    throw new ExpressError("Clinic working hours not configured", 400);
  }

  const clinicStart = toMinutes(clinic.workingHours.startTime);
  const clinicEnd = toMinutes(clinic.workingHours.endTime);

  allSlots = allSlots.filter(slot => {
    const m = toMinutes(slot);
    return m >= clinicStart && m < clinicEnd;
  });

  // get breaks
  const breaks = await DoctorBreak.find({
    doctorId,
    clinicId: user.clinicId,
    date: normalizedDate,
    isDeleted: false
  });

  let breakSlots = [];

  for (const br of breaks) {
    const slots = generateSlots(br.startTime, br.endTime);
    breakSlots.push(...slots);
  }

  const breakSet = new Set(breakSlots);

  // get booked appointments
  const appointments = await Appointment.find({
    doctorId,
    clinicId: user.clinicId,
    appointmentDate: normalizedDate,
    isDeleted: false,
    status: "BOOKED"
  }).select("appointmentTime -_id");

  const bookedSet = new Set(
    appointments.map(a => a.appointmentTime)
  );

  //build schedule
  const schedule = allSlots.map(time => {

    if (breakSet.has(time)) {
      return { time, status: "BREAK" };
    }

    if (bookedSet.has(time)) {
      return { time, status: "BOOKED" };
    }

    return { time, status: "AVAILABLE" };
  });

  return {
    doctorId,
    date,
    schedule
  };
};

//GET BULK APPOINTMENT LISTING it is done for exporting the appointments in bulk ex for data analytics
const getBulkAppointments=async(query,user)=>{
  let {startDate,endDate,doctorId,status}=query;

  if(!startDate || !endDate){
    throw new ExpressError("StartDate and EndDate required",400);
  }

  const start=new Date(startDate);
  const end=new Date(endDate);

  start.setHours(0,0,0,0);
  end.setHours(23,59,59,999);

  const filter={
    clinicId:user.clinicId,
    isDeleted:false,
    appointmentDate:{
      $gte:start,
      $lte:end
    }
  };

  if(doctorId){
    filter.doctorId=doctorId;
  }

  if(status){
    filter.status=status;
  }

  const appointments=await Appointment.find(filter)
    .populate("doctorId","name specialization")
    .populate("clinicId","name age")
    .sort({appointmentDate:1,appointmentTime:1})
    .limit(500)  //this limit for one time how many appointments fetched

  return {
    total:appointments.length,
    appointments
  };  
}

module.exports = {
  createAppointment,
  getAvailableSlots,
  cancelAppointment,
  getAppointments,
  rescheduleAppointment,
  completeAppointment,
  checkInAppointment,
  addAppointmentNotes,
  getDoctorSchedule,
  getBulkAppointments
};