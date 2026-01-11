// account verifier controller

const Application = require("../models/application.model");
const BankAccount = require("../models/bankAccount.model");
const Identity = require("../models/identity.model");

module.exports.getPendingApplications = async (req, res) => {
  const applications = await Application.find({
    status: "Document Submitted",
    identityVerified: false,
  });

  return res.status(200).json({
    success: true,
    applications,
  });
};

module.exports.getApplicationDetails = async (req, res) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    return res.status(400).json({
      success: false,
      message: "application ID is required.",
    });
  }

  const applicationData = await Application.findById(applicationId).populate(
    "userId"
  );

  if (!applicationData) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  return res.status(200).json({
    success: true,
    application: applicationData,
  });
};

module.exports.approveApplication = async (req, res) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    return res.status(400).json({
      success: false,
      message: "application ID is required.",
    });
  }

  if (!applicationId) {
    return res.status(400).json({
      success: false,
      message: "application ID is required.",
    });
  }

  const applicationData = await Application.findById(applicationId);

  if (!applicationData) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  if (applicationData.verified === true) {
    return res
      .status(400)
      .json({ success: false, message: "Application already approved" });
  }

  if (!applicationData.identityVerified) {
    return res.status(400).json({
      success: false,
      message: "Identity not verified yet",
    });
  }

  applicationData.verified = true;
  applicationData.status = "approved";
  await applicationData.save();

  // Create bank account
  const accountNumber = "AC" + Date.now();

  await BankAccount.create({
    userId: applicationData.userId,
    accountType: applicationData.accountType, // ✅ REQUIRED
    balance: 0,
  });

  return res.status(200).json({
    success: true,
    message: "Application approved & account created",
    accountNumber,
  });
};

module.exports.rejectApplication = async (req, res) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    return res.status(400).json({
      success: false,
      message: "application ID is required.",
    });
  }

  const applicationData = await Application.findById(applicationId);

  if (!applicationData) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  applicationData.status = "rejected";
  applicationData.verified = false;
  await applicationData.save();

  return res.status(200).json({
    success: true,
    message: "Application rejected",
  });
};

// Backend/src/controllers/accountVerifier.controller.js
module.exports.verifyIdentity = async (req, res) => {
  const { applicationId } = req.params;

  if (!applicationId) {
    return res.status(400).json({
      success: false,
      message: "Application ID is required.",
    });
  }

  const applicationData = await Application.findById(applicationId);

  if (!applicationData) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
    });
  }

  // Extract data from application
  const { identityInfo, personalInfo } = applicationData;

  // Check if required data exists
  if (!identityInfo || !personalInfo) {
    return res.status(400).json({
      success: false,
      verified: false,
      message: "Application data incomplete",
    });
  }

  const aadhaarNumber = identityInfo.aadhaarNumber;
  const panNumber = identityInfo.panNumber;
  const fullName = personalInfo.fullName;

  // Validate data exists
  if (!aadhaarNumber || !panNumber || !fullName) {
    return res.status(400).json({
      success: false,
      verified: false,
      message: "Missing identity information in application",
    });
  }

  console.log("Looking for Aadhaar:", { aadhaarNumber, fullName }); // DEBUG LOG
  console.log("Looking for PAN:", { panNumber, fullName }); // DEBUG LOG

  // Check dummy identity DB
  const aadhaarVerify = await Identity.findOne({
    aadhaarNumber: aadhaarNumber,
    fullName: fullName,
  });

  if (!aadhaarVerify) {
    return res.status(400).json({
      success: false,
      verified: false,
      message: "Aadhaar Data not match.",
      debug: {
        searched: { aadhaarNumber, fullName },
        found: null,
      },
    });
  }

  const panVerify = await Identity.findOne({
    panNumber: panNumber,
    fullName: fullName,
  });

  if (!panVerify) {
    return res.status(400).json({
      success: false,
      verified: false,
      message: "Pan card Data not match.",
      debug: {
        searched: { panNumber, fullName },
        found: null,
      },
    });
  }

  // Check if both belong to same person
  if (aadhaarVerify._id.toString() !== panVerify._id.toString()) {
    return res.status(400).json({
      success: false,
      verified: false,
      message: "Aadhaar & PAN belong to different persons.",
      mismatch: "cross-check",
      debug: {
        aadhaarId: aadhaarVerify._id,
        panId: panVerify._id,
      },
    });
  }

  // Update application
  applicationData.identityVerified = true;
  await applicationData.save();

  return res.status(200).json({
    success: true,
    verified: true,
    message: "Identity verified successfully",
    aadhaarData: aadhaarVerify,
    panData: panVerify,
  });
};
