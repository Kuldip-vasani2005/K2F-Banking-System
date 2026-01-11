import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import OTPModal3D from "../components/AlertBox/OTPModal3D";
import Navbar from "../components/Navbar";
import FancyAlert from "../components/AlertBox/FancyAlert";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse for 3D effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  // ---------------- VALIDATION ----------------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ""))) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must accept terms & conditions";
    }

    return newErrors;
  };

  // ---------------- HANDLERS ----------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Format phone number input
    let formattedValue = value;
    if (name === "mobile") {
      // Remove all non-digits, then format
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 3) {
        formattedValue = digits;
      } else if (digits.length <= 6) {
        formattedValue = `${digits.slice(0, 3)} ${digits.slice(3)}`;
      } else {
        formattedValue = `${digits.slice(0, 3)} ${digits.slice(
          3,
          6
        )} ${digits.slice(6, 10)}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : formattedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showAlert("error", "Please fix the errors in the form.");

      // Scroll to first error
      const firstError = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.replace(/\D/g, ""),
        password: formData.password,
      };

      const res = await authAPI.signup(payload);

      if (res.data.success) {
        setUserId(res.data.userId);
        showAlert(
          "success",
          "Account created successfully! OTP sent to your email."
        );
        setTimeout(() => {
          setShowOtpModal(true);
        }, 1500);
      } else {
        showAlert("error", res.data.message || "Registration failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Network error. Please try again.";
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    showAlert("info", "Google signup will be implemented soon!");
  };

  const handleFacebookSignUp = () => {
    showAlert("info", "Facebook signup will be implemented soon!");
  };

  // Calculate 3D tilt based on mouse position
  const calculateTilt = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };

    const x = (mousePosition.x / window.innerWidth - 0.5) * 10;
    const y = (mousePosition.y / window.innerHeight - 0.5) * 10;

    return { x, y };
  };

  const tilt = calculateTilt();

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -100],
              x: [null, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Alert container */}
        <AnimatePresence>
          {alert && (
            <div className="fixed top-20 right-8 z-50">
              <FancyAlert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
                duration={3000}
                autoClose={true}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Signup Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center min-h-screen"
        >
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
              {/* Left Side - 3D Form */}
              <motion.div
                style={{
                  transform: `rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl -z-10"></div>

                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-8 md:p-12">
                  {/* Form Header */}
                  <div className="mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-block p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4"
                    >
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Create Account
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">
                      Join K2F BANK and experience modern banking
                    </p>
                  </div>

                  {/* Social Signup */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoogleSignUp}
                      className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-xl transition-all duration-300 border border-gray-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="text-sm font-medium">Google</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFacebookSignUp}
                      className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-xl transition-all duration-300 border border-gray-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="#1877F2"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span className="text-sm font-medium">Facebook</span>
                    </motion.button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                    <span className="text-gray-500 text-sm font-medium">
                      OR CONTINUE WITH
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                  </div>

                  {/* Signup Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Rahul Kumar"
                          className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border ${
                            errors.fullName
                              ? "border-red-500"
                              : "border-gray-700"
                          } rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                          required
                        />
                      </div>
                      {errors.fullName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-red-400 text-sm flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.fullName}
                        </motion.p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="rahul.kumar@email.com"
                          className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border ${
                            errors.email ? "border-red-500" : "border-gray-700"
                          } rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                          required
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-red-400 text-sm flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.email}
                        </motion.p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          placeholder="987 654 3210"
                          className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border ${
                            errors.mobile ? "border-red-500" : "border-gray-700"
                          } rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                          required
                        />
                      </div>
                      {errors.mobile && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-red-400 text-sm flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.mobile}
                        </motion.p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border ${
                            errors.password
                              ? "border-red-500"
                              : "border-gray-700"
                          } rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                          required
                        />
                      </div>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-red-400 text-sm flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.password}
                        </motion.p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border ${
                            errors.confirmPassword
                              ? "border-red-500"
                              : "border-gray-700"
                          } rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                          required
                        />
                      </div>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-red-400 text-sm flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start gap-3">
                      <div className="relative mt-1">
                        <input
                          type="checkbox"
                          id="agreeTerms"
                          name="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />

                        <label
                          htmlFor="agreeTerms"
                          className={`w-5 h-5 border-2 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200
    ${formData.agreeTerms ? "bg-blue-500 border-blue-500" : "border-gray-700"}
    ${errors.agreeTerms ? "border-red-500" : ""}
  `}
                        >
                          <svg
                            className="w-3 h-3 text-white hidden peer-checked:block"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </label>
                      </div>
                      <label className="text-gray-400 text-sm cursor-pointer">
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.agreeTerms && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.agreeTerms}
                      </motion.p>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="group relative w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <svg
                              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </>
                        )}
                      </span>
                    </motion.button>

                    {/* Login Link */}
                    <p className="text-center text-gray-500 text-sm">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Login
                      </Link>
                    </p>
                  </form>
                </div>
              </motion.div>

              {/* Right Side - 3D Visualization */}
              <motion.div
                style={{
                  transform: `rotateY(${-tilt.x}deg) rotateX(${tilt.y}deg)`,
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
                className="lg:pl-8"
              >
                <div className="relative h-full">
                  {/* 3D Card Container */}
                  <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border border-gray-800/50 p-8 md:p-12 h-full shadow-2xl">
                    {/* Background elements */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-center items-center">
                      {/* Animated 3D Pyramid */}
                      <div
                        className="relative w-64 h-64 mb-8"
                        style={{ perspective: "1000px" }}
                      >
                        <motion.div
                          animate={{ rotateY: [0, 360] }}
                          transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute inset-0"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* Pyramid faces */}
                          {[
                            {
                              icon: "🏦",
                              color: "from-blue-600/20 to-cyan-600/20",
                              border: "border-blue-500/30",
                            },
                            {
                              icon: "💳",
                              color: "from-emerald-600/20 to-green-600/20",
                              border: "border-emerald-500/30",
                            },
                            {
                              icon: "🔒",
                              color: "from-amber-600/20 to-orange-600/20",
                              border: "border-amber-500/30",
                            },
                            {
                              icon: "📈",
                              color: "from-rose-600/20 to-pink-600/20",
                              border: "border-rose-500/30",
                            },
                          ].map((face, index) => (
                            <div
                              key={index}
                              className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${face.color} backdrop-blur-sm rounded-xl border ${face.border}`}
                              style={{
                                transform: `rotateY(${
                                  index * 90
                                }deg) translateZ(100px)`,
                              }}
                            >
                              <div className="text-4xl">{face.icon}</div>
                            </div>
                          ))}
                        </motion.div>
                      </div>

                      {/* Bank Info */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-md"></div>
                            <div className="relative w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                              <span className="text-white font-bold text-xl">
                                K2F
                              </span>
                            </div>
                          </div>
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                            JOIN K2F BANK
                          </h2>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-8">
                          Join thousands of customers who trust K2F BANK for
                          secure, reliable, and modern banking solutions.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mb-8">
                          <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                              24/7
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Support
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                              ₹0
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Hidden Fees
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              100%
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Secure
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              icon: "⚡",
                              label: "Instant Setup",
                              color: "text-yellow-400",
                            },
                            {
                              icon: "🛡️",
                              label: "Bank Security",
                              color: "text-blue-400",
                            },
                            {
                              icon: "💎",
                              label: "Premium",
                              color: "text-emerald-400",
                            },
                            {
                              icon: "📊",
                              label: "Insights",
                              color: "text-purple-400",
                            },
                          ].map((feature, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              className="flex flex-col items-center p-3 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800"
                            >
                              <div className={`text-2xl mb-1 ${feature.color}`}>
                                {feature.icon}
                              </div>
                              <div className="text-xs font-medium text-gray-300">
                                {feature.label}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Testimonials */}
                        <div className="mt-8 p-4 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800">
                          <p className="text-gray-400 text-sm italic mb-2">
                            "K2F BANK transformed my banking experience. Easy,
                            secure, and modern!"
                          </p>
                          <p className="text-gray-500 text-xs">
                            - Rahul K., Customer since 2023
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="text-center text-gray-600 text-sm mt-12 pb-8">
          <p>© {new Date().getFullYear()} K2F BANK. All rights reserved.</p>
          <p className="mt-1 text-gray-500">
            Start your banking journey with confidence
          </p>
        </div>
      </div>

      {/* 3D OTP Modal */}
      {showOtpModal && (
        <OTPModal3D
          isOpen={showOtpModal}
          disableClose={false}
          onClose={() => setShowOtpModal(false)}
          onVerify={async (otpData) => {
            try {
              await authAPI.verifyOtp({
                userId: userId,
                otp: String(otpData.otp),
              });

              showAlert(
                "success",
                "Account verified successfully! Redirecting to login..."
              );
              setTimeout(() => {
                navigate("/login", {
                  state: {
                    message: "Account created successfully! Please login.",
                    type: "success",
                  },
                });
              }, 1500);
            } catch (error) {
              console.error("OTP verification failed:", error);
              showAlert("error", "Invalid OTP. Please try again.");
              throw error;
            }
          }}
          onResend={async (data) => {
            try {
              await authAPI.resendOtp({ userId: data.userId });
              showAlert("success", "OTP resent successfully!");
            } catch (error) {
              console.error("Resend OTP failed:", error);
              showAlert("error", "Failed to resend OTP. Please try again.");
              throw error;
            }
          }}
          userId={userId}
          email={formData.email}
          type="signup"
        />
      )}
    </>
  );
};

export default Signup;
