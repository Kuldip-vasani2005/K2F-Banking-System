// Backend/src/routes/superAdmin.routes.js
const router = require("express").Router();
const {wrapAsync} = require("../utils/wrapAsync");
const {authAdmin} = require("../middleware/auth.middleware");
const { getAllAdmins, createAdmin, toggleAdminStatus } = require("../controllers/superAdmin.controller");
const { validateBody, schemas } = require("../validators/validate");

const roleCheck = (role) => (req, res, next) => {
    if (req.admin.role !== role) {
        return res.status(403).json({
            success: false,
            message: `Access denied. You are not authorized ${role}.`
        });
    }
    next();
};

router.get("/list", authAdmin, roleCheck("superAdmin"), wrapAsync(getAllAdmins));
router.post("/create", authAdmin, roleCheck("superAdmin"), validateBody(schemas.createAdmin), wrapAsync(createAdmin));
router.put("/toggle/:adminId", authAdmin, roleCheck("superAdmin"), wrapAsync(toggleAdminStatus));

module.exports = router;