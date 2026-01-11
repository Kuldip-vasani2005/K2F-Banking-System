const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BankAccount",
        default: null
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BankAccount",
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ["debit", "credit", "transfer", "deposit", "withdraw"],
        required: true
    },
    status: {
        type: String,
        enum: ["success", "failed"],
        default: "success"
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    description: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
