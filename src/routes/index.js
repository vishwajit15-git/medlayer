const express = require("express");
const router = express.Router();
const healthRoutes = require("./healthRoutes");

router.use("/auth", require("./authRoutes"));
// Later:
// router.use("/clinics", require("./clinicRoutes"));
// router.use("/doctors", require("./doctorRoutes"));

router.use("/", healthRoutes);

module.exports = router;