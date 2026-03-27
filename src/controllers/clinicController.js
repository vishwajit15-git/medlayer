const clinicService = require("../services/clinicService");
const { message } = require("../validators/doctorValidator");

const registerClinic = async (req, res) => {
    const tokens = await clinicService.registerClinic(req.body);

    return res.status(201).json({
        message: "Clinic registered successfully",
        ...tokens
    });
};

const refreshToken=async (req, res) => {

  const {refreshToken} = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      message:"Refresh token required"
    });
  }

  const data=await clinicService.refreshAccessToken(refreshToken);

  return res.status(200).json({
    message:"Access Token refreshed",
    accessToken:data.accessToken,
    refreshToken:data.refreshToken
  });
};

const logout=async (req,res) => {

  const data=await clinicService.logoutUser(req.user.id);

  return res.status(200).json({
    message:data.message
  });
};

const updateSettings = async (req, res)=>{
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
    updateSettings,
    refreshToken,
    logout
};