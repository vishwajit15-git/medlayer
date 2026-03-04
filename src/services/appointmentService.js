const Appointment=require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const ExpressError = require("../utils/ExpressError");

//helper fxn that converts all times to equal comparable format
const toMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTimeString = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

const createAppointment = async (data, user) => {
    const { doctorId, patientId, appointmentDate, appointmentTime } = data;

    if (!doctorId) {
        throw new ExpressError("Doctor is required", 400);
    }

    if (!patientId) {
        throw new ExpressError("Patient is required", 400);
    }
    //1.verify doctor in same clinic

    const doctor = await Doctor.findOne({
        _id: doctorId,
        clinicId: user.clinicId,
        isDeleted: false
    });

    if (!doctor) {
        throw new ExpressError("Doctor not found in this clinic", 404);
    }
    //check if the user has given availablity info for doctor
    if (!doctor.availability || !doctor.availability.startTime || !doctor.availability.endTime) {
        throw new ExpressError("Doctor availability not configured", 400);
    }

    //fxn call to toMinutes() fxn
    const slotMinutes = toMinutes(appointmentTime);
    const startMinutes = toMinutes(doctor.availability.startTime);
    const endMinutes = toMinutes(doctor.availability.endTime);

    if (slotMinutes < startMinutes || slotMinutes >= endMinutes) {      //Why >= endMinutes (important detail)-->If doctor works till 18:00 and slot is 30 minutes.Last valid slot start is 17:30, not 18:00.Your condition correctly blocks 18:00.
        throw new ExpressError("Slot outside doctor availability", 400);
    }

    //2.verify patient in same clinic
    const patient = await Patient.findOne({
        _id: patientId,
        clinicId: user.clinicId,
        isDeleted: false
    });

    if (!patient) {
        throw new ExpressError("Patient not found in this clinic", 404);
    }

    // 3. normalize date

    const normalizedDate = new Date(appointmentDate);
    normalizedDate.setHours(0, 0, 0, 0);

    // 4. try create appointment
    try {
    const appointment = await Appointment.create({
      doctorId,
      patientId,
      clinicId: user.clinicId,
      appointmentDate: normalizedDate,
      appointmentTime
    });

    return appointment;

    // 5. catch duplicate error → slot booked
    } catch (err) {
        if (err.code === 11000) {
        throw new ExpressError("Slot already booked", 409);
        }
        throw err;
    }
};

const getAvailableSlots = async (doctorId, date, user) => {
    //1. verify doctor in same clinic
    const doctor = await Doctor.findOne({
        _id: doctorId,
        clinicId: user.clinicId,
        isDeleted: false
    });

    if (!doctor) {
        throw new ExpressError("Doctor not found in this clinic", 404);
    }

    // 2. ensure availability configured
    if (!doctor.availability || !doctor.availability.startTime || !doctor.availability.endTime) {
        throw new ExpressError("Doctor availability not configured", 400);
    }

    //3. normalize date
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    // 4. generate ALL possible slots
    const startMinutes = toMinutes(doctor.availability.startTime);
    const endMinutes = toMinutes(doctor.availability.endTime);

    const SLOT_SIZE = 30;

    const allSlots = [];
    let current = startMinutes;

    while (current < endMinutes) {
        allSlots.push(toTimeString(current));
        current += SLOT_SIZE;
    }

    // 5. fetch booked slots
    const bookedAppointments = await Appointment.find({
        doctorId,
        clinicId: user.clinicId,
        appointmentDate: normalizedDate,
        isDeleted: false,
        status: "BOOKED"
    }).select("appointmentTime -_id");

    const bookedSet = new Set(
        bookedAppointments.map((a) => a.appointmentTime)
    );

    // 6. subtract booked from all
    const availableSlots = allSlots.filter((slot) => !bookedSet.has(slot));

    return {
        doctorId,
        date,
        availableSlots
    };
};

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

module.exports={createAppointment,getAvailableSlots,cancelAppointment};