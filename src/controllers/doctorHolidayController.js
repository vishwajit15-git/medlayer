const doctorHolidayService = require("../services/doctorHolidayService");

const createHoliday = async (req, res) => {

    const holiday = await doctorHolidayService.createHoliday(
        req.body,
        req.user
    );

    return res.status(201).json({
        message: "Holiday added successfully",
        holiday
    });
};

const getHoliday = async (req, res) => {

    const holidays = await doctorHolidayService.getHolidays(
        req.query,
        req.user
    );

    return res.status(200).json({ holidays });
};

const deleteHoliday = async (req, res) => {

    await doctorHolidayService.deleteHoliday(
        req.params.id,
        req.user
    );

    return res.status(200).json({
        message: "Holiday deleted successfully"
    });
};

module.exports = {
    createHoliday,
    getHoliday,
    deleteHoliday
};