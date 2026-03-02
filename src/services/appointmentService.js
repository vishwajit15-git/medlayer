const Appointment=require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const ExpressError = require("../utils/ExpressError");

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
    //2.verify patient in same clinic

    const patient = await Patient.findOne({
        _id: patientId,
        clinicId: user.clinicId,
        isDeleted: false
    });

    if (!patient) {
        throw new ExpressError("Patient not fount in this clinic", 404);
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

module.exports={createAppointment};