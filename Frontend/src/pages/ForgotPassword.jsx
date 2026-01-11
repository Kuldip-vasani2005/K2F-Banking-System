import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import OTPModal3D from '../components/AlertBox/OTPModal3D';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Set Password, 3: OTP
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Validate email
  const validateEmailStep = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    return newErrors;
  };

  // Validate password
  const validatePasswordStep = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    const formErrors = validateEmailStep();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    setApiError('');
    
    try {
      console.log('📤 Requesting forgot password OTP for:', formData.email);
      
      const response = await authAPI.forgotPassword({ 
        email: formData.email 
      });
      
      console.log('📥 Response:', response.data);
      
      if (response.data.success) {
        setUserId(response.data.userId);
        setStep(2);
        alert('✓ OTP sent to your email. Please check your inbox and set a new password.');
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error.response?.data || error.message);
      
      let errorMsg = error.response?.data?.message || 'Request failed';
      
      if (error.response?.status === 404) {
        errorMsg = 'No account found with this email.';
      } else if (error.response?.status === 429) {
        errorMsg = 'Too many attempts. Please wait 5 minutes.';
      }
      
      setApiError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Set password and show OTP modal
  const handleSetPasswordAndShowOtp = (e) => {
    e.preventDefault();
    
    const formErrors = validatePasswordStep();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    console.log('🔐 Ready for OTP verification. New password set.');
    setShowOtpModal(true);
  };

  // Verify OTP
  const handleOtpVerify = async (otpData) => {
    try {
      console.log('🔧 Verifying OTP with data:', {
        ...otpData,
        newPassword: formData.newPassword
      });

      const requestData = {
        userId: otpData.userId,
        otp: otpData.otp,
        newPassword: formData.newPassword
      };

      console.log('📤 Final request to backend:', requestData);

      const response = await authAPI.verifyForgotPasswordOtp(requestData);
      
      console.log('✅ OTP verification successful:', response.data);
      
      if (response.data.success) {
        alert('✓ Password reset successfully! You can now login with your new password.');
        setShowOtpModal(false);
        navigate('/login');
      }
    } catch (error) {
      console.error('❌ OTP verification failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = error.response?.data?.message || error.message;
      
      if (error.response?.status === 400) {
        if (errorMessage.includes('newPassword')) {
          errorMessage = 'Password is required. Please set a new password.';
        } else if (errorMessage.includes('Missing or invalid fields')) {
          errorMessage = 'Please check all fields are filled correctly.';
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  // Resend OTP
  const handleOtpResend = async (data) => {
    try {
      console.log('🔄 Resending OTP for userId:', data.userId);
      
      const response = await authAPI.resendForgotPasswordOtp({ 
        userId: data.userId 
      });
      
      return response;
    } catch (error) {
      console.error('❌ Resend OTP failed:', error);
      throw error;
    }
  };

  return (
    <>
    <Navbar/>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-md w-full space-y-8 bg-gray-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50 relative z-10">
          {/* Header with gradient */}
          <div className="text-center">
            <div className="inline-block p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
              </svg>
            </div>
            <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Reset Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              {step === 1 && 'Enter your email to receive OTP'}
              {step === 2 && 'Set your new password'}
            </p>
          </div>
          
          {/* Error display */}
          {apiError && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-300">{apiError}</p>
              </div>
            </div>
          )}
          
          {/* Step 1: Email Input */}
          {step === 1 && (
            <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 mt-1 appearance-none relative block w-full px-4 py-3 bg-gray-800/50 border ${
                      errors.email ? 'border-red-500' : 'border-gray-700'
                    } placeholder-gray-500 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:ring-opacity-50 transition-all duration-200`}
                    placeholder="Enter your registered email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white transition-all duration-200 ${
                    loading
                      ? 'bg-gradient-to-r from-blue-500/50 to-purple-500/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              
              <div className="text-center pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
          
          {/* Step 2: Set New Password */}
          {step === 2 && (
            <form className="mt-8 space-y-6" onSubmit={handleSetPasswordAndShowOtp}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`pl-10 mt-1 appearance-none relative block w-full px-4 py-3 bg-gray-800/50 border ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-700'
                      } placeholder-gray-500 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:ring-opacity-50 transition-all duration-200`}
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`pl-10 mt-1 appearance-none relative block w-full px-4 py-3 bg-gray-800/50 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                      } placeholder-gray-500 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:ring-opacity-50 transition-all duration-200`}
                      placeholder="Confirm new password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-200"
                >
                  <span>Verify OTP</span>
                  <svg className="ml-2 w-5 h-5 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-700 text-sm font-medium rounded-xl text-gray-300 hover:text-gray-100 hover:border-gray-600 hover:bg-gray-800/50 active:scale-[0.98] transition-all duration-200"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 3D OTP Modal */}
      {showOtpModal && (
        <OTPModal3D
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          userId={userId}
          email={formData.email}
          type="forget-password"
          newPassword={formData.newPassword}
        />
      )}
    </>
  );
};

export default ForgotPassword;