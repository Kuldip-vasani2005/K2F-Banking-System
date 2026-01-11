const router = require("express").Router();
const { authUser } = require("../middleware/auth.middleware");
const { wrapAsync } = require("../utils/wrapAsync");

const { requestCard, getCardStatus, getMyCards, sendUnblockOtp, verifyUnblockOtp, blockCard } = require("../controllers/card.controller");
const { validateBody, schemas } = require("../validators/validate");
const { unblockCardOtp, verifyUnblockCardOtp } = require("../middleware/rateLimiter");

router.post("/request", authUser, wrapAsync(requestCard));
router.get("/status", authUser, wrapAsync(getCardStatus));
router.get("/my-cards", authUser, wrapAsync(getMyCards));

router.post(
  "/block",
  authUser,
  validateBody(schemas.blockCard), // You'll need to create this schema
  wrapAsync(blockCard)
);

router.post(
    "/unblock-card",
    authUser,
    unblockCardOtp,
    validateBody(schemas.sendUnblockOtp),
    wrapAsync(sendUnblockOtp)
);

router.post(
    "/unblock-card/verify-otp", 
    authUser,
    verifyUnblockCardOtp,
    validateBody(schemas.verifyUnblockOtp),
    wrapAsync(verifyUnblockOtp)
);

module.exports = router;