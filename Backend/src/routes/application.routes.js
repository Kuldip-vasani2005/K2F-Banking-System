const router = require("express").Router();
const { authUser } = require("../middleware/auth.middleware");
const { wrapAsync } = require("../utils/wrapAsync");
const {
  startApplication,
  updatePersonalInfo,
  updateIdentityInfo,
  verifyApplicationOtp,
  resendApplicationOtp,
  getApplicationStatus,
  getUserApplications,
  getApplicationById,      // ✅ ADDED
  createBankAccount,
  deleteApplication,
} = require("../controllers/application.controller");
const { validateBody, schemas } = require("../validators/validate");

// ================= USER APPLICATION ROUTES =================

// Get all applications of logged-in user
router.get("/", authUser, wrapAsync(getUserApplications));

// Start new application
router.post("/start", authUser, wrapAsync(startApplication));

// ✅ GET SINGLE APPLICATION (MUST BE ABOVE /status)
router.get("/:applicationId", authUser, wrapAsync(getApplicationById));

// Update personal information
router.put(
  "/:applicationId/personal-info",
  authUser,
  validateBody(schemas.updatePersonalInfo),
  wrapAsync(updatePersonalInfo)
);

// Update identity information
router.put(
  "/:applicationId/identity-info",
  authUser,
  validateBody(schemas.updateIdentityInfo),
  wrapAsync(updateIdentityInfo)
);

// Verify OTP
router.post(
  "/:applicationId/verify-otp",
  authUser,
  validateBody(schemas.verifyApplicationOtp),
  wrapAsync(verifyApplicationOtp)
);

// Resend OTP
router.post(
  "/:applicationId/resend-otp",
  authUser,
  wrapAsync(resendApplicationOtp)
);

// Get application status
router.get(
  "/:applicationId/status",
  authUser,
  wrapAsync(getApplicationStatus)
);

// Create bank account
router.post(
  "/:applicationId/create-account",
  authUser,
  wrapAsync(createBankAccount)
);

// Delete application
router.delete(
  "/:applicationId",
  authUser,
  wrapAsync(deleteApplication)
);

module.exports = router;
