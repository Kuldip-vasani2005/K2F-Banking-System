// ATM Routes
const router = require("express").Router();
const { setPin, verifyOtpOfATM, atmLogin, atmWithdraw, getAtmBalance } = require("../controllers/atm.controller");
const { authAtm } = require("../middleware/auth.middleware");
const { wrapAsync } = require("../utils/wrapAsync");
const { validateBody, schemas } = require("../validators/validate");

// request limiter
const { atmSetPinLimiter, atmVerifyOtpLimiter, atmLoginLimiter, atmTxnLimiter, atmViewLimiter } = require("../middleware/rateLimiter");

router.post(
    "/set-pin",
    atmSetPinLimiter,
    validateBody(schemas.setPin),
    wrapAsync(setPin)
);

router.post(
    "/set-pin/verify-otp",
    atmVerifyOtpLimiter,
    validateBody(schemas.verifyOtpOfATM),
    wrapAsync(verifyOtpOfATM)
);

router.post(
    "/login",
    atmLoginLimiter,
    validateBody(schemas.atmLogin),
    wrapAsync(atmLogin)
);

router.post(
    "/withdraw",
    authAtm,
    atmTxnLimiter,
    validateBody(schemas.atmWithdraw),
    wrapAsync(atmWithdraw)
);

router.post(
    "/check-balance",
    authAtm,
    atmViewLimiter,
    validateBody(schemas.atmBalance),
    wrapAsync(getAtmBalance)
);

module.exports = router;