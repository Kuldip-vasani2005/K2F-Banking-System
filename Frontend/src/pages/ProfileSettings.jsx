import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Camera,
  Save,
  Lock,
  Mail,
  Phone,
  Trash2,
  Upload,
  AlertCircle,
  ArrowLeft,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import API, { userAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import FancyAlert from "../components/AlertBox/FancyAlert";
import ConfirmDialog from "../components/AlertBox/ConfirmDialog";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alerts, setAlerts] = useState([]); // Changed from message to alerts array
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [securityForm, setSecurityForm] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: true,
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const getApiBaseUrl = () => {
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.REACT_APP_API_URL
    ) {
      return process.env.REACT_APP_API_URL;
    }
    return "http://localhost:5000";
  };

  // Function to add a new alert
  const addAlert = (type, text) => {
    const id = Date.now(); // Use timestamp as unique ID
    setAlerts((prev) => [...prev, { id, type, text }]);
    return id;
  };

  // Function to remove an alert
  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Function to show message (backward compatibility)
  const showMessage = (type, text) => {
    addAlert(type, text);
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await API.get("/user/profile");

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setProfileForm({
          fullName: userData.fullName || "",
          mobile: userData.mobile || "",
          email: userData.email || "",
        });

        setSecurityForm({
          twoFactorEnabled: userData.twoFactorEnabled || false,
          emailNotifications: userData.emailNotifications ?? true,
          smsNotifications: userData.smsNotifications ?? true,
        });

        // Handle profile photo with cache busting
        if (userData.profilePhoto) {
          const baseUrl = getApiBaseUrl();
          setPreviewImage(`${baseUrl}${userData.profilePhoto}?t=${Date.now()}`);
        } else {
          setPreviewImage(null);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);

      let errorMessage = "Failed to load profile data.";
      if (error.code === "ERR_NETWORK") {
        errorMessage =
          "Cannot connect to server. Make sure backend is running on port 5000.";
      } else if (error.response) {
        errorMessage = error.response.data?.message || "Server error occurred.";
      }

      addAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (field) => {
    setSecurityForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await API.put("/user/profile/update", profileForm);
      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.user };
        setUser(updatedUser);
        addAlert("success", "Profile updated successfully!");

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const newUserData = {
          ...storedUser,
          fullName: updatedUser.fullName,
          mobile: updatedUser.mobile,
          email: updatedUser.email,
        };
        localStorage.setItem("user", JSON.stringify(newUserData));

        // Dispatch event to update navbar
        window.dispatchEvent(
          new CustomEvent("profileUpdated", {
            detail: {
              user: newUserData,
              profilePhoto: updatedUser.profilePhoto,
            },
          })
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      addAlert(
        "error",
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };
  const confirmDeletePhoto = async () => {
    setShowConfirm(false);
    setUploading(true);

    try {
      const response = await API.delete("/user/profile/photo");

      if (response.data.success) {
        const updatedUser = { ...user, profilePhoto: null };
        setUser(updatedUser);
        setPreviewImage(null);

        addAlert("success", "Profile photo removed successfully!");

        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, profilePhoto: null })
        );

        window.dispatchEvent(
          new CustomEvent("profileUpdated", {
            detail: { user: storedUser, profilePhoto: null },
          })
        );
      }
    } catch (error) {
      addAlert(
        "error",
        error.response?.data?.message || "Failed to remove photo."
      );
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addAlert("error", "New passwords do not match!");
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      addAlert("error", "Password must be at least 6 characters!");
      setSaving(false);
      return;
    }

    try {
      const response = await userAPI.updatePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.data.success) {
        addAlert("success", "Password updated successfully!");
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      addAlert(
        "error",
        error.response?.data?.message || "Failed to update password."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSecurityUpdate = async () => {
    setSaving(true);
    try {
      const response = await API.put("/user/security", securityForm);
      if (response.data.success) {
        addAlert("success", "Security settings updated!");
      }
    } catch (error) {
      addAlert("error", "Failed to update security settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addAlert("error", "File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      handlePhotoUpload(file);
    }
  };

  const handlePhotoUpload = async (file) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      const response = await API.post("/user/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const updatedUser = {
          ...user,
          profilePhoto: response.data.profilePhoto,
        };
        setUser(updatedUser);

        // Update preview with the new photo URL
        const baseUrl = getApiBaseUrl();
        if (response.data.profilePhoto) {
          setPreviewImage(
            `${baseUrl}${response.data.profilePhoto}?t=${Date.now()}`
          );
        }

        addAlert("success", "Profile photo updated successfully!");

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const newUserData = {
          ...storedUser,
          profilePhoto: response.data.profilePhoto,
        };
        localStorage.setItem("user", JSON.stringify(newUserData));

        // Dispatch event to update navbar
        window.dispatchEvent(
          new CustomEvent("profileUpdated", {
            detail: {
              user: newUserData,
              profilePhoto: response.data.profilePhoto,
            },
          })
        );
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      addAlert(
        "error",
        error.response?.data?.message || "Failed to upload photo."
      );
      // Revert preview to original
      const baseUrl = getApiBaseUrl();
      if (user?.profilePhoto) {
        setPreviewImage(`${baseUrl}${user.profilePhoto}?t=${Date.now()}`);
      } else {
        setPreviewImage(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = () => {
    setShowConfirm(true);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center pt-16">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-gray-300 font-medium text-lg"
          >
            Loading your profile...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ConfirmDialog
        open={showConfirm}
        title="Remove Profile Photo"
        message="Are you sure you want to remove your profile photo? This action cannot be undone."
        onConfirm={confirmDeletePhoto}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Alert Container - Top Left Corner */}
      <div className="fixed top-20 right-6 z-50 space-y-3">
        <AnimatePresence>
          {alerts.map((alert) => (
            <FancyAlert
              key={alert.id}
              type={alert.type}
              message={alert.text}
              onClose={() => removeAlert(alert.id)}
              duration={2000} // Auto-hide after 5 seconds
              autoClose={true}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden pt-16">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-cyan-500/5 rounded-full blur-2xl" />
        </div>

        <div className="container mx-auto px-6 pt-6 pb-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center text-gray-400 hover:text-cyan-300 mb-6 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30 mb-4">
                  <User className="w-4 h-4 text-cyan-300 mr-2" />
                  <span className="text-sm font-medium text-cyan-300">
                    Profile Management
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                    Account Settings
                  </span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                  Manage your personal information, security, and preferences
                </p>
              </div>

              <div className="mt-6 lg:mt-0">
                <div className="px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
                  <span className="text-sm text-gray-300">
                    Last updated: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Left Sidebar - Profile Card & Navigation */}
            <div className="lg:col-span-1">
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl p-8 mb-8"
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-gray-800 shadow-2xl bg-gradient-to-br from-blue-500 to-cyan-400">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback = e.target.nextElementSibling;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center ${
                          previewImage ? "hidden" : ""
                        }`}
                      >
                        <span className="text-6xl font-bold text-white">
                          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    </div>

                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-2">
                    {user?.fullName || "User"}
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
                    {user?.email || "user@example.com"}
                  </p>

                  <div className="space-y-3 w-full">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="profilePhotoInput"
                        disabled={uploading}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() =>
                          document.getElementById("profilePhotoInput").click()
                        }
                        disabled={uploading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 rounded-xl hover:bg-blue-500/30 disabled:opacity-50 transition-all flex items-center justify-center"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Uploading..." : "Change Photo"}
                      </motion.button>
                    </label>

                    {user?.profilePhoto && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDeletePhoto}
                        disabled={uploading}
                        className="w-full py-3 px-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl hover:bg-red-500/20 disabled:opacity-50 transition-all flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Photo
                      </motion.button>
                    )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-700/50 w-full">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400">Member Since</p>
                        <p className="font-semibold text-white">
                          {user?.createdAt
                            ? new Date(user.createdAt).getFullYear()
                            : "2024"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Status</p>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Navigation Tabs */}
              <motion.div variants={itemVariants} className="space-y-2">
                {[
                  { id: "personal", icon: User, label: "Personal Info" },
                  { id: "security", icon: Shield, label: "Security" },
                  { id: "notifications", icon: Bell, label: "Notifications" },
                  { id: "preferences", icon: Globe, label: "Preferences" },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-6 py-4 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-cyan-300"
                        : "bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Personal Information Tab */}
              <AnimatePresence mode="wait">
                {activeTab === "personal" && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl p-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Personal Information
                        </h2>
                        <p className="text-gray-400">
                          Update your basic information and contact details
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-cyan-300" />
                      </div>
                    </div>

                    <form onSubmit={handleProfileUpdate}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="text"
                              name="fullName"
                              value={profileForm.fullName}
                              onChange={handleProfileChange}
                              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-500 transition-all"
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="email"
                              value={profileForm.email}
                              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 cursor-not-allowed"
                              disabled
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                              Cannot be changed
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Mobile Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="tel"
                              name="mobile"
                              value={profileForm.mobile}
                              onChange={handleProfileChange}
                              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-500 transition-all"
                              placeholder="Enter mobile number"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Account Type
                          </label>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                              type="text"
                              value={
                                user?.accountType === "saving"
                                  ? "Savings Account"
                                  : "Current Account"
                              }
                              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 cursor-not-allowed"
                              disabled
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-gray-700/50">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={saving}
                          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5 mr-3" />
                              Save Personal Information
                            </>
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Change Password */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">
                            Change Password
                          </h2>
                          <p className="text-gray-400">
                            Update your password to keep your account secure
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-emerald-300" />
                        </div>
                      </div>

                      <form onSubmit={handlePasswordUpdate}>
                        <div className="space-y-6">
                          {[
                            {
                              label: "Current Password",
                              name: "oldPassword",
                              value: passwordForm.oldPassword,
                              field: "old",
                            },
                            {
                              label: "New Password",
                              name: "newPassword",
                              value: passwordForm.newPassword,
                              field: "new",
                            },
                            {
                              label: "Confirm New Password",
                              name: "confirmPassword",
                              value: passwordForm.confirmPassword,
                              field: "confirm",
                            },
                          ].map((field) => (
                            <div key={field.name}>
                              <label className="block text-sm font-medium text-gray-300 mb-3">
                                {field.label}
                              </label>
                              <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                  type={
                                    showPassword[field.field]
                                      ? "text"
                                      : "password"
                                  }
                                  name={field.name}
                                  value={field.value}
                                  onChange={handlePasswordChange}
                                  className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder-gray-500 transition-all"
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    togglePasswordVisibility(field.field)
                                  }
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                  {showPassword[field.field] ? (
                                    <EyeOff className="w-5 h-5" />
                                  ) : (
                                    <Eye className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-700/50">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={saving}
                            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Updating Password...
                              </>
                            ) : (
                              <>
                                <Lock className="w-5 h-5 mr-3" />
                                Update Password
                              </>
                            )}
                          </motion.button>
                        </div>
                      </form>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">
                            Security Settings
                          </h2>
                          <p className="text-gray-400">
                            Manage additional security features for your account
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-amber-300" />
                        </div>
                      </div>

                      <div className="space-y-6">
                        {[
                          {
                            title: "Two-Factor Authentication",
                            description:
                              "Add an extra layer of security to your account",
                            icon: Shield,
                            enabled: securityForm.twoFactorEnabled,
                            onChange: () =>
                              handleSecurityChange("twoFactorEnabled"),
                            color: "from-amber-500 to-orange-500",
                          },
                          {
                            title: "Email Notifications",
                            description: "Receive security alerts via email",
                            icon: Mail,
                            enabled: securityForm.emailNotifications,
                            onChange: () =>
                              handleSecurityChange("emailNotifications"),
                            color: "from-blue-500 to-cyan-500",
                          },
                          {
                            title: "SMS Notifications",
                            description: "Receive security alerts via SMS",
                            icon: Smartphone,
                            enabled: securityForm.smsNotifications,
                            onChange: () =>
                              handleSecurityChange("smsNotifications"),
                            color: "from-emerald-500 to-green-500",
                          },
                        ].map((setting, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ y: -2 }}
                            className="flex items-center justify-between p-6 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all"
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${setting.color}/20 border ${setting.color}/30 flex items-center justify-center mr-4`}
                              >
                                <setting.icon
                                  className={`w-6 h-6 ${
                                    setting.color.split(" ")[1]
                                  }`}
                                />
                              </div>
                              <div>
                                <h3 className="font-bold text-white">
                                  {setting.title}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                  {setting.description}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={setting.onChange}
                              className={`relative w-14 h-8 rounded-full transition-all ${
                                setting.enabled
                                  ? "bg-gradient-to-r from-emerald-500 to-green-400"
                                  : "bg-gray-700"
                              }`}
                            >
                              <motion.div
                                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg ${
                                  setting.enabled ? "left-7" : "left-1"
                                }`}
                                layout
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                              />
                            </button>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-8 pt-8 border-t border-gray-700/50">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSecurityUpdate}
                          disabled={saving}
                          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-xl transition-all flex items-center"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Saving Security Settings...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5 mr-3" />
                              Save Security Settings
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl p-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Notification Preferences
                        </h2>
                        <p className="text-gray-400">
                          Control how and when you receive notifications
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-purple-300" />
                      </div>
                    </div>
                    <p className="text-center text-gray-500 py-12">
                      Notification settings coming soon...
                    </p>
                  </motion.div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl p-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          Account Preferences
                        </h2>
                        <p className="text-gray-400">
                          Customize your account experience
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-cyan-300" />
                      </div>
                    </div>
                    <p className="text-center text-gray-500 py-12">
                      Preference settings coming soon...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProfileSettings;
