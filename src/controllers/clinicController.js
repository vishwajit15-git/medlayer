const clinicService = require("../services/clinicService");

const registerClinic = async (req, res) => {
    const token = await clinicService.registerClinic(req.body);

    return res.status(201).json({
        message: "Clinic registered successfully",
        token
    });
};

const updateSettings = async (req, res) => {
  const settings = await clinicService.updateClinicSettings(
    req.body,
    req.user
  );

  return res.status(200).json({
    message: "Clinic settings updated",
    settings
  });
};

module.exports = {
    registerClinic,
    updateSettings
};