import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Banknote, Search, Plus, TrendingUp, TrendingDown, 
  Calendar, Download, RefreshCw, LogOut, Users, 
  CreditCard, DollarSign, Eye, Clock, 
  CheckCircle, XCircle, AlertCircle, ChevronRight,
  Lock, Skull, Biohazard, Shield, Zap, Crosshair,
  ShieldAlert, Radar, Fingerprint, Terminal, HardDrive,
  Server, Network, Key, ShieldOff, EyeOff, FileText,
  Cpu, Activity, ShieldCheck, Target, AlertTriangle,
  Database, Wifi, WifiOff, Hash, AlarmClock,
  Bitcoin, Wallet, Coins, Receipt,Unlock
} from 'lucide-react';

const CashierDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [transactions, setTransactions] = useState([]);
  const [dangerMode, setDangerMode] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [cashVaultStatus, setCashVaultStatus] = useState('SECURE');
  const [stats, setStats] = useState({
    todayTransactions: 0,
    customersServed: 0,
    pendingTransactions: 0,
    cashBalance: 0
  });
  const [formData, setFormData] = useState({
    accountNumber: '',
    amount: '',
    atmPin: '',
    verificationCode: '',
    description: ''
  });
  const navigate = useNavigate();

  const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}');

  // Sound effects for dangerous actions
  const playSound = (soundType) => {
    // Implement sound effects for critical actions
    if (dangerMode) {
      // Play alarm sound
      console.log(`Playing ${soundType} sound effect`);
    }
  };

  // Toggle alarm
  const toggleAlarm = () => {
    setAlarmActive(!alarmActive);
    if (!alarmActive) {
      playSound('alarm');
    }
  };

  // Toggle danger mode
  const toggleDangerMode = () => {
    setDangerMode(!dangerMode);
    if (!dangerMode) {
      playSound('lockdown');
      document.body.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><rect x=\"4\" y=\"4\" width=\"24\" height=\"24\" rx=\"4\" fill=\"none\" stroke=\"%2300ff00\" stroke-width=\"2\"/><circle cx=\"16\" cy=\"16\" r=\"6\" fill=\"%2300ff00\" stroke=\"%2300ff00\" stroke-width=\"2\"/></svg>'), crosshair";
    } else {
      document.body.style.cursor = 'default';
    }
  };

  // Lock cash vault
  const lockCashVault = () => {
    setCashVaultStatus('LOCKDOWN');
    playSound('lock');
  };

  // Unlock cash vault
  const unlockCashVault = () => {
    if (window.confirm('🚨 CONFIRM VAULT UNLOCK?\nThis action is highly dangerous.')) {
      setCashVaultStatus('ACCESS GRANTED');
      playSound('unlock');
    }
  };

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    try {
      const response = await api.get('/admin/cashier/transactions/recent');
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('❌ CRITICAL: Transaction data breach:', error);
      setMessage({ text: '🚨 FINANCIAL DATA STREAM COMPROMISED', type: 'danger' });
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/cashier/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('❌ SECURITY: Stats fetch failure:', error);
    }
  };

  // Handle deposit - High security version
  const handleDeposit = async () => {
    if (!formData.accountNumber || !formData.amount) {
      setMessage({ text: '🚫 SECURITY: Account and amount required', type: 'danger' });
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setMessage({ text: '⚠️ ALERT: Invalid amount detected', type: 'danger' });
      return;
    }

    // Enhanced verification for large deposits
    if (parseFloat(formData.amount) > 10000) {
      const confirmation = window.confirm(`🚨 CRITICAL DEPOSIT ALERT\nAmount: $${formData.amount}\nRequires LEVEL 2 VERIFICATION`);
      if (!confirmation) return;
    }

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      playSound('transaction');

      const response = await api.post('/admin/cashier/deposit', {
        accountNumber: formData.accountNumber,
        amount: parseFloat(formData.amount),
        verificationCode: formData.verificationCode,
        description: formData.description || 'CRITICAL CASH DEPOSIT - SECURITY LEVEL 1'
      });

      if (response.data.success) {
        setMessage({ 
          text: `✅ FUNDS SECURED\nNew Balance: $${response.data.newBalance}`, 
          type: 'success' 
        });
        
        // Reset form and close modal
        setFormData({ accountNumber: '', amount: '', atmPin: '', verificationCode: '', description: '' });
        setShowDepositModal(false);
        
        // Refresh data
        fetchRecentTransactions();
        fetchDashboardStats();
      } else {
        setMessage({ text: '⚠️ DEPOSIT FAILED - SECURITY PROTOCOLS ENGAGED', type: 'danger' });
      }
    } catch (error) {
      console.error('❌ CRITICAL DEPOSIT ERROR:', error);
      setMessage({ 
        text: '🚨 SYSTEM BREACH - DEPOSIT FAILED', 
        type: 'danger' 
      });
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  // Handle withdrawal - High security version
  const handleWithdraw = async () => {
    if (!formData.accountNumber || !formData.amount) {
      setMessage({ text: '🚫 SECURITY: Account and amount required', type: 'danger' });
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setMessage({ text: '⚠️ ALERT: Invalid amount detected', type: 'danger' });
      return;
    }

    // Enhanced security for large withdrawals
    if (parseFloat(formData.amount) > 5000) {
      const confirmation = window.confirm(`🚨 CRITICAL WITHDRAWAL ALERT\nAmount: $${formData.amount}\nRequires BIOMETRIC VERIFICATION`);
      if (!confirmation) return;
    }

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      playSound('transaction');

      const response = await api.post('/admin/cashier/withdraw', {
        accountNumber: formData.accountNumber,
        amount: parseFloat(formData.amount),
        atmPin: formData.atmPin,
        verificationCode: formData.verificationCode,
        description: formData.description || 'CRITICAL CASH WITHDRAWAL - SECURITY LEVEL 2'
      });

      if (response.data.success) {
        setMessage({ 
          text: `✅ FUNDS RELEASED\nNew Balance: $${response.data.newBalance}`, 
          type: 'success' 
        });
        
        // Reset form and close modal
        setFormData({ accountNumber: '', amount: '', atmPin: '', verificationCode: '', description: '' });
        setShowWithdrawModal(false);
        
        // Refresh data
        fetchRecentTransactions();
        fetchDashboardStats();
      } else {
        setMessage({ text: '⚠️ WITHDRAWAL FAILED - SECURITY LOCKDOWN', type: 'danger' });
      }
    } catch (error) {
      console.error('❌ CRITICAL WITHDRAWAL ERROR:', error);
      setMessage({ 
        text: '🚨 SYSTEM BREACH - WITHDRAWAL FAILED', 
        type: 'danger' 
      });
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  // Emergency cash vault access
  const emergencyCashAccess = () => {
    const code = prompt('🚨 ENTER EMERGENCY ACCESS CODE (6-digit):');
    if (code === '000000') { // DEMO CODE ONLY - NEVER USE IN PRODUCTION
      setCashVaultStatus('EMERGENCY ACCESS GRANTED');
      playSound('emergency');
      setTimeout(() => {
        setCashVaultStatus('SECURE');
      }, 10000);
    } else {
      setMessage({ text: '🚫 INVALID EMERGENCY CODE - ALARM TRIGGERED', type: 'danger' });
      toggleAlarm();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (dangerMode || alarmActive) {
      const confirm = window.confirm('🚨 CRITICAL SYSTEM ACTIVE\nConfirm emergency logout?');
      if (!confirm) return;
    }
    
    try {
      await api.post('/admin/logout');
      sessionStorage.removeItem('adminData');
      navigate('/admin/login');
    } catch (error) {
      console.error('❌ LOGOUT FAILURE:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch(type) {
      case 'deposit': 
      case 'credit': return 'text-green-400 font-bold';
      case 'withdraw': 
      case 'debit': return 'text-red-400 font-bold';
      case 'transfer': return 'text-blue-400 font-bold';
      default: return 'text-gray-400 font-bold';
    }
  };

  // Get type display text
  const getTypeDisplay = (type) => {
    switch(type) {
      case 'deposit': return '🔒 SECURE DEPOSIT';
      case 'withdraw': return '🔓 CRITICAL WITHDRAWAL';
      case 'credit': return '💳 CREDIT';
      case 'debit': return '💸 DEBIT';
      case 'transfer': return '🔀 TRANSFER';
      default: return type.toUpperCase();
    }
  };

  // Initialize
  useEffect(() => {
    if (adminData.token && adminData.role === 'cashier') {
      fetchRecentTransactions();
      fetchDashboardStats();
    }
  }, []);

  if (!adminData.token || adminData.role !== 'cashier') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center p-8 backdrop-blur-lg bg-red-900/30 border border-red-500/50 rounded-2xl shadow-2xl">
          <div className="relative">
            <div className="p-4 bg-red-500/20 rounded-full inline-block mb-4 animate-pulse">
              <ShieldOff className="h-16 w-16 text-red-400" />
            </div>
            <div className="absolute inset-0 animate-ping opacity-20">
              <ShieldOff className="h-16 w-16 text-red-400 m-auto" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-2 tracking-wider">VAULT ACCESS DENIED</h1>
          <p className="text-gray-400 mb-6 font-mono">FINANCIAL CLEARANCE REQUIRED</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold tracking-wider transition-all hover:scale-105"
          >
            REQUEST ACCESS
          </button>
        </div>
      </div>
    );
  }

  // Enhanced Transaction Modal
  const TransactionModal = ({ type, onClose, onSubmit, loading }) => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-2xl w-full max-w-lg ${dangerMode ? 'border border-green-500/50 bg-gray-900/95' : 'border border-gray-700 bg-gray-900/90'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className={`text-xl font-bold tracking-wider ${dangerMode ? 'text-green-400' : 'text-white'}`}>
                {type === 'deposit' ? '🔐 SECURE CASH DEPOSIT' : '🚨 CRITICAL CASH WITHDRAWAL'}
              </h3>
              <p className="text-gray-400 text-sm font-mono">LEVEL 2 SECURITY REQUIRED</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg border backdrop-blur-lg ${
              message.type === 'danger' 
                ? 'bg-red-900/30 border-red-500/50 text-red-300' 
                : 'bg-green-900/30 border-green-500/50 text-green-300'
            }`}>
              <div className="flex items-center">
                {message.type === 'danger' ? 
                  <AlertTriangle className="h-5 w-5 mr-2 animate-pulse" /> : 
                  <CheckCircle className="h-5 w-5 mr-2" />
                }
                <span className="font-mono text-sm">{message.text}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                ACCOUNT NUMBER *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                  placeholder="ENTER ACCOUNT NUMBER"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                AMOUNT ($) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            {/* Verification Code Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                SECURITY CODE *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  maxLength="6"
                  value={formData.verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData({...formData, verificationCode: value});
                  }}
                  className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono tracking-widest"
                  placeholder="••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                6-DIGIT SECURITY CODE REQUIRED
              </p>
            </div>

            {/* ATM PIN Field - Only for withdrawals */}
            {type === 'withdraw' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                  BIOMETRIC VERIFICATION *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Fingerprint className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    maxLength="4"
                    value={formData.atmPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setFormData({...formData, atmPin: value});
                    }}
                    className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono tracking-widest"
                    placeholder="••••"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  BIOMETRIC PIN REQUIRED FOR CASH RELEASE
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                SECURITY DESCRIPTION
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="2"
                placeholder="ENTER SECURITY DESCRIPTION"
              />
            </div>

            {type === 'withdraw' && (
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-sm font-bold text-red-400 tracking-wider">⚠️ SECURITY ALERT</p>
                    <p className="text-xs text-red-300">
                      ALL CASH RELEASES ARE MONITORED & RECORDED. UNAUTHORIZED ACCESS WILL TRIGGER IMMEDIATE LOCKDOWN.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 font-bold disabled:opacity-50 transition-all hover:scale-105"
              disabled={loading}
            >
              ABORT
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-105 ${
                type === 'deposit' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  PROCESSING...
                </>
              ) : (
                <>
                  {type === 'deposit' ? '🔒 SECURE DEPOSIT' : '🚨 RELEASE CASH'} 
                  {formData.amount ? ` $${formData.amount}` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-300 ${dangerMode ? 'bg-gradient-to-br from-black via-green-900/20 to-black' : 'bg-gradient-to-br from-gray-900 to-black'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        {dangerMode && (
          <div className="absolute inset-0 animate-pulse">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
          </div>
        )}
        {alarmActive && (
          <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
        )}
      </div>

      {/* Header */}
      <header className={`relative ${dangerMode ? 'border-b border-green-500/50 bg-gray-900/90 backdrop-blur-lg' : 'border-b border-gray-700 bg-gray-900/80 backdrop-blur-md'} shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${dangerMode ? 'bg-green-500/20 animate-pulse' : alarmActive ? 'bg-red-500/20 animate-pulse' : 'bg-gray-800'}`}>
                <div className="relative">
                  <Banknote className={`h-8 w-8 ${dangerMode ? 'text-green-400' : alarmActive ? 'text-red-400' : 'text-green-400'}`} />
                  {dangerMode && (
                    <div className="absolute -top-1 -right-1">
                      <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h1 className={`text-3xl font-bold tracking-tight ${dangerMode ? 'text-green-400' : alarmActive ? 'text-red-400' : 'text-green-300'}`}>
                  {dangerMode ? '🚨 FINANCIAL VAULT CONTROL' : alarmActive ? '🚨 SECURITY BREACH DETECTED' : '💰 CASH VAULT OPERATIONS'}
                </h1>
                <p className="text-gray-400 font-mono text-sm">LEVEL 3 SECURITY CLEARANCE</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right mr-4 hidden sm:block">
                <p className="text-xs text-gray-400 tracking-wider">SECURITY OFFICER</p>
                <p className="font-bold text-white">{adminData.fullName}</p>
                <p className="text-xs text-green-400 font-mono tracking-wider">VAULT ACCESS GRANTED</p>
              </div>
              
              <button
                onClick={toggleAlarm}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                  alarmActive 
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {alarmActive ? <AlertTriangle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                {alarmActive ? 'ALARM ACTIVE' : 'ARM ALARM'}
              </button>
              
              <button
                onClick={toggleDangerMode}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                  dangerMode 
                    ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {dangerMode ? <Biohazard className="h-4 w-4" /> : <Radar className="h-4 w-4" />}
                {dangerMode ? 'LOCKDOWN ACTIVE' : 'HIGH ALERT'}
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex items-center gap-2 transition-all hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
                EMERGENCY EXIT
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Message */}
      {message.text && !showDepositModal && !showWithdrawModal && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-fade-in">
          <div className={`p-4 rounded-lg border backdrop-blur-lg ${
            message.type === 'danger' 
              ? 'bg-red-900/30 border-red-500/50 text-red-300 shadow-lg shadow-red-500/20' 
              : 'bg-green-900/30 border-green-500/50 text-green-300 shadow-lg shadow-green-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {message.type === 'danger' ? 
                  <AlertTriangle className="h-5 w-5 mr-2 animate-pulse" /> : 
                  <CheckCircle className="h-5 w-5 mr-2" />
                }
                <span className="font-mono text-sm tracking-wide">{message.text}</span>
              </div>
              <button onClick={() => setMessage({ text: '', type: '' })} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cash Vault Status */}
        <div className={`mb-8 p-4 rounded-xl border backdrop-blur-lg flex items-center justify-between ${
          cashVaultStatus === 'LOCKDOWN' ? 'bg-red-900/30 border-red-500/50 animate-pulse' :
          cashVaultStatus === 'EMERGENCY ACCESS GRANTED' ? 'bg-yellow-900/30 border-yellow-500/50 animate-pulse' :
          'bg-green-900/30 border-green-500/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded ${cashVaultStatus.includes('LOCKDOWN') ? 'bg-red-500/20' : cashVaultStatus.includes('EMERGENCY') ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
              {cashVaultStatus.includes('LOCKDOWN') ? <Lock className="h-6 w-6 text-red-400" /> :
               cashVaultStatus.includes('EMERGENCY') ? <Key className="h-6 w-6 text-yellow-400" /> :
               <Unlock className="h-6 w-6 text-green-400" />}
            </div>
            <div>
              <h3 className="font-bold text-white">CASH VAULT STATUS</h3>
              <p className={`text-sm font-mono ${
                cashVaultStatus.includes('LOCKDOWN') ? 'text-red-400' :
                cashVaultStatus.includes('EMERGENCY') ? 'text-yellow-400' :
                'text-green-400'
              }`}>{cashVaultStatus}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={lockCashVault}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-all hover:scale-105"
            >
              LOCK VAULT
            </button>
            <button
              onClick={unlockCashVault}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-all hover:scale-105"
            >
              UNLOCK VAULT
            </button>
            <button
              onClick={emergencyCashAccess}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-bold transition-all hover:scale-105"
            >
              EMERGENCY ACCESS
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'TODAY\'S MOVEMENT', 
              value: stats.todayTransactions, 
              icon: Banknote,
              color: 'green',
              format: 'currency'
            },
            { 
              label: 'CUSTOMERS SERVED', 
              value: stats.customersServed, 
              icon: Users,
              color: 'blue',
              format: 'number'
            },
            { 
              label: 'PENDING TRANSACTIONS', 
              value: stats.pendingTransactions, 
              icon: Clock,
              color: 'yellow',
              format: 'number'
            },
            { 
              label: 'VAULT BALANCE', 
              value: stats.cashBalance, 
              icon: HardDrive,
              color: 'purple',
              format: 'currency'
            }
          ].map((stat, index) => (
            <div 
              key={index} 
              className={`p-6 rounded-xl border backdrop-blur-lg transition-all hover:scale-[1.02] cursor-crosshair ${
                dangerMode 
                  ? `bg-${stat.color}-500/10 border-${stat.color}-500/30` 
                  : 'bg-gray-900/50 border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-3xl font-bold ${
                    stat.color === 'green' ? 'text-green-400' :
                    stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'yellow' ? 'text-yellow-400' :
                    'text-purple-400'
                  }`}>
                    {stat.format === 'currency' ? formatCurrency(stat.value) : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  stat.color === 'green' ? 'bg-green-500/20' :
                  stat.color === 'blue' ? 'bg-blue-500/20' :
                  stat.color === 'yellow' ? 'bg-yellow-500/20' :
                  'bg-purple-500/20'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'green' ? 'text-green-400' :
                    stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'yellow' ? 'text-yellow-400' :
                    'text-purple-400'
                  }`} />
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={fetchDashboardStats}
                  className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  UPDATE DATA
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quick Actions */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl border overflow-hidden backdrop-blur-lg ${dangerMode ? 'bg-gray-900/90 border-green-500/30' : 'bg-gray-900/80 border-gray-700'}`}>
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className={`text-xl font-bold tracking-wider ${dangerMode ? 'text-green-400' : 'text-green-300'}`}>
                      CRITICAL TRANSACTION COMMANDS
                    </h2>
                    <p className="text-gray-400 font-mono text-sm">VAULT ACCESS REQUIRED</p>
                  </div>
                  <button 
                    onClick={() => {
                      setFormData({ accountNumber: '', amount: '', atmPin: '', verificationCode: '', description: '' });
                      setMessage({ text: '', type: '' });
                      setShowDepositModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Plus className="h-4 w-4" />
                    NEW VAULT TRANSACTION
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Deposit Card */}
                  <button 
                    onClick={() => {
                      setFormData({ accountNumber: '', amount: '', atmPin: '', verificationCode: '', description: '' });
                      setMessage({ text: '', type: '' });
                      setShowDepositModal(true);
                    }}
                    className="p-6 border border-gray-700 rounded-xl hover:border-green-500/50 hover:bg-green-500/10 transition-all cursor-crosshair group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-lg ${dangerMode ? 'bg-green-500/30 group-hover:bg-green-500/40' : 'bg-green-500/20 group-hover:bg-green-500/30'}`}>
                        <TrendingUp className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white tracking-wide">🔒 SECURE DEPOSIT</h3>
                        <p className="text-sm text-gray-400 font-mono">VAULT INBOUND TRANSACTION</p>
                      </div>
                    </div>
                    <div className="text-green-400 font-bold flex items-center gap-1">
                      INITIATE DEPOSIT <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Withdrawal Card */}
                  <button 
                    onClick={() => {
                      setFormData({ accountNumber: '', amount: '', atmPin: '', verificationCode: '', description: '' });
                      setMessage({ text: '', type: '' });
                      setShowWithdrawModal(true);
                    }}
                    className="p-6 border border-gray-700 rounded-xl hover:border-red-500/50 hover:bg-red-500/10 transition-all cursor-crosshair group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-lg ${dangerMode ? 'bg-red-500/30 group-hover:bg-red-500/40' : 'bg-red-500/20 group-hover:bg-red-500/30'}`}>
                        <TrendingDown className="h-6 w-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white tracking-wide">🚨 CRITICAL WITHDRAWAL</h3>
                        <p className="text-sm text-gray-400 font-mono">BIOMETRIC VERIFICATION REQUIRED</p>
                      </div>
                    </div>
                    <div className="text-red-400 font-bold flex items-center gap-1">
                      INITIATE WITHDRAWAL <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Check Deposit Card */}
                  <button className="p-6 border border-gray-700 rounded-xl hover:border-blue-500/50 hover:bg-blue-500/10 transition-all cursor-crosshair group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-lg ${dangerMode ? 'bg-blue-500/30 group-hover:bg-blue-500/40' : 'bg-blue-500/20 group-hover:bg-blue-500/30'}`}>
                        <CreditCard className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white tracking-wide">💳 CHECK DEPOSIT</h3>
                        <p className="text-sm text-gray-400 font-mono">SECURE CHECK PROCESSING</p>
                      </div>
                    </div>
                    <div className="text-blue-400 font-bold flex items-center gap-1">
                      PROCESS CHECK <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>

                  {/* Account Inquiry Card */}
                  <button className="p-6 border border-gray-700 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/10 transition-all cursor-crosshair group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-lg ${dangerMode ? 'bg-purple-500/30 group-hover:bg-purple-500/40' : 'bg-purple-500/20 group-hover:bg-purple-500/30'}`}>
                        <Eye className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white tracking-wide">🔍 ACCOUNT INQUIRY</h3>
                        <p className="text-sm text-gray-400 font-mono">SECURITY AUDIT REQUIRED</p>
                      </div>
                    </div>
                    <div className="text-purple-400 font-bold flex items-center gap-1">
                      AUDIT ACCOUNT <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className={`mt-8 rounded-xl border overflow-hidden backdrop-blur-lg ${dangerMode ? 'bg-gray-900/90 border-green-500/30' : 'bg-gray-900/80 border-gray-700'}`}>
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className={`text-xl font-bold tracking-wider ${dangerMode ? 'text-green-400' : 'text-green-300'}`}>
                      REAL-TIME TRANSACTION LOG
                    </h2>
                    <p className="text-gray-400 font-mono text-sm">LIVE SECURITY MONITORING</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={fetchRecentTransactions}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 font-bold flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <RefreshCw className="h-4 w-4" />
                      REFRESH LOG
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto h-16 w-16 text-gray-500 mb-4">
                      <Receipt className="h-16 w-16" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">NO TRANSACTIONS RECORDED</h3>
                    <p className="text-gray-500 font-mono">VAULT AWAITING ACTIVITY</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className={dangerMode ? 'bg-green-500/10' : 'bg-gray-800'}>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          TRANSACTION TYPE
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          AMOUNT
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          ACCOUNT
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          SECURITY STATUS
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          TIMESTAMP
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {transactions.map((txn) => (
                        <tr key={txn._id} className="hover:bg-gray-800/50 cursor-crosshair">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`font-bold ${getTypeColor(txn.type)}`}>
                                {getTypeDisplay(txn.type)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`font-bold ${getTypeColor(txn.type)}`}>
                              {formatCurrency(txn.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white font-mono">
                              {txn.accountNumber || '🚫 ENCRYPTED'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full tracking-wider ${getStatusColor(txn.status)}`}>
                              {txn.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-400 font-mono">
                              {formatDate(txn.createdAt)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Security Control Panel */}
          <div className="space-y-8">
            {/* Security Lookup */}
            <div className={`rounded-xl border p-6 backdrop-blur-lg ${dangerMode ? 'bg-gray-900/90 border-green-500/30' : 'bg-gray-900/80 border-gray-700'}`}>
              <h3 className="font-bold text-white mb-4 tracking-wider">🔍 SECURITY AUDIT</h3>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="ENTER ACCOUNT FOR AUDIT..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 transition-all hover:scale-105">
                  <Eye className="h-4 w-4" />
                  INITIATE AUDIT
                </button>
              </div>
            </div>

            {/* Shift Security Status */}
            <div className={`rounded-xl border p-6 backdrop-blur-lg ${dangerMode ? 'bg-gray-900/90 border-yellow-500/30' : 'bg-gray-900/80 border-gray-700'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/20 rounded">
                  <AlarmClock className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-bold text-white">SECURITY SHIFT STATUS</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">SHIFT START</p>
                  <p className="font-bold text-white font-mono">
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">TRANSACTIONS PROCESSED</p>
                  <p className="font-bold text-white">{transactions.length} OPERATIONS</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">TOTAL MOVEMENT</p>
                  <p className={`text-xl font-bold ${dangerMode ? 'text-green-400' : 'text-green-300'}`}>
                    {formatCurrency(transactions.reduce((sum, txn) => sum + txn.amount, 0))}
                  </p>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-bold transition-all hover:scale-105">
                SECURE SHIFT END
              </button>
            </div>

            {/* Emergency Controls */}
            <div className={`rounded-xl border p-6 backdrop-blur-lg ${dangerMode ? 'bg-gray-900/90 border-red-500/30' : 'bg-gray-900/80 border-gray-700'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded">
                  <Skull className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="font-bold text-white">EMERGENCY CONTROLS</h3>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left p-3 hover:bg-red-500/10 rounded-lg flex items-center justify-between border border-red-500/20">
                  <span className="font-medium text-red-300">IMMEDIATE LOCKDOWN</span>
                  <ChevronRight className="h-4 w-4 text-red-400" />
                </button>
                <button className="w-full text-left p-3 hover:bg-yellow-500/10 rounded-lg flex items-center justify-between border border-yellow-500/20">
                  <span className="font-medium text-yellow-300">SILENT ALARM</span>
                  <ChevronRight className="h-4 w-4 text-yellow-400" />
                </button>
                <button className="w-full text-left p-3 hover:bg-blue-500/10 rounded-lg flex items-center justify-between border border-blue-500/20">
                  <span className="font-medium text-blue-300">AUTHORITY NOTIFICATION</span>
                  <ChevronRight className="h-4 w-4 text-blue-400" />
                </button>
                <button className="w-full text-left p-3 hover:bg-purple-500/10 rounded-lg flex items-center justify-between border border-purple-500/20">
                  <span className="font-medium text-purple-300">DATA WIPE PROTOCOL</span>
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showDepositModal && (
        <TransactionModal
          type="deposit"
          onClose={() => setShowDepositModal(false)}
          onSubmit={handleDeposit}
          loading={loading}
        />
      )}

      {showWithdrawModal && (
        <TransactionModal
          type="withdraw"
          onClose={() => setShowWithdrawModal(false)}
          onSubmit={handleWithdraw}
          loading={loading}
        />
      )}

      {/* Custom CSS for cursor and scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${dangerMode ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.5)'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${dangerMode ? 'rgba(34, 197, 94, 0.7)' : 'rgba(34, 197, 94, 0.7)'};
        }

        /* Security cursor */
        .cursor-crosshair {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="4" fill="none" stroke="%2300ff00" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="%2300ff00" stroke="%2300ff00" stroke-width="2"/></svg>'), crosshair !important;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CashierDashboard;