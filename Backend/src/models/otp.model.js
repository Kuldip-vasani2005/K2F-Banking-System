// src/models/otp.model.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    applicationId: {
        type: String,
        default: null
    },
    otp: {
        type: String,
        required: true
    },
    cardId: {
        type: String,
        default: null
    },
    pinHash: {
        type: String,
        default: null
    },
    type: {
        type: String,
        enum: ["signup", "application-verification", "forget-password", "set-pin-ATM", "unblock-card"],
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Otp", otpSchema);
