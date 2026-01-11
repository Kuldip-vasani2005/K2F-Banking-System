const { adminLogin, adminLogout } = require("../controllers/admin.controller.js");
const { authAdmin } = require("../middleware/auth.middleware.js");
const { wrapAsync } = require("../utils/wrapAsync");
const {validateBody, schemas} = require("../validators/validate.js");

const router = require("express").Router();

router.post("/auth/login", validateBody(schemas.adminLogin), wrapAsync(adminLogin));

router.post("/logout", authAdmin, wrapAsync(adminLogout));


module.exports = router;