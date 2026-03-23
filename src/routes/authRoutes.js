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
const doctorBreakSchema = require("../validators/doctorBreakValidator");
const doctorBreakController = require("../controllers/doctorBreakController");
const doctorHolidaySchema = require("../validators/doctorHolidayValidator");
const doctorHolidayController=require("../controllers/doctorHolidayController");
const userSchema = require("../validators/userValidator");
const userController = require("../controllers/userController");
const clinicSettingsSchema = require("../validators/clinicSettingsValidator");

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

// Clinic Settings
router.patch(
  "/clinic/settings",
  authMiddleware,
  roleMiddleware("admin"),
  validate(clinicSettingsSchema),
  wrapAsync(clinicController.updateSettings)
);

    // Create User (ADMIN only)
router.post(
    "/users",
    authMiddleware,
    roleMiddleware("admin"),
    validate(userSchema),
    wrapAsync(userController.createUser)
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
    roleMiddleware("admin","receptionist"),
    wrapAsync(doctorController.getDoctors));

    //delete Doctor
router.delete(
    "/doctors/:id",
    authMiddleware,
    roleMiddleware("admin"),
    wrapAsync(doctorController.deleteDoctor)
);
    //get doctor schedule
router.get(
    "/doctors/:id/schedule",
    authMiddleware,
    roleMiddleware("admin","receptionist","doctor"),
    wrapAsync(appointmentController.getDoctorSchedule)
);

//Patient
    //Create Patient
router.post("/patients",
    authMiddleware,
    roleMiddleware("admin","receptionist"),
    validate(patientSchema),
    wrapAsync(patientController.createPatient));

    //get Patient
router.get("/patients",
    authMiddleware,
    roleMiddleware("admin","receptionist"),
    wrapAsync(patientController.getPatients));

    //delete Patient
router.delete(
    "/patients/:id",
    authMiddleware,
    roleMiddleware("admin"),
    wrapAsync(patientController.deletePatient)
);

router.get(
    "/patients/search",
    authMiddleware,
    roleMiddleware("admin","receptionist"),
    wrapAsync(patientController.searchPatient)
);


//Appointment
    //Create appointment
    router.post("/appointments",
        authMiddleware,
        validate(appointmentSchema),
        roleMiddleware("admin","receptionist"),
        wrapAsync(appointmentController.createAppointment)
    );

    //Get all available slots
    router.get("/doctors/:id/available-slots",
        authMiddleware,
        roleMiddleware("admin","receptionist"),
        wrapAsync(appointmentController.getAvailableSlots)
    );

    //cancel appointment
    router.patch("/appointments/:id/cancel",
        authMiddleware,
        roleMiddleware("admin","receptionist"),
        wrapAsync(appointmentController.cancelAppointment)
    );

    //get all appointments
    router.get("/appointments",
        authMiddleware,
        roleMiddleware("admin","receptionist"),
        wrapAsync(appointmentController.getAppointments)
    );
    
    //Reschedule appointments

    router.patch(
        "/appointments/:id/reschedule",
        authMiddleware,
        roleMiddleware("admin","receptionist"),
        wrapAsync(appointmentController.rescheduleAppointment)
    );

    //Appointment Completed
    router.patch(
        "/appointments/:id/complete",
        authMiddleware,
        roleMiddleware("doctor"),
        wrapAsync(appointmentController.completeAppointment)
    );

    //Patient Check in
    router.patch(
        "/appointments/:id/check-in",
        authMiddleware,
        roleMiddleware("receptionist"),
        wrapAsync(appointmentController.checkInAppointment)
    );

    //Appointment Noted Adding
    router.patch(
        "/appointments/:id/notes",
        authMiddleware,
        roleMiddleware("doctor"),
        wrapAsync(appointmentController.addAppointmentNotes)
    );

    //get appointments in bulk
    router.get(
        "/appointments/bulk",
        authMiddleware,
        roleMiddleware("admin"),
        wrapAsync(appointmentController.getBulkAppointments)
    );

//Doctor Break
    //create Doctor Break
    router.post(
        "/doctor-breaks",
        authMiddleware,
        roleMiddleware("admin"),
        validate(doctorBreakSchema),
        wrapAsync(doctorBreakController.createBreak)
    );


//Doctor Holiday
    //add holiday
    router.post(
        "/doctor-holidays",
        authMiddleware,
        roleMiddleware("admin"),
        validate(doctorHolidaySchema),
        wrapAsync(doctorHolidayController.createHoliday)
    );  

    //get holidays
    router.get(
        "/doctor-holidays",
        authMiddleware,
        roleMiddleware("admin"),
        wrapAsync(doctorHolidayController.getHoliday)
    );

    //delete holidays
    router.delete(
        "/doctor-holidays/:id",
        authMiddleware,
        roleMiddleware("admin"),
        wrapAsync(doctorHolidayController.deleteHoliday)
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