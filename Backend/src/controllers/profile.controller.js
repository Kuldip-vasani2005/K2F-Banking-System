// src/controllers/profile.controller.js
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Get user profile
module.exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-passwordHash");
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found." 
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                profilePhoto: user.profilePhoto,
                isVerify: user.isVerify,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error while fetching profile." 
        });
    }
};

// Update profile
module.exports.updateProfile = async (req, res) => {
    try {
        const { fullName, mobile } = req.body;
        const userId = req.user.id;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (mobile) updateData.mobile = mobile;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-passwordHash");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Mobile number already exists."
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Server error while updating profile." 
        });
    }
};

// Upload profile photo
module.exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded."
            });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);

        // Delete old profile photo if exists
        if (user.profilePhoto) {
            const oldPhotoPath = path.join(__dirname, '..', 'uploads', 'profile-photos', path.basename(user.profilePhoto));
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        // Update user with new profile photo path
        user.profilePhoto = `/uploads/profile-photos/${req.file.filename}`;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile photo uploaded successfully.",
            profilePhoto: user.profilePhoto
        });
    } catch (error) {
        console.error("Error uploading profile photo:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error while uploading profile photo." 
        });
    }
};

// Delete profile photo
module.exports.deleteProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (user.profilePhoto) {
            const photoPath = path.join(__dirname, '..', 'uploads', 'profile-photos', path.basename(user.profilePhoto));
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
            
            user.profilePhoto = null;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: "Profile photo deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting profile photo:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error while deleting profile photo." 
        });
    }
};