// bankAccount.routes.js - FINAL + STATEMENT SUPPORT

const router = require("express").Router();
const { authUser } = require("../middleware/auth.middleware.js");
const { wrapAsync } = require("../utils/wrapAsync.js");
const {
  getMyAccounts,
  transferMoney,
  getTransactions,
  getAccountDetails,
  getRecentTransactions,
  getAccountStatement // ✅ ADD THIS
} = require("../controllers/bankAccount.controller.js");
const { validateBody, schemas } = require("../validators/validate.js");

/*
|--------------------------------------------------------------------------
| ROUTE ORDER (VERY IMPORTANT)
|--------------------------------------------------------------------------
| 1. Static routes
| 2. Action routes
| 3. Semi-dynamic routes
| 4. Fully dynamic routes (:params)
|--------------------------------------------------------------------------
*/

/* =========================
   STATIC ROUTES
========================= */

// GET /user/account/my-accounts
router.get("/my-accounts", authUser, wrapAsync(getMyAccounts));

// GET /user/account/transactions/recent
router.get("/transactions/recent", authUser, wrapAsync(getRecentTransactions));

/* =========================
   ACTION ROUTES
========================= */

// POST /user/account/transfer
router.post(
  "/transfer",
  authUser,
  validateBody(schemas.transferMoney),
  wrapAsync(transferMoney)
);

/* =========================
   SEMI-DYNAMIC ROUTES
========================= */

// ✅ ACCOUNT STATEMENT (MUST COME BEFORE :accountId)
// GET /user/account/:accountId/statement?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get(
  "/:accountId/statement",
  authUser,
  wrapAsync(getAccountStatement)
);

// GET /user/account/:accountId/transactions
router.get(
  "/:accountId/transactions",
  authUser,
  wrapAsync(getTransactions)
);

/* =========================
   FULLY DYNAMIC ROUTES (LAST)
========================= */

// GET /user/account/:accountId
router.get(
  "/:accountId",
  authUser,
  wrapAsync(getAccountDetails)
);

module.exports = router;
