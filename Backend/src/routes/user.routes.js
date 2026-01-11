// Backend/src/routes/user.routes.js
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { authUser } = require("../middleware/auth.middleware.js");
const { getUserMe, updatePassword, userLogout } = require("../controllers/user.controller.js");
const { 
  getProfile, 
  updateProfile, 
  uploadProfilePhoto, 
  deleteProfilePhoto 
} = require("../controllers/profile.controller.js");
const { wrapAsync } = require("../utils/wrapAsync.js");
const { validateBody, schemas } = require("../validators/validate.js");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'profile-photos');
    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user?.id || 'temp';
    cb(null, `profile-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Error handler for multer
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Profile routes
router.get("/profile", authUser, wrapAsync(getProfile));
router.put("/profile/update", authUser, validateBody(schemas.updateProfile), wrapAsync(updateProfile));
router.post("/profile/photo", authUser, upload.single('profilePhoto'), multerErrorHandler, wrapAsync(uploadProfilePhoto));
router.delete("/profile/photo", authUser, wrapAsync(deleteProfilePhoto));

// Existing routes
router.get("/me", authUser, wrapAsync(getUserMe));
router.post("/update-password", authUser, validateBody(schemas.updatePassword), wrapAsync(updatePassword));
router.post("/logout", authUser, wrapAsync(userLogout));

module.exports = router;