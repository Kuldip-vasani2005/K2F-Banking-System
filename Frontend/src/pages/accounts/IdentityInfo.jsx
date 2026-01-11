import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationAPI } from '../../services/api';
import OTPModal from '../../components/OTPModal';

const IdentityInfo = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    panNumber: '',
    aadhaarNumber: '',
    fatherName: '',
    annualIncome: '',
    nationality: 'Indian'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // PAN validation - backend expects 10 alphanumeric characters
    if (!formData.panNumber.trim()) {
      newErrors.panNumber = 'PAN Number is required';
    } else if (!/^[A-Za-z0-9]{10}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'PAN must be 10 alphanumeric characters';
    }
    
    // Aadhaar validation - backend expects 12 digits
    if (!formData.aadhaarNumber.trim()) {
      newErrors.aadhaarNumber = 'Aadhaar Number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar must be 12 digits';
    }
    
    // Father's name validation
    if (!formData.fatherName.trim()) {
      newErrors.fatherName = "Father's name is required";
    }
    
    // Annual income validation - backend expects string
    if (!formData.annualIncome) {
      newErrors.annualIncome = 'Annual income is required';
    }
    
    // Nationality validation
    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for PAN (uppercase)
    if (name === 'panNumber') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } 
    // Special handling for Aadhaar (only numbers)
    else if (name === 'aadhaarNumber') {
      const numbersOnly = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly.slice(0, 12)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      const firstErrorField = Object.keys(formErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }
    
    setLoading(true);
    setApiError('');
    
    try {
      // Prepare data for backend - annualIncome should be string
      const dataToSend = {
        panNumber: formData.panNumber.toUpperCase(),
        aadhaarNumber: formData.aadhaarNumber,
        fatherName: formData.fatherName.trim(),
        annualIncome: formData.annualIncome, // Send as string
        nationality: formData.nationality.trim()
      };
      
      console.log('Submitting identity info:', dataToSend);
      
      const response = await applicationAPI.updateIdentityInfo(applicationId, dataToSend);
      
      if (response.data.success) {
        setShowOtpModal(true);
      }
    } catch (err) {
      console.error('Failed to update identity info:', err);
      
      if (err.response?.data?.errors) {
        setApiError(err.response.data.errors.join(', '));
      } else if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError('Failed to update information. Please try again.');
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (otpData) => {
    try {
      const response = await applicationAPI.verifyApplicationOtp(applicationId, otpData);
      
      if (response.data.success) {
        alert('Application submitted successfully! It will be reviewed by our team.');
        navigate('/accounts');
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      throw err;
    }
  };

  const handleOtpResend = async () => {
    try {
      const response = await applicationAPI.resendApplicationOtp(applicationId);
      return response;
    } catch (err) {
      console.error('OTP resend failed:', err);
      throw err;
    }
  };

  // Income options - match backend validation
  const incomeOptions = [
    { value: '0-250000', label: '₹0 - ₹2,50,000' },
    { value: '250001-500000', label: '₹2,50,001 - ₹5,00,000' },
    { value: '500001-1000000', label: '₹5,00,001 - ₹10,00,000' },
    { value: '1000001-5000000', label: '₹10,00,001 - ₹50,00,000' },
    { value: '5000000+', label: 'Above ₹50,00,000' }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="h-1 w-24 bg-green-600"></div>
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="h-1 w-24 bg-blue-600"></div>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="h-1 w-24 bg-gray-300"></div>
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-bold">4</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className="text-green-600 font-medium">Start</span>
              <span className="text-green-600 font-medium">Personal Info</span>
              <span className="text-blue-600 font-medium">Identity Info</span>
              <span>Verification</span>
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Identity Information
                </h1>
                <p className="text-gray-600">
                  Provide your identity documents for verification
                </p>
              </div>

              {apiError && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{apiError}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* PAN Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.panNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10 characters"
                      style={{ textTransform: 'uppercase' }}
                      maxLength={10}
                    />
                    {errors.panNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.panNumber}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">10 alphanumeric characters</p>
                  </div>

                  {/* Aadhaar Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number *
                    </label>
                    <input
                      type="text"
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.aadhaarNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="12-digit number"
                      maxLength={12}
                    />
                    {errors.aadhaarNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.aadhaarNumber}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">12-digit number without spaces</p>
                  </div>

                  {/* Father's Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's Name *
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fatherName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter father's name"
                    />
                    {errors.fatherName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>
                    )}
                  </div>

                  {/* Annual Income */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Income (₹) *
                    </label>
                    <select
                      name="annualIncome"
                      value={formData.annualIncome}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.annualIncome ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Income Range</option>
                      {incomeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.annualIncome && (
                      <p className="mt-1 text-sm text-red-600">{errors.annualIncome}</p>
                    )}
                  </div>

                  {/* Nationality */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality *
                    </label>
                    <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className={`w-full md:w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.nationality ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="Indian">Indian</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.nationality && (
                      <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>
                    )}
                  </div>
                </div>

                {/* Information Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>• After submitting this form, an OTP will be sent to your registered email for verification.</p>
                        <p className="mt-1">• Make sure all information matches your official documents exactly.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 px-6 rounded-md font-medium ${
                      loading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white transition-colors`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit & Verify OTP'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate(`/accounts/open/${applicationId}/personal-info`)}
                    className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <OTPModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          email={JSON.parse(localStorage.getItem('user') || '{}').email}
          type="application-verification"
        />
      )}
    </>
  );
};

export default IdentityInfo;