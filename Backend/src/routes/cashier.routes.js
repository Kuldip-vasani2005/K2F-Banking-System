const router = require("express").Router();
const { authAdmin } = require("../middleware/auth.middleware");
const { wrapAsync } = require("../utils/wrapAsync");
const {
  depositMoney,
  withdrawMoney,
  getCashierStats,
  getRecentTransactions

} = require("../controllers/cashier.controller");
const { validateBody, schemas } = require("../validators/validate");

const roleCheck = (role) => (req, res, next) => {
  if (req.admin.role !== role) {
    return res.status(403).json({
      success: false,
      message: `Access denied. You are not authorized ${role}.`,
    });
  }
  next();
};

router.post(
  "/deposit",
  authAdmin,
  roleCheck("cashier"),
  validateBody(schemas.cashierDeposit),
  wrapAsync(depositMoney)
);

router.post(
  "/withdraw",
  authAdmin,
  roleCheck("cashier"),
  validateBody(schemas.cashierWithdraw),
  wrapAsync(withdrawMoney)
);


router.get(
  "/stats",
  authAdmin,
  roleCheck("cashier"),
  wrapAsync(getCashierStats)
);

router.get(
  "/transactions/recent",
  authAdmin,
  roleCheck("cashier"),
  wrapAsync(getRecentTransactions)
);
module.exports = router;
