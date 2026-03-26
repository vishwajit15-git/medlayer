const express = require("express");
const router = express.Router();

const {basicHealth,dbHealth} = require("../controllers/healthController");

router.get("/health", basicHealth);
router.get("/health/db", dbHealth);

module.exports = router;