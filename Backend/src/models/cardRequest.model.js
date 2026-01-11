const mongoose = require("mongoose");

const cardRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BankAccount",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("CardRequest", cardRequestSchema);
