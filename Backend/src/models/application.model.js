const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    accountType: {
      type: String,
      enum: ["saving", "current"],
      required: true,
    },

    personalInfo: {
      type: Object,
      default: null,
    },

    identityInfo: {
      type: Object,
      default: null,
    },

    // ✅ SINGLE SOURCE OF TRUTH
    identityVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "started",
        "personal-info-completed",
        "identity-info-completed",
        "Document Submitted",
        "approved",
        "rejected",
        "completed",
      ],
      default: "started",
    },

    // ❌ REMOVED verified FIELD COMPLETELY

    generatedAccount: {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BankAccount",
      },
      accountNumber: String,
      ifscCode: String,
      approvedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
