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
                password: hashedPassword,
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
            { expiresIn: "1h" }
        );

        return token;

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

module.exports = {
    registerClinic
};