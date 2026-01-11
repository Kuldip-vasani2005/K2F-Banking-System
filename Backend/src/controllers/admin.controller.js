const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const Identity = require("../models/identity.model");
const BankAccount = require("../models/bankAccount.model");
const Application = require("../models/application.model");

module.exports.adminLogin = async (req, res) => {

    const { email, password } = req.body;

    const adminData = await Admin.findOne({ email });

    if (!adminData) {
        return res.status(404).json({
            success: false,
            message: "Admin not found."
        })
    }

    if (adminData.isActive !== true) {
        return res.status(403).json({
            success: false,
            message: "Admin account is disabled."
        });
    }

    const isMatch = await bcrypt.compare(password, adminData.passwordHash);

    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: "Invalid password."
        });
    }

    const token = jwt.sign(
        {
            id: adminData._id,
            fullName: adminData.fullName,
            email: adminData.email,
            role: adminData.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.cookie("adminToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        success: true,
        message: "Admin login successful.",
        admin: {
            id: adminData._id,
            email: adminData.email,
            fullName: adminData.fullName,
            role: adminData.role
        }
    });

}

module.exports.adminLogout = async (req, res) => {
    res.clearCookie("adminToken", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax"
    });

    return res.status(200).json({
        success: true,
        message: "Admin logged out successfully."
    });
};
