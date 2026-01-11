import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { applicationAPI } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Building,
  Shield,
  CheckCircle,
  X,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Clock,
  FileText,
  User,
  Smartphone,
  Home,
  Briefcase,
  Star,
  ArrowLeft,
  Percent,
  CreditCard,
  Globe,
  Award,
} from "lucide-react";

const OpenAccount = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartApplication = async () => {
    if (!accountType) {
      setError("Please select an account type");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await applicationAPI.startApplication({
        accountType,
      });

      if (response.data.success) {
        navigate(`/accounts/open/${response.data.applicationId}/personal-info`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start application");
    } finally {
      setLoading(false);
    }
  };

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

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -4 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden">
      {/* Animated Background Elements */}
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
          className="mb-12"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-gray-400 hover:text-cyan-300 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30 mb-4"
              >
                <Sparkles className="w-4 h-4 text-cyan-300 mr-2" />
                <span className="text-sm font-medium text-cyan-300">
                  Quick Start • 5-10 min
                </span>
              </motion.div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Open Your Digital Account
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Experience modern banking with zero paperwork. Get started in
                minutes with our fully digital process.
              </p>
            </div>

            <div className="mt-6 lg:mt-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full" />
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400 font-bold">2</span>
                </div>
                <div className="w-24 h-1 bg-gray-700 rounded-full" />
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400 font-bold">3</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column - Account Selection */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl overflow-hidden">
              <div className="p-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6"
                  >
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mr-4">
                        <X className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-300 mb-1">
                          Action Required
                        </h3>
                        <p className="text-red-200">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <h2 className="text-2xl font-bold text-white mb-6">
                  Choose Your Perfect Account
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Savings Account */}
                  <motion.div
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    className={`relative rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
                      accountType === "saving"
                        ? "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500 shadow-xl"
                        : "bg-gray-800/50 border-2 border-gray-700 hover:border-blue-400/50 shadow-lg"
                    }`}
                    onClick={() => setAccountType("saving")}
                  >
                    {accountType === "saving" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg"
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                    )}

                    <div className="flex items-start mb-6">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-4 ${
                          accountType === "saving"
                            ? "bg-gradient-to-br from-blue-500 to-cyan-400"
                            : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
                        }`}
                      >
                        <Wallet
                          className={`w-8 h-8 ${
                            accountType === "saving"
                              ? "text-white"
                              : "text-cyan-300"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Savings Account
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Perfect for everyday banking
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mr-3">
                          <Percent className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-gray-300">
                          3.5% p.a. interest rate
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mr-3">
                          <Zap className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-gray-300">
                          20 free transactions/month
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mr-3">
                          <Shield className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-gray-300">
                          Zero minimum balance
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Most Popular
                        </span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Current Account */}
                  <motion.div
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    className={`relative rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
                      accountType === "current"
                        ? "bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-2 border-purple-500 shadow-xl"
                        : "bg-gray-800/50 border-2 border-gray-700 hover:border-purple-400/50 shadow-lg"
                    }`}
                    onClick={() => setAccountType("current")}
                  >
                    {accountType === "current" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 flex items-center justify-center shadow-lg"
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                    )}

                    <div className="flex items-start mb-6">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-4 ${
                          accountType === "current"
                            ? "bg-gradient-to-br from-purple-500 to-indigo-400"
                            : "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"
                        }`}
                      >
                        <Building
                          className={`w-8 h-8 ${
                            accountType === "current"
                              ? "text-white"
                              : "text-purple-300"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Current Account
                        </h3>
                        <p className="text-gray-400 text-sm">
                          For business & professionals
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mr-3">
                          <Target className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-gray-300">
                          ₹50,000 overdraft facility
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mr-3">
                          <Zap className="w-4 h-4 text-orange-400" />
                        </div>
                        <span className="text-gray-300">
                          Unlimited transactions
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mr-3">
                          <Award className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="text-gray-300">
                          Priority customer support
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-700">
                      <div className="flex items-center text-sm text-amber-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Min. balance: ₹10,000 required</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {accountType && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-white text-lg">
                            Ready to proceed with{" "}
                            <span className="text-cyan-300">
                              {accountType === "saving"
                                ? "Savings Account"
                                : "Current Account"}
                            </span>
                          </h3>
                          <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-full shadow-lg">
                            {accountType === "saving"
                              ? "3.5% Interest"
                              : "₹50K Overdraft"}
                          </div>
                        </div>
                        <p className="text-gray-300 mb-6">
                          You've selected the perfect account for your{" "}
                          <span className="text-white">
                            {accountType === "saving"
                              ? "personal banking needs"
                              : "business requirements"}
                          </span>
                          . Let's get started with the quick digital application.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStartApplication}
                            disabled={loading}
                            className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg ${
                              loading
                                ? "bg-gradient-to-r from-blue-500/50 to-cyan-500/50 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-xl hover:shadow-2xl"
                            } text-white transition-all group`}
                          >
                            {loading ? (
                              <span className="flex items-center justify-center">
                                <svg
                                  className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Starting Application...
                              </span>
                            ) : (
                              <span className="flex items-center justify-center">
                                Start Digital Application
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                              </span>
                            )}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setAccountType(null)}
                            className="px-8 py-4 border-2 border-gray-600 text-gray-300 font-medium rounded-xl hover:bg-gray-700/50 hover:border-gray-500 hover:text-white transition-colors"
                          >
                            Change Selection
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Info Panel */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Requirements Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">What You'll Need</h3>
                  <p className="text-sm text-gray-400">Prepare these documents</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Government ID Proof</p>
                    <p className="text-sm text-gray-400">
                      Aadhaar, PAN, or Passport
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mr-3">
                    <Home className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Address Proof</p>
                    <p className="text-sm text-gray-400">
                      Utility bill or rental agreement
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mr-3">
                    <Smartphone className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Mobile Number</p>
                    <p className="text-sm text-gray-400">
                      For OTP verification
                    </p>
                  </div>
                </div>

                {accountType === "current" && (
                  <div className="flex items-start p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mr-3">
                      <Briefcase className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Business Proof</p>
                      <p className="text-sm text-gray-400">
                        GST certificate or trade license
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Process Timeline */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl p-8">
              <h3 className="font-bold text-white mb-6">Application Process</h3>
              
              <div className="space-y-6">
                {[
                  { step: 1, title: "Account Selection", status: "current" },
                  { step: 2, title: "Personal Information", status: "upcoming" },
                  { step: 3, title: "Identity Verification", status: "upcoming" },
                  { step: 4, title: "Final Review", status: "upcoming" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      item.status === "current"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg"
                        : "bg-gray-800 border border-gray-700 text-gray-400"
                    }`}>
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        item.status === "current" ? "text-white" : "text-gray-400"
                      }`}>
                        {item.title}
                      </p>
                    </div>
                    {item.status === "current" && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-3 h-3 rounded-full bg-emerald-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative">
                <h3 className="font-bold text-xl mb-4 text-white">Why Choose Digital Bank?</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-white" />
                    <span className="text-white">100% Digital Process</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-white" />
                    <span className="text-white">Instant Account Number</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-white" />
                    <span className="text-white">24/7 Customer Support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-white" />
                    <span className="text-white">Military-Grade Security</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mr-4">
                  <Globe className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Quick Stats</h3>
                  <p className="text-sm text-gray-400">Bank with confidence</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400">Avg. Setup Time</p>
                  <p className="text-lg font-bold text-white">8 minutes</p>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400">Customer Rating</p>
                  <p className="text-lg font-bold text-white">4.8/5</p>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400">Active Users</p>
                  <p className="text-lg font-bold text-white">500K+</p>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400">Success Rate</p>
                  <p className="text-lg font-bold text-white">99.8%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center border-t border-gray-700/50 pt-8"
        >
          <p className="text-gray-500 text-sm">
            By proceeding, you agree to our{" "}
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Privacy Policy
            </button>
            . Your information is securely encrypted.
          </p>
          <div className="flex items-center justify-center mt-4 space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-emerald-400" />
              256-bit encryption
            </span>
            <span className="flex items-center">
              <Award className="w-4 h-4 mr-2 text-amber-400" />
              ISO 27001 Certified
            </span>
            <span className="flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-blue-400" />
              Member FDIC
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OpenAccount;