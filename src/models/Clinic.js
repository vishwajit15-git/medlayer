const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    contactEmail: {
        type: String,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String
    },

    address: {
        type: String
    },

    isActive: {
        type: Boolean,
        default: true
    },
    workingHours: {
        startTime: {
            type: String,
            default: "09:00"
        },
        endTime: {
            type: String,
            default: "18:00"
        }
    },
    settings:{
        workingDays:{
            type:[String],
            default:["MON","TUE","WED","THU","FRI"]
        }
    }

}, { timestamps: true });

module.exports = mongoose.model("Clinic", clinicSchema);