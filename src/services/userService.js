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

const getUsers = async (user) => {
  if (user.role !== 'admin') {
    throw new ExpressError('Only admin can view users', 403);
  }
  return await User.find({ clinicId: user.clinicId }).select('-passwordHash');
};

const deleteUser = async (targetUserId, requestingUser) => {
  if (requestingUser.role !== 'admin') {
    throw new ExpressError('Only admin can delete users', 403);
  }

  if (targetUserId === requestingUser.id) {
    throw new ExpressError('You cannot delete your own account', 400);
  }

  const target = await User.findOne({ _id: targetUserId, clinicId: requestingUser.clinicId });

  if (!target) {
    throw new ExpressError('User not found in this clinic', 404);
  }

  await User.deleteOne({ _id: targetUserId });
  return { message: 'User deleted successfully' };
};

module.exports = { createUser, getUsers, deleteUser };