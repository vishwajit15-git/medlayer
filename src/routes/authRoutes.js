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
const auditController=require("../controllers/auditLogController");
const permit=require("../middlewares/permissionMiddleware");

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
  permit("UPDATE_CLINIC"),
  validate(clinicSettingsSchema),
  wrapAsync(clinicController.updateSettings)
);

    // Create User (ADMIN only)
router.post(
    "/users",
    authMiddleware,
    permit("CREATE_USER"),
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
    permit("CREATE_DOCTOR"),
    validate(doctorSchema),
    wrapAsync(doctorController.createDoctor));

    //get Doctor
router.get("/doctors",
    authMiddleware,
    permit("VIEW_DOCTOR"),
    wrapAsync(doctorController.getDoctors));

    //delete Doctor
router.delete(
    "/doctors/:id",
    authMiddleware,
    permit("DELETE_DOCTOR"),
    wrapAsync(doctorController.deleteDoctor)
);
    //get doctor schedule
router.get(
    "/doctors/:id/schedule",
    authMiddleware,
    permit("VIEW_DOCTOR_SCHEDULE"),
    wrapAsync(appointmentController.getDoctorSchedule)
);

//Patient
    //Create Patient
router.post("/patients",
    authMiddleware,
    permit("CREATE_PATIENT"),
    validate(patientSchema),
    wrapAsync(patientController.createPatient));

    //get Patient
router.get("/patients",
    authMiddleware,
    permit("VIEW_PATIENT"),
    wrapAsync(patientController.getPatients));

    //delete Patient
router.delete(
    "/patients/:id",
    authMiddleware,
    permit("DELETE_PATIENT"),
    wrapAsync(patientController.deletePatient)
);

router.get(
    "/patients/search",
    authMiddleware,
    permit("VIEW_PATIENT"),
    wrapAsync(patientController.searchPatient)
);


//Appointment
    //Create appointment
    router.post("/appointments",
        authMiddleware,
        validate(appointmentSchema),
        permit("CREATE_APPOINTMENT"),
        wrapAsync(appointmentController.createAppointment)
    );

    //Get all available slots
    router.get("/doctors/:id/available-slots",
        authMiddleware,
        permit("VIEW_AVAILABLE_SLOTS"),
        wrapAsync(appointmentController.getAvailableSlots)
    );

    //cancel appointment
    router.patch("/appointments/:id/cancel",
        authMiddleware,
        permit("CANCEL_APPOINTMENT"),
        wrapAsync(appointmentController.cancelAppointment)
    );

    //get all appointments
    router.get("/appointments",
        authMiddleware,
        permit("VIEW_APPOINTMENTS"),
        wrapAsync(appointmentController.getAppointments)
    );
    
    //Reschedule appointments

    router.patch(
        "/appointments/:id/reschedule",
        authMiddleware,
        permit("RESCHEDULE_APPOINTMENT"),
        wrapAsync(appointmentController.rescheduleAppointment)
    );

    //Appointment Completed
    router.patch(
        "/appointments/:id/complete",
        authMiddleware,
        permit("COMPLETE_APPOINTMENT"),
        wrapAsync(appointmentController.completeAppointment)
    );

    //Patient Check in
    router.patch(
        "/appointments/:id/check-in",
        authMiddleware,
        permit("CHECKIN_APPOINTMENT"),
        wrapAsync(appointmentController.checkInAppointment)
    );

    //Appointment Noted Adding
    router.patch(
        "/appointments/:id/notes",
        authMiddleware,
        permit("ADD_NOTES"),
        wrapAsync(appointmentController.addAppointmentNotes)
    );

    //get appointments in bulk
    router.get(
        "/appointments/bulk",
        authMiddleware,
        permit("VIEW_BULK_APPOINTMENTS"),
        wrapAsync(appointmentController.getBulkAppointments)
    );

//Doctor Break
    //create Doctor Break
    router.post(
        "/doctor-breaks",
        authMiddleware,
        permit("CREATE_DOCTOR_BREAK"),
        validate(doctorBreakSchema),
        wrapAsync(doctorBreakController.createBreak)
    );


//Doctor Holiday
    //add holiday
    router.post(
        "/doctor-holidays",
        authMiddleware,
        permit("CREATE_HOLIDAY"),
        validate(doctorHolidaySchema),
        wrapAsync(doctorHolidayController.createHoliday)
    );  

    //get holidays
    router.get(
        "/doctor-holidays",
        authMiddleware,
        permit("VIEW_HOLIDAY"),
        wrapAsync(doctorHolidayController.getHoliday)
    );

    //delete holidays
    router.delete(
        "/doctor-holidays/:id",
        authMiddleware,
        permit("DELETE_HOLIDAY"),
        wrapAsync(doctorHolidayController.deleteHoliday)
    );


//Audit Log
    router.get(
        "/audit-logs",
        authMiddleware,
        permit("VIEW_AUDIT_LOGS"),
        auditController.getLogs
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