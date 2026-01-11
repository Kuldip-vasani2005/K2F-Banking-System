// Backend/src/routes/auth.routes.js

const express = require("express");
const { signup, verifyOtp, resendOtp, login, resendForgetPasswordOtp, verifyForgetPasswordOtp, sendForgotPasswordOtp } = require("../controllers/auth.controller.js");
const { wrapAsync } = require("../utils/wrapAsync.js");
const { validateBody, schemas } = require("../validators/validate");
const router = express.Router();
const { signupLimiter, verifyOtpLimiter, resendOtpLimiter, forgetPasswordverifyOtpLimiter, forgetPasswordLimiter, forgetPasswordresendOtpLimiter, loginLimiter } = require("../middleware/rateLimiter.js");


router.post(
    "/signup",
    signupLimiter,
    validateBody(schemas.signup),
    wrapAsync(signup)
);

router.post(
    "/signup/verify-otp",
    verifyOtpLimiter,
    validateBody(schemas.verifyOtp),
    wrapAsync(verifyOtp)
);

router.post(
    "/signup/resend-otp",
    resendOtpLimiter,
    validateBody(schemas.resendOtp),
    wrapAsync(resendOtp)
);

router.post(
    "/login",
    loginLimiter, 
    validateBody(schemas.login),
    wrapAsync(login)
);

router.post(
    "/forget-password",
    forgetPasswordLimiter,
    validateBody(schemas.sendForgotPasswordOtp),
    wrapAsync(sendForgotPasswordOtp)
);

router.post(
    "/forget-password/verify-otp",
    forgetPasswordverifyOtpLimiter,
    validateBody(schemas.verifyForgetPasswordOtp),
    wrapAsync(verifyForgetPasswordOtp)
);

router.post(
    "/forget-password/resend-otp",
    forgetPasswordresendOtpLimiter,
    validateBody(schemas.resendOtp),
    wrapAsync(resendForgetPasswordOtp)
);

module.exports = router;