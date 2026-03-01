const clinicService = require("../services/clinicService");

const registerClinic = async (req, res) => {
    const token = await clinicService.registerClinic(req.body);

    return res.status(201).json({
        message: "Clinic registered successfully",
        token
    });
};

module.exports = {
    registerClinic
};