// src/routes/profile.routes.js
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { authUser } = require("../middleware/auth.middleware");
const { 
    getProfile, 
    updateProfile, 
    uploadProfilePhoto, 
    deleteProfilePhoto 
} = require("../controllers/profile.controller");
const { wrapAsync } = require("../utils/wrapAsync");
const { validateBody, schemas } = require("../validators/validate");

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'profile-photos');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
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

// Profile routes
router.get("/profile", authUser, wrapAsync(getProfile));
router.put("/profile/update", authUser, validateBody(schemas.updateProfile), wrapAsync(updateProfile));
router.post("/profile/photo", authUser, upload.single('profilePhoto'), wrapAsync(uploadProfilePhoto));
router.delete("/profile/photo", authUser, wrapAsync(deleteProfilePhoto));

module.exports = router;