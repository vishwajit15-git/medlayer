const Doctor = require("../models/Doctor");
const DoctorHoliday = require("../models/DoctorHoliday");
const ExpressError = require("../utils/ExpressError");

const createHoliday = async (data, user) => {
    const { doctorId, date, endDate } = data;

    // Check if doctor belongs to that clinic
    const doctor = await Doctor.findOne({
        _id: doctorId,
        clinicId: user.clinicId,
        isDeleted: false
    });

    if (!doctor) {
        throw new ExpressError("Doctor not found in this clinic", 404);
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const lastDate = endDate ? new Date(endDate) : new Date(startDate);
    lastDate.setHours(0, 0, 0, 0);

    if (lastDate < startDate) {
        throw new ExpressError("End date must be on or after start date", 400);
    }

    // Cap at 30 days max to prevent abuse
    const daysDiff = Math.round((lastDate - startDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
        throw new ExpressError("Holiday range cannot exceed 30 days", 400);
    }

    const created = [];
    const skipped = [];
    const current = new Date(startDate);

    while (current <= lastDate) {
        const normalizedDate = new Date(current);
        normalizedDate.setHours(0, 0, 0, 0);

        try {
            const holiday = await DoctorHoliday.create({
                doctorId,
                clinicId: user.clinicId,
                date: normalizedDate
            });
            created.push(holiday);
        } catch (err) {
            if (err.code === 11000) {
                skipped.push(normalizedDate.toISOString().split('T')[0]);
            } else {
                throw err;
            }
        }

        current.setDate(current.getDate() + 1);
    }

    return {
        created,
        skipped,
        totalCreated: created.length,
        totalSkipped: skipped.length
    };
};

const getHoliday = async (query, user) => {
    const { doctorId } = query;

    const filter = {
        clinicId: user.clinicId,
        isDeleted: false
    };

    if (doctorId) {
        filter.doctorId = doctorId;
    }

    return await DoctorHoliday.find(filter).sort({ date: 1 });
};

const deleteHoliday = async (id, user) => {
    const holiday = await DoctorHoliday.findOne({
        _id: id,
        clinicId: user.clinicId,
        isDeleted: false
    });

    if (!holiday) {
        throw new ExpressError("Holiday not found", 404);
    }

    holiday.isDeleted = true;
    await holiday.save();

    return holiday;
};

module.exports = {
    createHoliday,
    getHoliday,
    deleteHoliday
};