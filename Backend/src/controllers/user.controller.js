// src/controllers/user.controller.js
const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const bcrypt = require("bcryptjs");

module.exports.getUserMe = (req, res) => {
  if (!req.user.id || !req.user.email) {
    return res.status(400).json({ 
      success: false, 
      message: "Something went wrong." 
    });
  }

  res.status(200).json({
    success: true,
    userId: req.user.id,
    email: req.user.email,
    fullName: req.user.fullName
  });
};

module.exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, userData.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect."
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    // Correct way to update the passwordHash
    userData.passwordHash = newHash;
    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully."
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating password."
    });
  }
};

module.exports.userLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax"
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully."
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during logout."
    });
  }
};