import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import Navbar from "../components/Navbar";
import FancyAlert from "../components/AlertBox/FancyAlert";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      if (response.data.success) {
        sessionStorage.setItem(
          "token",
          response.data.user.token || "dummy-token"
        );
        sessionStorage.setItem("user", JSON.stringify(response.data.user));

        showAlert("success", "Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your credentials.";
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    showAlert("info", "Google login will be implemented soon!");
  };

  const handleFacebookLogin = () => {
    showAlert("info", "Facebook login will be implemented soon!");
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

        {/* Login Container */}
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
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Welcome Back
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">
                      Secure access to your K2F BANK account
                    </p>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoogleLogin}
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
                      onClick={handleFacebookLogin}
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

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
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
                          placeholder="you@example.com"
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

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-gray-300 text-sm font-medium">
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          Forgot Password?
                        </Link>
                      </div>
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
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`w-full pl-10 pr-12 py-3 bg-gray-800/50 border ${
                            errors.password
                              ? "border-red-500"
                              : "border-gray-700"
                          } rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          )}
                        </button>
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

                    {/* Remember Me */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="remember"
                          className="peer hidden"
                        />
                        <label
                          htmlFor="remember"
                          className="w-5 h-5 border-2 border-gray-700 rounded-md flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all duration-200 cursor-pointer"
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
                      <label
                        htmlFor="remember"
                        className="text-gray-400 text-sm cursor-pointer"
                      >
                        Remember me for 30 days
                      </label>
                    </div>

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
                            Signing In...
                          </>
                        ) : (
                          <>
                            Sign In
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

                    {/* Sign Up Link */}
                    <p className="text-center text-gray-500 text-sm">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Create Account
                      </Link>
                    </p>

                    {/* Demo Info */}
                    <div className="pt-6 border-t border-gray-800/50">
                      <p className="text-center text-xs text-gray-500 mb-3">
                        For demo purposes:
                      </p>
                      <div className="text-xs text-gray-400 bg-gray-900/50 p-4 rounded-xl backdrop-blur-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-400">
                              Email:
                            </span>
                            <span className="font-mono">demo@k2fbank.com</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-400">
                              Password:
                            </span>
                            <span className="font-mono">demo123</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
                      {/* Animated 3D Cube */}
                      <div
                        className="relative w-64 h-64 mb-8"
                        style={{ perspective: "1000px" }}
                      >
                        <motion.div
                          animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute inset-0"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          {/* Front face */}
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-blue-500/30"
                            style={{ transform: "translateZ(100px)" }}
                          >
                            <div className="text-4xl">🏦</div>
                          </div>
                          {/* Back face */}
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl border border-emerald-500/30"
                            style={{
                              transform: "rotateY(180deg) translateZ(100px)",
                            }}
                          >
                            <div className="text-4xl">💳</div>
                          </div>
                          {/* Left face */}
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl border border-amber-500/30"
                            style={{
                              transform: "rotateY(-90deg) translateZ(100px)",
                            }}
                          >
                            <div className="text-4xl">🔒</div>
                          </div>
                          {/* Right face */}
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl border border-rose-500/30"
                            style={{
                              transform: "rotateY(90deg) translateZ(100px)",
                            }}
                          >
                            <div className="text-4xl">📱</div>
                          </div>
                          {/* Top face */}
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-600/20 to-indigo-600/20 backdrop-blur-sm rounded-2xl border border-violet-500/30"
                            style={{
                              transform: "rotateX(90deg) translateZ(100px)",
                            }}
                          >
                            <div className="text-4xl">⚡</div>
                          </div>
                          {/* Bottom face */}
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl border border-cyan-500/30"
                            style={{
                              transform: "rotateX(-90deg) translateZ(100px)",
                            }}
                          >
                            <div className="text-4xl">💎</div>
                          </div>
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
                            K2F BANK
                          </h2>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-8">
                          Experience next-generation banking with cutting-edge
                          security and innovative financial solutions.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mb-8">
                          <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                              10K+
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Users
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                              ₹500Cr+
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Volume
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              99.9%
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
                              label: "Instant",
                              color: "text-yellow-400",
                            },
                            {
                              icon: "🛡️",
                              label: "Secure",
                              color: "text-blue-400",
                            },
                            {
                              icon: "🌐",
                              label: "Global",
                              color: "text-emerald-400",
                            },
                            {
                              icon: "📊",
                              label: "Analytics",
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
            Secure banking for the digital age
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
