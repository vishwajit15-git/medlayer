const User = require("../models/User");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcrypt");
const ExpressError = require("../utils/ExpressError");

const createUser = async (data, user) => {
  const { email, password, role, doctorId } = data;

  if (user.role !== "admin") {
    throw new ExpressError("Only admin can create users", 403);
  }

  const existing = await User.findOne({ email });

  if (existing) {
    throw new ExpressError("User already exists", 400);
  }

  // If doctor role ,doctorId required
  if (role === "doctor") {
    if (!doctorId) {
      throw new ExpressError("doctorId required for doctor role", 400);
    }

    const doctor = await Doctor.findOne({
      _id: doctorId,
      clinicId: user.clinicId,
      isDeleted: false
    });

    if (!doctor) {
      throw new ExpressError("Doctor not found in this clinic", 404);
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    passwordHash,
    role,
    clinicId: user.clinicId,
    doctorId: role === "doctor" ? doctorId : null
  });

  return newUser;
};

module.exports = { createUser };