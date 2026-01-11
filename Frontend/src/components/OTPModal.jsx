import React, { useState, useEffect, useRef } from 'react';

const OTPModal = ({ 
  isOpen,  
  onClose = () => {},
  onVerify, 
  onResend, 
  email 
}) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  // Handle the countdown timer
  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Move to next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onVerify(otpValue);
      setSuccess('Verified successfully!');
      setTimeout(() => {
        resetAndClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await onResend();
      setSuccess('New code sent!');
      setTimer(60); // Reset timer
      setOtp(new Array(6).fill(""));
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setOtp(new Array(6).fill(""));
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Security Code</h3>
          <p className="text-sm text-gray-500 mt-2">
            We sent a 6-digit code to <br/>
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        {/* Status Messages */}
        {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded mb-4 text-center">{error}</p>}
        {success && <p className="text-sm text-green-500 bg-green-50 p-2 rounded mb-4 text-center">{success}</p>}

        {/* Split Input Group */}
        <div className="flex justify-between gap-2 mb-8">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 border-2 rounded-xl text-center text-xl font-bold border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || otp.includes("")}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-all mb-4"
        >
          {loading ? 'Processing...' : 'Verify Now'}
        </button>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={timer > 0 || loading}
            className={`text-sm font-medium ${timer > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
          >
            {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive code? Resend"}
          </button>
        </div>

        <button onClick={resetAndClose} className="w-full mt-6 text-sm text-gray-400 hover:text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OTPModal;