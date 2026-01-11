const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
    },

    cardNumber: {
      type: String,
      unique: true,
      required: true,
    },

    expiry: {
      type: String,
      required: true,
    },

    cvv: {
      type: String,
      required: true,
    },

    pinHash: {
      type: String,
      default: null,
    },

    pinSet: {
      type: Boolean,
      default: false,
    },

    retryCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockType: {
      type: String,
      enum: ["temporary", "permanent"],
      default: null,
    },

    blockReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", cardSchema);
