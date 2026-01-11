import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bankAccountAPI } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import FancyAlert from "../../components/AlertBox/FancyAlert";
import PinModal3D from "../../components/AlertBox/PinModal3D";

const TransferMoney = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    fromAccountId: "",
    toAccountNumber: "",
    amount: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [transferData, setTransferData] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse for 3D effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  const fetchAccounts = async () => {
    try {
      const response = await bankAccountAPI.getMyAccounts();
      if (response.data.success && response.data.accounts.length > 0) {
        setAccounts(response.data.accounts);
        setFormData((prev) => ({
          ...prev,
          fromAccountId: response.data.accounts[0]._id,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      showAlert('error', 'Failed to load accounts. Please refresh.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fromAccountId)
      newErrors.fromAccountId = "Please select source account";
    if (!formData.toAccountNumber.trim())
      newErrors.toAccountNumber = "Recipient account number is required";
    else if (!/^[A-Z]{4}\d{12}$/.test(formData.toAccountNumber.trim()))
      newErrors.toAccountNumber =
        "Account number must start with 4 letters followed by 12 digits";

    if (!formData.amount) newErrors.amount = "Amount is required";
    else if (parseFloat(formData.amount) <= 0)
      newErrors.amount = "Amount must be greater than 0";
    else if (parseFloat(formData.amount) < 100)
      newErrors.amount = "Minimum amount is ₹100";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      showAlert('error', 'Please fix the form errors before proceeding.');
      return;
    }

    // Check balance before proceeding
    const selectedAccount = accounts.find(
      (acc) => acc._id === formData.fromAccountId
    );

    if (
      selectedAccount &&
      parseFloat(formData.amount) > selectedAccount.balance
    ) {
      setErrors({ amount: "Insufficient balance in selected account" });
      showAlert('error', 'Insufficient balance in selected account.');
      return;
    }

    // Prepare transfer data
    const data = {
      fromAccountId: String(formData.fromAccountId).trim(),
      toAccountNumber: String(formData.toAccountNumber).trim(),
      amount: parseFloat(formData.amount),
    };

    // Validate all required fields
    const missingFields = [];
    if (!data.fromAccountId) missingFields.push("fromAccountId");
    if (!data.toAccountNumber) missingFields.push("toAccountNumber");
    if (!data.amount || isNaN(data.amount)) missingFields.push("amount");

    if (missingFields.length > 0) {
      showAlert('error', `Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    setTransferData(data);
    setShowPinModal(true);
    showAlert('info', 'Enter your 4-digit PIN to authorize the transfer.');
  };

  const handlePinSubmit = async (pin) => {
    if (!transferData) {
      showAlert('error', 'Transfer data is missing. Please fill the form again.');
      setShowPinModal(false);
      return;
    }

    const missingFields = [];
    if (!transferData.fromAccountId) missingFields.push("fromAccountId");
    if (!transferData.toAccountNumber) missingFields.push("toAccountNumber");
    if (!transferData.amount || isNaN(transferData.amount))
      missingFields.push("amount");

    if (missingFields.length > 0) {
      showAlert('error', `Transfer data incomplete: ${missingFields.join(", ")}`);
      setShowPinModal(false);
      return;
    }

    setLoading(true);

    try {
      const transferRequestData = {
        fromAccountId: String(transferData.fromAccountId).trim(),
        toAccountNumber: String(transferData.toAccountNumber).trim(),
        amount: parseFloat(transferData.amount),
        atmPin: String(pin).trim(),
      };

      const response = await bankAccountAPI.transferMoney(transferRequestData);

      if (response.data.success) {
        const newBalance = response.data.fromAccountBalance || 0;
        
        showAlert('success', 
          `Transfer successful! Transaction ID: ${response.data.transactionId}. 
          New balance: ₹${newBalance.toLocaleString("en-IN")}`
        );

        // Reset form but keep the same source account selected
        setFormData((prev) => ({
          ...prev,
          toAccountNumber: "",
          amount: "",
          remarks: "",
        }));

        // Close modal
        setShowPinModal(false);

        // Refresh accounts
        await fetchAccounts();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Transfer failed. Please try again.";

      // Handle different error scenarios
      if (errorMsg.includes("Invalid PIN") || errorMsg.includes("wrong PIN")) {
        const attemptsLeft = errorMsg.match(/\d+/)?.[0] || "";
        showAlert('error', 
          `Invalid PIN. ${attemptsLeft ? `${attemptsLeft} attempt(s) left before card is blocked.` : "Please try again."}`
        );
      } else if (errorMsg.includes("PIN not set")) {
        showAlert('error', "Card PIN not set. Please set your card PIN first in the Cards section.");
      } else if (errorMsg.includes("No debit card found")) {
        showAlert('error', "No debit card found for this account. Please get a card first.");
      } else if (errorMsg.includes("card is blocked")) {
        showAlert('error', "Your card is blocked. Please unblock it first.");
      } else if (errorMsg.includes("Too many wrong PIN attempts")) {
        showAlert('error', "Too many wrong PIN attempts. Card has been blocked for security. Please unblock it first.");
      } else if (errorMsg.includes("Minimum transfer amount")) {
        showAlert('error', "Minimum transfer amount is ₹100");
        setErrors((prev) => ({
          ...prev,
          amount: "Minimum transfer amount is ₹100",
        }));
      } else if (errorMsg.includes("Insufficient balance")) {
        showAlert('error', "Insufficient balance in the selected account");
        setErrors((prev) => ({ ...prev, amount: "Insufficient balance" }));
      } else if (
        err.response?.status === 400 &&
        errorMsg.includes("required")
      ) {
        showAlert('error', `Validation error: ${errorMsg}. Please check all fields are filled.`);
      } else {
        showAlert('error', `Error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate 3D tilt based on mouse position
  const calculateTilt = () => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    
    const x = (mousePosition.x / window.innerWidth - 0.5) * 5;
    const y = (mousePosition.y / window.innerHeight - 0.5) * 5;
    
    return { x, y };
  };

  const tilt = calculateTilt();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
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
              ease: "linear"
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

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-4 py-12"
        >
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-6"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0   -18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                Transfer Money
              </h1>
              <p className="text-gray-400 text-lg">
                Secure money transfer with 3D verification
              </p>
            </div>

            {/* Main Form Card with 3D Effect */}
            <motion.div
              style={{
                transform: `rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
              className="relative mb-12"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl -z-10"></div>
              
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* From Account */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-3">
                      From Account *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <select
                        name="fromAccountId"
                        value={formData.fromAccountId}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border ${
                          errors.fromAccountId ? "border-red-500" : "border-gray-700"
                        } rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none`}
                      >
                        <option value="" className="bg-gray-900">Select Account</option>
                        {accounts.map((account) => (
                          <option key={account._id} value={account._id} className="bg-gray-900">
                            {account.accountNumber} - {formatCurrency(account.balance)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.fromAccountId && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {errors.fromAccountId}
                      </p>
                    )}
                    {formData.fromAccountId && (
                      <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Requires a debit card with PIN set for this account</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* To Account */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-3">
                      To Account Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="toAccountNumber"
                        value={formData.toAccountNumber}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border ${
                          errors.toAccountNumber ? "border-red-500" : "border-gray-700"
                        } rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter recipient's account number (ABCD12345678901)"
                      />
                    </div>
                    {errors.toAccountNumber && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {errors.toAccountNumber}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-3">
                      Amount (₹) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border ${
                          errors.amount ? "border-red-500" : "border-gray-700"
                        } rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder="0.00"
                        step="0.01"
                        min="100"
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {errors.amount}
                      </p>
                    )}
                    {formData.fromAccountId && formData.amount && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-700/30">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Available Balance:</span>
                          <span className="font-bold text-green-400">
                            {formatCurrency(
                              accounts.find((acc) => acc._id === formData.fromAccountId)?.balance || 0
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Minimum amount: ₹100
                    </p>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-3">
                      Remarks (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        rows="3"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Add a note for this transfer (for your reference only)"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Note: Remarks are for your reference only and won't be saved with the transaction
                    </p>
                  </div>

                  {/* Security Information */}
                  <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.667-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-amber-300 mb-2">
                          Important Security Requirements
                        </h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2 text-sm text-amber-200">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            You must have a debit card for the source account
                          </li>
                          <li className="flex items-center gap-2 text-sm text-amber-200">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            Card PIN must be set before transferring
                          </li>
                          <li className="flex items-center gap-2 text-sm text-amber-200">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            Minimum transfer amount: ₹100
                          </li>
                          <li className="flex items-center gap-2 text-sm text-amber-200">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            Maximum 3 wrong PIN attempts before card gets blocked
                          </li>
                          <li className="flex items-center gap-2 text-sm text-amber-200">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            Enter your 4-digit debit card PIN to authorize transfer
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <motion.button
                      type="button"
                      onClick={() => navigate("/accounts")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 border border-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-800/50 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Accounts
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative flex-1 px-6 py-3 font-medium rounded-xl transition-all duration-200 ${
                        loading
                          ? 'bg-gradient-to-r from-blue-500/50 to-purple-500/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25'
                      } text-white`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Validating...
                          </>
                        ) : (
                          <>
                            Proceed to 3D PIN Verification
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Transaction Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-700/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">₹100</div>
                  <div className="text-sm text-gray-400">Minimum Transfer</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-700/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">3</div>
                  <div className="text-sm text-gray-400">Max PIN Attempts</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-700/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">24/7</div>
                  <div className="text-sm text-gray-400">Transfer Support</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="text-center text-gray-600 text-sm pb-8">
          <p>© {new Date().getFullYear()} K2F BANK. All rights reserved.</p>
          <p className="mt-1 text-gray-500">Secure banking with 3D verification</p>
        </div>
      </div>

      {/* 3D PIN Modal */}
      {showPinModal && (
        <PinModal3D
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onVerify={handlePinSubmit}
          transferData={transferData}
          fromAccount={accounts.find(acc => acc._id === transferData?.fromAccountId)}
        />
      )}
    </>
  );
};

export default TransferMoney;