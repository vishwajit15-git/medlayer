const PERMISSIONS={
  CREATE_APPOINTMENT:["admin", "receptionist"],
    CANCEL_APPOINTMENT:["admin", "receptionist"],
    CHECKIN_APPOINTMENT:["admin", "receptionist", "doctor"],
    COMPLETE_APPOINTMENT:["admin", "receptionist", "doctor"],
    ADD_NOTES:["admin", "receptionist", "doctor"],

    VIEW_APPOINTMENTS: ["admin", "receptionist"],
    VIEW_BULK_APPOINTMENTS: ["admin"],
    RESCHEDULE_APPOINTMENT: ["admin", "receptionist"],

    VIEW_AVAILABLE_SLOTS: ["admin", "receptionist"],
    VIEW_DOCTOR_SCHEDULE: ["admin", "receptionist", "doctor"],

    CREATE_DOCTOR_BREAK: ["admin"],

    CREATE_HOLIDAY: ["admin"],
    VIEW_HOLIDAY: ["admin", "receptionist"],
    DELETE_HOLIDAY: ["admin"],
  
    CREATE_DOCTOR:["admin"],
    UPDATE_DOCTOR:["admin"],
    DELETE_DOCTOR:["admin"],
    VIEW_DOCTOR:["admin", "receptionist"],

    CREATE_PATIENT:["admin", "receptionist"],
    UPDATE_PATIENT:["admin", "receptionist"],
    DELETE_PATIENT:["admin"],
    VIEW_PATIENT:["admin", "receptionist"],

    CREATE_USER:["admin"],
    UPDATE_USER:["admin"],
    DELETE_USER:["admin"],

    UPDATE_CLINIC:["admin"],
    VIEW_AUDIT_LOGS:["admin"]
};

module.exports=PERMISSIONS;