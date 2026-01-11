const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    accountNumber: {
      type: String,
      unique: true,
    },

    ifsc: {
      type: String,
      default: "MYBK0001234",
    },

    balance: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending", "suspended"],
      default: "active",
    },

    accountType: {
      type: String,
      enum: ["saving", "current"],
      required: true,
    },

    accountName: {
      type: String,
      default: function () {
        return `${
          this.accountType.charAt(0).toUpperCase() +
          this.accountType.slice(1)
        } Account`;
      },
    },

    minimumBalance: {
      type: Number,
      default: function () {
        return this.accountType === "current" ? 10000 : 0;
      },
    },

    interestRate: {
      type: Number,
      default: function () {
        return this.accountType === "saving" ? 3.5 : 0;
      },
    },

    monthlyTransactionLimit: {
      type: Number,
      default: function () {
        return this.accountType === "saving" ? 20 : 100;
      },
    },

    overdraftLimit: {
      type: Number,
      default: function () {
        return this.accountType === "current" ? 50000 : 0;
      },
    },
  },
  { timestamps: true }
);

/**
 * 🔒 HARD DB GUARANTEE
 * Only ONE ACTIVE account per user per accountType
 */
bankAccountSchema.index(
  { userId: 1, accountType: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
  }
);

/**
 * ✅ Account number generator
 */
bankAccountSchema.pre("save", function () {
  if (!this.accountNumber) {
    const bankCode = "MYBK";
    const branchCode = "0001";
    const typeCode = this.accountType === "saving" ? "11" : "12";
    const random = Math.floor(100000 + Math.random() * 900000);
    this.accountNumber = `${bankCode}${branchCode}${typeCode}${random}`;
  }
  // next();
});

module.exports = mongoose.model("BankAccount", bankAccountSchema);
