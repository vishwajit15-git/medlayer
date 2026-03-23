const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Clinic = require("../models/Clinic");
const User = require("../models/User");
const ExpressError = require("../utils/ExpressError");

const registerClinic = async (data) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { clinicName, email, password } = data;

        if (!clinicName || !email || !password) {
            throw new ExpressError("All fields required", 400);
        }

        // Create clinic
        const clinic = await Clinic.create(
            [{ name: clinicName }],
            { session }
        );

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const user = await User.create(
            [{
                email,
                passwordHash: hashedPassword,
                clinicId: clinic[0]._id,
                role: "admin"
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        const token = jwt.sign(
            {
                id: user[0]._id,
                clinicId: user[0].clinicId,
                role: user[0].role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return token;

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

const updateClinicSettings = async (data, user) => {

  if (user.role !== "admin") {
    throw new ExpressError("Only admin can update clinic settings", 403);
  }

  const clinic = await Clinic.findById(user.clinicId);

  if (!clinic) {
    throw new ExpressError("Clinic not found", 404);
  }

  clinic.settings = clinic.settings || {};

  if (data.workingDays) {
    clinic.settings.workingDays = data.workingDays;
  }

  await clinic.save();

  return clinic.settings;
};

module.exports = {
    registerClinic,
    updateClinicSettings
};