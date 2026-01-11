// Backend/src/controllers/superAdmin.controller.js
const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");

module.exports.getAllAdmins = async (req, res) => {
    // Fetch all admins
    const admins = await Admin.find()
        .select("-passwordHash")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Admins fetched successfully",
        admins
    });
}

module.exports.createAdmin = async (req, res) => {
    const { fullName, email, mobile, role, password } = req.body;

    const VALID_ROLES = ["accountVerifier", "cashier", "cardManager", "superAdmin"];
    if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid admin role."
        });
    }

    // Check duplicate email
    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
        return res.status(400).json({
            success: false,
            message: "Admin with this email already exists."
        });
    }

    // Check duplicate mobile
    const mobileExists = await Admin.findOne({ mobile });
    if (mobileExists) {
        return res.status(400).json({
            success: false,
            message: "Mobile number already registered."
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
        fullName,
        email,
        mobile,
        role,
        passwordHash        
    });

    // Remove passwordHash from response
    const adminResponse = newAdmin.toObject();
    delete adminResponse.passwordHash;

    return res.status(201).json({
        success: true,
        message: "Admin account created successfully.",
        admin: adminResponse
    });
}

module.exports.toggleAdminStatus = async (req, res) => {
    const { adminId } = req.params;

    if (!adminId) {
        return res.status(400).json({
            success: false,
            message: "Admin ID required."
        });
    }

    // Fetch admin
    const admin = await Admin.findById(adminId);

    if (!admin) {
        return res.status(404).json({
            success: false,
            message: "Admin not found."
        });
    }

    if (admin.role === "superAdmin") {
        return res.status(403).json({
            success: false,
            message: "You cannot change status of another Super Admin."
        });
    }

    // Toggle status
    admin.isActive = !admin.isActive;
    await admin.save();

    return res.status(200).json({
        success: true,
        message: admin.isActive
            ? "Admin enabled successfully."
            : "Admin disabled successfully.",
        adminId: admin._id,
        newStatus: admin.isActive
    });
};