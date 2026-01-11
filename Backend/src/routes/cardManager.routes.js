const router = require("express").Router();
const { authAdmin } = require("../middleware/auth.middleware");
const { wrapAsync } = require("../utils/wrapAsync");
const { 
    getPendingCardRequests, 
    approveCardRequest, 
    rejectCardRequest,
    getCardStats  // Add this import
} = require("../controllers/cardManager.controller");

// role check middleware
const roleCheck = (role) => (req, res, next) => {
    if (req.admin.role !== role) {
        return res.status(403).json({
            success: false,
            message: `Access denied. You are not authorized ${role}.`
        });
    }
    next();
};

// GET endpoints
router.get("/requests/pending", authAdmin, roleCheck("cardManager"), wrapAsync(getPendingCardRequests));
router.get("/stats", authAdmin, roleCheck("cardManager"), wrapAsync(getCardStats)); // Add this line

// POST endpoints
router.post("/:cardRequestId/approve", authAdmin, roleCheck("cardManager"), wrapAsync(approveCardRequest));
router.post("/:cardRequestId/reject", authAdmin, roleCheck("cardManager"), wrapAsync(rejectCardRequest));

module.exports = router;