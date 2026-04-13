const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Clinic = require("../models/Clinic");
const User = require("../models/User");
const ExpressError = require("../utils/ExpressError");


const registerClinic =async (data) => {
    const session=await mongoose.startSession();
    session.startTransaction();

    try {
        const { clinicName,email,password }=data;

        if (!clinicName || !email || !password) {
            throw new ExpressError("All fields required", 400);
        }
        const clinic = await Clinic.create(
            [{ name: clinicName }],
            { session }
        );

        const hashedPassword = await bcrypt.hash(password, 10);

        const user =await User.create(
            [{
                email,
                passwordHash: hashedPassword,
                clinicId: clinic[0]._id,
                role: "admin"
            }],
            { session }
        );

        const payload={
            id: user[0]._id,
            clinicId: user[0].clinicId,
            role: user[0].role
        };

        const accessToken=jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn:"3h"} // short-lived
        );

        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn:"7d"} // long-lived
        );

        user[0].refreshToken=refreshToken;
        await user[0].save({session});

        await session.commitTransaction();
        session.endSession();

        return {
            accessToken,
            refreshToken
        };

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

const refreshAccessToken = async (refreshToken) => {

    if (!refreshToken) {
        throw new ExpressError("Refresh Token required", 400);
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
        throw new ExpressError("Invalid or expired refresh token", 401);
    }

    const user = await User.findById(decoded.id);

    if (!user || user.isDeleted) {
        throw new ExpressError("User not found or inactive", 404);
    }

    if (user.refreshToken !== refreshToken) {
        throw new ExpressError("Invalid refresh token (mismatch)", 401);
    }

    const payload = {
        id: user._id,
        clinicId: user.clinicId,
        role: user.role,
        doctorId: user.doctorId || null
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "3h"
    });

    const newRefreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
};


const logoutUser = async (userId) => {

    const user = await User.findById(userId);

    if (!user) {
        throw new ExpressError("User not found", 404);
    }

    user.refreshToken = null;
    await user.save();

    return { message: "Logged out successfully" };
};

const updateClinicSettings=async (data, user) => {

    const clinic=await Clinic.findById(user.clinicId);

    if(!clinic){
        throw new ExpressError("Clinic not found", 404);
    }

    if(data.workingHours){

        const {startTime,endTime} = data.workingHours;

        if (!startTime || !endTime) {
            throw new ExpressError("Working hours required", 400);
        }

        if (startTime >= endTime) {
            throw new ExpressError("Invalid working hours", 400);
        }

        clinic.workingHours.startTime = startTime;
        clinic.workingHours.endTime = endTime;
    }

    if (data.settings && data.settings.workingDays) {
        clinic.settings = clinic.settings || {};
        clinic.settings.workingDays = data.settings.workingDays;
    }

    await clinic.save();
    return clinic;
};

module.exports={
    registerClinic,
    updateClinicSettings,
    refreshAccessToken,
    logoutUser
};