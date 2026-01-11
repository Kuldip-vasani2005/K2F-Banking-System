const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const Application = require("../models/application.model");
const BankAccount = require("../models/bankAccount.model");
const { sendEmail } = require("../utils/sendEmail");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ================= START APPLICATION ================= */
exports.startApplication = async (req, res) => {
  const userId = req.user.id;
  const { accountType } = req.body;

  if (!["saving", "current"].includes(accountType)) {
    return res.status(400).json({
      success: false,
      message: "Account type must be saving or current",
    });
  }

  const existingAccount = await BankAccount.findOne({
    userId,
    accountType,
    status: "active",
  });

  if (existingAccount) {
    return res.status(400).json({
      success: false,
      message: `You already have an active ${accountType} account`,
    });
  }

  const pendingApplication = await Application.findOne({
    userId,
    accountType,
    status: { $ne: "completed" },
  });

  if (pendingApplication) {
    return res.status(400).json({
      success: false,
      message: `You already have a pending ${accountType} application`,
    });
  }

  const application = await Application.create({
    userId,
    accountType,
  });

  res.status(200).json({
    success: true,
    applicationId: application._id,
  });
};


/* ================= GET SINGLE APPLICATION ================= */
module.exports.getApplicationById = async (req, res) => {
  const userId = req.user.id;
  const { applicationId } = req.params;

  const application = await Application.findById(applicationId);

  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  if (application.userId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  res.status(200).json({
    success: true,
    application: {
      _id: application._id,
      accountType: application.accountType,
      status: application.status,
      personalInfo: application.personalInfo || null,
      identityInfo: application.identityInfo || null,
      createdAt: application.createdAt,
    },
  });
};

/* ================= UPDATE PERSONAL INFO ================= */
module.exports.updatePersonalInfo = async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user.id;

  const application = await Application.findById(applicationId);

  if (!application) {
    return res.status(404).json({ success: false, message: "Application not found" });
  }

  if (application.userId.toString() !== userId) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  application.personalInfo = req.body;
  application.status = "personal-info-completed";
  await application.save();

  res.status(200).json({
    success: true,
    message: "Personal info updated",
  });
};

/* ================= UPDATE IDENTITY INFO ================= */
module.exports.updateIdentityInfo = async (req, res) => {
  const userId = req.user.id;
  const { applicationId } = req.params;

  const application = await Application.findById(applicationId);

  if (!application) {
    return res.status(404).json({ success: false, message: "Application not found" });
  }

  if (application.userId.toString() !== userId) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  application.identityInfo = req.body;
  application.status = "identity-info-completed";
  await application.save();

  // OTP handling
  await Otp.updateMany(
    { userId, applicationId, type: "application-verification", used: false },
    { used: true }
  );

  const otp = generateOtp();
  await Otp.create({
    userId,
    applicationId,
    otp,
    type: "application-verification",
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const user = await User.findById(userId);
  if (user?.email) {
    await sendEmail(user.email, "Verify Application", `Your OTP is ${otp}`);
  }

  res.status(200).json({
    success: true,
    message: "Identity info updated & OTP sent",
  });
};

/* ================= VERIFY OTP ================= */
module.exports.verifyApplicationOtp = async (req, res) => {
  const userId = req.user.id;
  const { applicationId } = req.params;
  const { otp } = req.body;

  const otpData = await Otp.findOne({
    userId,
    applicationId,
    otp,
    used: false,
    expiresAt: { $gt: Date.now() },
  });

  if (!otpData) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }

  otpData.used = true;
  await otpData.save();

  await Application.findByIdAndUpdate(applicationId, {
    status: "Document Submitted",
  });

  res.json({ success: true, message: "OTP verified successfully" });
};

/* ================= RESEND OTP ================= */
module.exports.resendApplicationOtp = async (req, res) => {
  const userId = req.user.id;
  const { applicationId } = req.params;

  await Otp.updateMany(
    { userId, applicationId, used: false },
    { used: true }
  );

  const otp = generateOtp();
  await Otp.create({
    userId,
    applicationId,
    otp,
    type: "application-verification",
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const user = await User.findById(userId);
  if (user?.email) {
    await sendEmail(user.email, "Verify Application", `Your OTP is ${otp}`);
  }

  res.json({ success: true, message: "OTP resent successfully" });
};

/* ================= GET APPLICATION STATUS ================= */
module.exports.getApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const application = await Application.findById(applicationId);

  if (!application) {
    return res.status(404).json({ success: false, message: "Application not found" });
  }

  res.json({ success: true, status: application.status });
};

/* ================= GET USER APPLICATIONS ================= */
module.exports.getUserApplications = async (req, res) => {
  const applications = await Application.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  res.json({ success: true, applications });
};

/* ================= CREATE BANK ACCOUNT ================= */
exports.createBankAccount = async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user.id;

  const application = await Application.findById(applicationId);

  if (!application || application.userId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized or application not found",
    });
  }

  if (application.status !== "Document Submitted") {
    return res.status(400).json({
      success: false,
      message: "Application not ready for account creation",
    });
  }

  const existingAccount = await BankAccount.findOne({
    userId,
    accountType: application.accountType,
    status: "active",
  });

  if (existingAccount) {
    return res.status(400).json({
      success: false,
      message: `You already have an active ${application.accountType} account`,
    });
  }

  const account = await BankAccount.create({
    userId,
    accountType: application.accountType,
  });

  application.status = "completed";
  application.verified = true;
  application.generatedAccount = {
    accountId: account._id,
    accountNumber: account.accountNumber,
    approvedAt: new Date(),
  };

  await application.save();

  res.status(200).json({
    success: true,
    account,
  });
};


/* ================= DELETE APPLICATION ================= */
module.exports.deleteApplication = async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user.id;

  const application = await Application.findById(applicationId);

  if (!application) {
    return res.status(404).json({ success: false, message: "Application not found" });
  }

  if (application.userId.toString() !== userId) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  if (application.status === "completed") {
    return res.status(400).json({ success: false, message: "Cannot delete completed application" });
  }

  await Otp.deleteMany({ applicationId, userId });
  await application.deleteOne();

  res.json({ success: true, message: "Application deleted successfully" });
};
