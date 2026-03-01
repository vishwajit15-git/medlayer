const express = require("express");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
// Later:
// router.use("/clinics", require("./clinicRoutes"));
// router.use("/doctors", require("./doctorRoutes"));

module.exports = router;