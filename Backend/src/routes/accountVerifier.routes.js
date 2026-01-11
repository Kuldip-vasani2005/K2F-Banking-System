// Backend/src/routes/accountVerifier.routes.js
const router = require("express").Router();
const { getPendingApplications, getApplicationDetails, verifyIdentity, approveApplication, rejectApplication } = require("../controllers/accountVerifier.controller");
const { authAdmin } = require("../middleware/auth.middleware");
const { wrapAsync } = require("../utils/wrapAsync");
const {validateBody, schemas} = require("../validators/validate");

const roleCheck = (role) => (req, res, next) => {
    if (req.admin.role !== role) {
        return res.status(403).json({
            success: false,
            message: `Access denied. You are not authorized ${role}.`
        });
    }
    next();
};

router.get("/applications/pending", authAdmin, roleCheck("accountVerifier"), wrapAsync(getPendingApplications));
router.get("/applications/:applicationId", authAdmin, roleCheck("accountVerifier"), wrapAsync(getApplicationDetails));

router.post("/applications/:applicationId/verify-identity", authAdmin, roleCheck("accountVerifier"), wrapAsync(verifyIdentity));
router.post("/applications/:applicationId/approve", authAdmin, roleCheck("accountVerifier"), wrapAsync(approveApplication));
router.post("/applications/:applicationId/reject", authAdmin, roleCheck("accountVerifier"), wrapAsync(rejectApplication));

module.exports = router;