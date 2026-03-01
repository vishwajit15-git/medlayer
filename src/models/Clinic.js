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
    }

}, { timestamps: true });

module.exports = mongoose.model("Clinic", clinicSchema);