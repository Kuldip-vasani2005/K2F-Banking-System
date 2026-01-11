const rateLimit = require("express-rate-limit");

// ------------------------------ ATM LIMITER --------------------------------------

// Set PIN (request OTP)
module.exports.atmSetPinLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2,
    message: {
        success: false,
        message: "Too many set PIN requests. Try again later."
    }
});

// Verify OTP for PIN
module.exports.atmVerifyOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many wrong OTP attempts."
    }
});

// ATM Login (PIN check)
module.exports.atmLoginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many ATM login attempts."
    }
});

// Withdraw money
module.exports.atmTxnLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5
});

// Balance check
module.exports.atmViewLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20
});


// ------------------------------ AUTH LIMITER --------------------------------------

// User Singup
module.exports.signupLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many signup request."
    }
});

module.exports.verifyOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many attemp for otp verification."
    }
});

module.exports.resendOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many request for resend otp."
    }
});

module.exports.loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many attemp for login."
    }
});

module.exports.forgetPasswordLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many forget password request."
    }
});

module.exports.forgetPasswordverifyOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many attemp for otp verification."
    }
});

module.exports.forgetPasswordresendOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many request for resend otp."
    }
});


// ------------------------------ CARD LIMITER --------------------------------------

module.exports.unblockCardOtp = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many unblock card request."
    }
});

module.exports.verifyUnblockCardOtp = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many attemp for otp verification."
    }
});


// ------------------------------ APPLICATION LIMITER --------------------------------------

module.exports.applicationVerifyOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many attemp for otp verification."
    }
});

module.exports.applicationResendOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many attemp for resend otp."
    }
});