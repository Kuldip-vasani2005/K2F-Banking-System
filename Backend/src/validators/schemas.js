const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

module.exports = {
  // ================= AUTH =================
  signup: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    mobile: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required(),
    password: Joi.string().min(8).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // ============== FORGOT PASSWORD =========
  sendForgotPasswordOtp: Joi.object({
    email: Joi.string().email().required(),
  }),

  verifyForgetPasswordOtp: Joi.object({
    userId: objectId.required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(8).required(),
  }),

  // ============== OTP =====================
  verifyOtp: Joi.object({
    userId: objectId.required(),
    otp: Joi.string().length(6).required(),
  }),

  resendOtp: Joi.object({
    userId: objectId.required(),
  }),

  // ============== APPLICATION =============
  startApplication: Joi.object({
    accountType: Joi.string().valid("saving", "current").required(),
  }),

  updatePersonalInfo: Joi.object({
    fullName: Joi.string().min(2).required(),
    dob: Joi.date().iso().required(),
    gender: Joi.string()
      .valid("male", "female", "other", "prefer-not-to-say")
      .required(),
    mobile: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required(),
    email: Joi.string().email().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .required(),

    // ✅ NEW FIELDS ADDED
    occupation: Joi.string()
      .valid(
        "student",
        "employed",
        "self-employed",
        "business",
        "homemaker",
        "retired",
        "unemployed"
      )
      .required(),
    employerName: Joi.string().allow("").optional(),
    annualIncome: Joi.string()
      .valid(
        "0-250000",
        "250001-500000",
        "500001-1000000",
        "1000001-5000000",
        "5000000+"
      )
      .required(),
    sourceOfFunds: Joi.string()
      .valid(
        "salary",
        "business",
        "investments",
        "inheritance",
        "savings",
        "other"
      )
      .optional(),
    maritalStatus: Joi.string()
      .valid("single", "married", "divorced", "widowed")
      .required(),
    emergencyContactName: Joi.string().min(2).required(),
    emergencyContactPhone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required(),
    emergencyContactRelationship: Joi.string()
      .valid(
        "spouse",
        "parent",
        "sibling",
        "child",
        "friend",
        "relative",
        "other"
      )
      .required(),
  }),

  updateIdentityInfo: Joi.object({
    panNumber: Joi.string().alphanum().length(10).required(),
    aadhaarNumber: Joi.string()
      .pattern(/^\d{12}$/)
      .required(),
    fatherName: Joi.string().required(),
    annualIncome: Joi.string()
      .valid(
        "0-250000",
        "250001-500000",
        "500001-1000000",
        "1000001-5000000",
        "5000000+"
      )
      .required(),
    nationality: Joi.string().required(),
  }),

  verifyApplicationOtp: Joi.object({
    otp: Joi.string().length(6).required(),
  }),

  // ============== ADMIN ===================
  createAdmin: Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    mobile: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required(),
    role: Joi.string()
      .valid("accountVerifier", "cashier", "cardManager", "superAdmin")
      .required(),
    password: Joi.string().min(8).required(),
  }),

  adminLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),

  // ============== CARD / ATM ==============
  setPin: Joi.object({
    cardNumber: Joi.string().required(),
    pin: Joi.string()
      .pattern(/^\d{4}$/)
      .required(),
  }),

  verifyOtpOfATM: Joi.object({
    cardId: objectId.required(),
    otp: Joi.string().length(6).required(),
  }),

  atmLogin: Joi.object({
    cardNumber: Joi.string().required(),
    pin: Joi.string()
      .pattern(/^\d{4}$/)
      .required(),
  }),

  atmWithdraw: Joi.object({
    amount: Joi.number().positive().required(),
    pin: Joi.string()
      .pattern(/^\d{4}$/)
      .required(),
  }),

  atmBalance: Joi.object({
    pin: Joi.string()
      .pattern(/^\d{4}$/)
      .required(),
  }),

  // ============== BANK / TRANSFER =========
  depositOrWithdaw: Joi.object({
    accountNumber: Joi.string().required(),
    amount: Joi.number().positive().required(),
  }),

  transferMoney: Joi.object({
    fromAccountId: objectId.required(),
    toAccountNumber: Joi.string().required(),
    amount: Joi.number().positive().min(100).required(),
    atmPin: Joi.string()
      .pattern(/^\d{4}$/)
      .required(),
  }),

  // ============== CASHIER (✅ FIXED) ======
  cashierDeposit: Joi.object({
    accountNumber: Joi.string().required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().optional(),
  }),

  cashierWithdraw: Joi.object({
    accountNumber: Joi.string().required(),
    amount: Joi.number().positive().required(),
    // atmPin: Joi.string().pattern(/^\d{4}$/).required(),
    description: Joi.string().optional(),
  }),

  // ============== CARD UNBLOCK ============
  blockCard: Joi.object({
    cardId: Joi.string().required(),
    reason: Joi.string().valid("Temporary Block", "Lost/Stolen").required(),
  }),
  sendUnblockOtp: Joi.object({
    cardId: objectId.required(),
  }),

  verifyUnblockOtp: Joi.object({
    cardId: objectId.required(),
    otp: Joi.string().length(6).required(),
  }),

  // ============== USER ====================
  updatePassword: Joi.object({
    newPassword: Joi.string().min(8).required(),
    oldPassword: Joi.string().min(8).required(),
  }),

  // ============== PROFILE ====================
  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100).optional(),
    mobile: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .optional(),
  }).or("fullName", "mobile"),

  requestCard: Joi.object({
    accountId: objectId.required(),
    cardType: Joi.string().valid("debit", "credit").required(),
  }),
};
