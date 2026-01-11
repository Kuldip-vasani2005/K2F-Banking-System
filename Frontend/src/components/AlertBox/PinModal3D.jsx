import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PinModal3D = ({ isOpen, onClose, onVerify, transferData, fromAccount }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse for 3D effect
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0].focus();
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPin(['', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  const calculateTilt = () => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    
    const x = (mousePosition.x / window.innerWidth - 0.5) * 15;
    const y = (mousePosition.y / window.innerHeight - 0.5) * 15;
    
    return { x, y };
  };

  const tilt = calculateTilt();

  const handlePinChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }

    if (newPin.every(digit => digit !== '')) {
      handleSubmit();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newPin = [...pin];
      digits.forEach((digit, index) => {
        if (index < 4) newPin[index] = digit;
      });
      setPin(newPin);
      
      const lastIndex = Math.min(digits.length - 1, 3);
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus();
      }
    }
  };

  const handleSubmit = async () => {
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    if (!/^\d{4}$/.test(pinString)) {
      setError('PIN must contain only digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onVerify(pinString);
    } catch (err) {
      setError(err.message || 'PIN verification failed');
      setPin(['', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div 
        ref={containerRef}
        className="relative w-full max-w-lg"
        style={{
          perspective: '1200px',
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            transform: `rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
          className="relative"
        >
          {/* 3D Card Container */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-8 border border-gray-700/50 relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header with 3D effect */}
            <div className="text-center mb-8 relative" style={{ transform: 'translateZ(30px)' }}>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                3D Secure Verification
              </h3>
              <p className="text-gray-400 mt-2">
                Enter your 4-digit ATM PIN to authorize transfer
              </p>
            </div>

            {/* Transfer Details */}
            <div 
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-800/50"
              style={{ transform: 'translateZ(20px)' }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Amount</div>
                  <div className="text-2xl font-bold text-green-400">
                    ₹{transferData?.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">From Account</div>
                  <div className="font-semibold text-gray-300">
                    {fromAccount?.accountNumber || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">To Account</div>
                  <div className="font-semibold text-gray-300">
                    {transferData?.toAccountNumber || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Balance</div>
                  <div className="font-semibold text-blue-400">
                    ₹{(fromAccount?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* 3D PIN Input */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="text-gray-300 font-medium mb-2">Enter 4-Digit PIN</div>
                <div className="text-sm text-gray-500">Use the PIN of your debit card linked to this account</div>
              </div>

              <div className="flex justify-center gap-4 mb-6 relative" style={{ transform: 'translateZ(40px)' }}>
                {pin.map((digit, index) => (
                  <div 
                    key={index}
                    className="relative"
                    style={{
                      transform: `translateZ(${20 * (index + 1)}px)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-md"></div>
                    <input
                      ref={el => inputRefs.current[index] = el}
                      type="password"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="relative w-16 h-16 text-center text-3xl font-bold bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                      disabled={loading}
                    />
                    {/* 3D edge effect */}
                    <div className="absolute inset-0 border-t border-blue-500/30 border-l border-blue-500/30 rounded-xl pointer-events-none"></div>
                  </div>
                ))}
              </div>

              {/* Security indicators */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>Verified</span>
                </div>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="space-y-4" style={{ transform: 'translateZ(20px)' }}>
              <button
                onClick={handleSubmit}
                disabled={loading || pin.some(digit => digit === '')}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 relative overflow-hidden ${
                  loading || pin.some(digit => digit === '')
                    ? 'bg-gradient-to-r from-blue-500/50 to-purple-500/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Authorize Transfer
                    </>
                  )}
                </span>
              </button>

              <button
                onClick={onClose}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-medium border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/50 hover:border-gray-600 active:scale-[0.98] transition-all duration-200"
              >
                Cancel
              </button>
            </div>

            {/* Security info */}
            <div className="mt-8 pt-6 border-t border-gray-800/50" style={{ transform: 'translateZ(10px)' }}>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-400">
                    Your PIN is encrypted and never stored. Maximum 3 attempts allowed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating 3D elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
        </motion.div>

        {/* Add shimmer animation */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PinModal3D;