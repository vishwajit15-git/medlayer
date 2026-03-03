const express=require("express");
const router=express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {authMiddleware}=require("../middlewares/authMiddleware");
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/User");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const Clinic = require("../models/Clinic");
const validate = require("../middlewares/validationMiddleware");
const doctorSchema = require("../validators/doctorValidator");
const doctorController = require("../controllers/doctorController");
const clinicController = require("../controllers/clinicController");
const patientSchema = require("../validators/patientValidator");
const patientController = require("../controllers/patientController");
const appointmentSchema = require("../validators/appointmentValidator");
const appointmentController=require("../controllers/appointmentController");

router.get("/whoami", authMiddleware, (req, res) => {
    res.json({
        id: req.user.id,
        clinicId: req.user.clinicId,
        role: req.user.role
    });
});

//CLINIC(Admin)

    //create Clinic
router.post(
    "/register-clinic",
    wrapAsync(clinicController.registerClinic)
);
    //Login as Admin to Clinic
router.post("/login", wrapAsync(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ExpressError("Email and password required", 400);
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new ExpressError("Invalid Credentials", 401);
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new ExpressError("Invalid Credentials", 401);
        }

        const token = jwt.sign(
            {
                id: user._id,
                clinicId: user.clinicId,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ token });
    }));



//Doctors 
    //Create Doctor
router.post("/doctors",
    authMiddleware,
    roleMiddleware("admin"),
    validate(doctorSchema),
    wrapAsync(doctorController.createDoctor));

    //get Doctor
router.get("/doctors",
    authMiddleware,
    wrapAsync(doctorController.getDoctors));

    //delete Doctor
router.delete(
    "/doctors/:id",
    authMiddleware,
    roleMiddleware("admin"),
    wrapAsync(doctorController.deleteDoctor)
);


//Patient
    //Create Patient
router.post("/patients",
    authMiddleware,
    roleMiddleware("admin"),
    validate(patientSchema),
    wrapAsync(patientController.createPatient));

    //get Patient
router.get("/patients",
    authMiddleware,
    wrapAsync(patientController.getPatients));

    //delete Patient
router.delete(
    "/patients/:id",
    authMiddleware,
    roleMiddleware("admin"),
    wrapAsync(patientController.deletePatient)
);


//Appointment
    //Create appointment
    router.post("/appointments",
        authMiddleware,
        validate(appointmentSchema),
        wrapAsync(appointmentController.createAppointment)
    );

    //Get all available slots
    router.get("/doctors/:id/available-slots",
        authMiddleware,
        wrapAsync(appointmentController.getAvailableSlots)
    );

// router.get("/profile",authMiddleware,(req,res)=>{
//     return res.status(200).json({
//         message:"Profile accessed",
//         user:req.user
//     })
// });

// router.get("/admin",authMiddleware,roleMiddleware("admin"),(req, res) => {
//         res.json({ message: "Welcome Admin" });
//     }
// );
module.exports=router;
// START TRANSACTION

// Do Operation A
// Do Operation B

// If all good:
//     COMMIT
// Else:
//     ROLLBACK