const doctorHolidayService = require("../services/doctorHolidayService");

const createHoliday = async (req, res) => {

    const result = await doctorHolidayService.createHoliday(
        req.body,
        req.user
    );

    return res.status(201).json({
        message: `${result.totalCreated} holiday(s) added successfully${result.totalSkipped > 0 ? `, ${result.totalSkipped} already existed` : ''}`,
        ...result
    });
};

const getHoliday = async (req, res) => {

    const holidays = await doctorHolidayService.getHoliday(
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

const bulkDeleteHolidays = async (req, res) => {

    const result = await doctorHolidayService.bulkDeleteHolidays(
        req.body.ids,
        req.user
    );

    return res.status(200).json({
        message: `${result.deletedCount} holiday(s) deleted successfully`,
        ...result
    });
};

module.exports = {
    createHoliday,
    getHoliday,
    deleteHoliday,
    bulkDeleteHolidays
};