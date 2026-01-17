import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  CreditCard, Plus, Search, Filter, CheckCircle, 
  XCircle, Clock, MoreVertical, Download, Edit, 
  Trash2, RefreshCw, AlertCircle, LogOut, User,
  Eye, ChevronRight, Mail, Phone, DollarSign,
  Check, X, FileText, Shield, Skull, Biohazard,
  Lock, Unlock, Fingerprint, Database, ShieldAlert,
  Radar, Crosshair, Zap, Cpu, Key, Wifi, WifiOff,
  ShieldOff, EyeOff, Terminal, Hash, Server, Network,
  HardDrive, Activity, ShieldCheck, AlarmClock
} from 'lucide-react';

const CardManagerDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequestDetails, setShowRequestDetails] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [dangerMode, setDangerMode] = useState(false);
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    pendingRequests: 0,
    blockedCards: 0
  });
  const navigate = useNavigate();

  const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}');

  // Fetch pending card requests
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/card-manager/requests/pending');
      if (response.data.success) {
        setPendingRequests(response.data.pending);
        setStats(prev => ({ ...prev, pendingRequests: response.data.pending.length }));
      }
    } catch (error) {
      console.error('⚠️ SECURITY BREACH IN REQUEST FETCH:', error);
      setMessage({ text: '🚨 DATA STREAM COMPROMISED', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/card-manager/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('❌ STATS FETCH FAILURE:', error);
    }
  };

  // Approve card request
  const handleApproveRequest = async (requestId) => {
    if (!window.confirm('🚨 CONFIRM CARD ISSUANCE\nGrant financial access to this entity?')) return;

    try {
      setActionLoading(true);
      const response = await api.post(`/admin/card-manager/${requestId}/approve`);
      
      if (response.data.success) {
        setMessage({ 
          text: `✅ CARD ISSUED - ACCESS GRANTED\nCard: ${response.data.cardNumber}`, 
          type: 'success' 
        });
        fetchPendingRequests();
        fetchStats();
        setShowRequestDetails(null);
      }
    } catch (error) {
      setMessage({ 
        text: '⚠️ ISSUANCE FAILED - SECURITY LOCKDOWN', 
        type: 'danger' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Reject card request
  const handleRejectRequest = async (requestId) => {
    const reason = prompt('🚨 ENTER TERMINATION REASON (This will be logged):');
    if (!reason) return;

    try {
      setActionLoading(true);
      const response = await api.post(`/admin/card-manager/requests/${requestId}/reject`);
      
      if (response.data.success) {
        setMessage({ text: '❌ REQUEST TERMINATED - LOGGED', type: 'danger' });
        fetchPendingRequests();
        fetchStats();
        setShowRequestDetails(null);
      }
    } catch (error) {
      setMessage({ 
        text: '⚡ TERMINATION FAILED - SYSTEM ERROR', 
        type: 'danger' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle danger mode
  const toggleDangerMode = () => {
    setDangerMode(!dangerMode);
    if (!dangerMode) {
      document.body.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><path d=\"M16,2 L30,16 L16,30 L2,16 Z\" fill=\"none\" stroke=\"%23ff0000\" stroke-width=\"2\"/><path d=\"M8,8 L24,24 M8,24 L24,8\" stroke=\"%23ff0000\" stroke-width=\"2\"/></svg>'), crosshair";
    } else {
      document.body.style.cursor = 'default';
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
      sessionStorage.removeItem('adminData');
      navigate('/admin/login');
    } catch (error) {
      console.error('❌ LOGOUT FAILURE:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Initialize
  useEffect(() => {
    if (adminData.token && adminData.role === 'cardManager') {
      fetchPendingRequests();
      fetchStats();
    }
  }, []);

  if (!adminData.token || adminData.role !== 'cardManager') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center p-8 backdrop-blur-lg bg-gray-900/50 border border-red-500/30 rounded-2xl shadow-2xl">
          <div className="relative">
            <div className="p-4 bg-red-500/20 rounded-full inline-block mb-4 animate-pulse">
              <ShieldOff className="h-16 w-16 text-red-400" />
            </div>
            <div className="absolute inset-0 animate-ping opacity-20">
              <ShieldOff className="h-16 w-16 text-red-400 m-auto" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-2 tracking-wider">ACCESS TERMINATED</h1>
          <p className="text-gray-400 mb-6 font-mono">SECURITY CLEARANCE DENIED</p>
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

  return (
    <div className={`min-h-screen transition-all duration-300 ${dangerMode ? 'bg-gradient-to-br from-black via-gray-900 to-black' : 'bg-gradient-to-br from-gray-900 to-black'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        {dangerMode && (
          <div className="absolute inset-0 animate-pulse">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
        )}
      </div>

      {/* Header */}
      <header className={`relative ${dangerMode ? 'border-b border-purple-500/50 bg-gray-900/90 backdrop-blur-lg' : 'border-b border-gray-700 bg-gray-900/80 backdrop-blur-md'} shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${dangerMode ? 'bg-purple-500/20 animate-pulse' : 'bg-gray-800'}`}>
                <div className="relative">
                  <CreditCard className="h-8 w-8 text-purple-400" />
                  {dangerMode && (
                    <div className="absolute -top-1 -right-1">
                      <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h1 className={`text-3xl font-bold tracking-tight ${dangerMode ? 'text-purple-400' : 'text-purple-300'}`}>
                  {dangerMode ? '🚨 FINANCIAL SECURITY COMMAND' : '💳 CARD SECURITY SYSTEM'}
                </h1>
                <p className="text-gray-400 font-mono text-sm">CRITICAL FINANCIAL INFRASTRUCTURE</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right mr-4">
                <p className="text-xs text-gray-400 tracking-wider">SECURITY OFFICER</p>
                <p className="font-bold text-white">{adminData.fullName}</p>
                <p className="text-xs text-purple-400 font-mono tracking-wider">LEVEL 3 CLEARANCE</p>
              </div>
              
              <button
                onClick={toggleDangerMode}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                  dangerMode 
                    ? 'bg-purple-600 text-white hover:bg-purple-700 animate-pulse' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {dangerMode ? <Biohazard className="h-4 w-4" /> : <Radar className="h-4 w-4" />}
                {dangerMode ? 'LOCKDOWN ACTIVE' : 'THREAT MODE'}
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex items-center gap-2 transition-all hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
                TERMINATE SESSION
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Alert Message */}
      {message.text && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-fade-in">
          <div className={`p-4 rounded-lg border backdrop-blur-lg ${
            message.type === 'danger' 
              ? 'bg-red-900/30 border-red-500/50 text-red-300 shadow-lg shadow-red-500/20' 
              : 'bg-green-900/30 border-green-500/50 text-green-300 shadow-lg shadow-green-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {message.type === 'danger' ? 
                  <AlertCircle className="h-5 w-5 mr-2 animate-pulse" /> : 
                  <CheckCircle className="h-5 w-5 mr-2" />
                }
                <span className="font-mono text-sm tracking-wide">{message.text}</span>
              </div>
              <button 
                onClick={() => setMessage({ text: '', type: '' })}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'TOTAL CARDS', 
              value: stats.totalCards, 
              icon: HardDrive,
              color: 'purple',
              desc: 'ACTIVE IN NETWORK'
            },
            { 
              label: 'ACTIVE CARDS', 
              value: stats.activeCards, 
              icon: Activity,
              color: 'green',
              desc: 'TRANSMITTING DATA'
            },
            { 
              label: 'PENDING REQUESTS', 
              value: stats.pendingRequests, 
              icon: AlarmClock,
              color: 'yellow',
              desc: 'AWAITING AUTHORIZATION'
            },
            { 
              label: 'BLOCKED CARDS', 
              value: stats.blockedCards, 
              icon: ShieldOff,
              color: 'red',
              desc: 'SECURITY LOCKDOWN'
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
                    stat.color === 'purple' ? 'text-purple-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    stat.color === 'yellow' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  stat.color === 'purple' ? 'bg-purple-500/20' :
                  stat.color === 'green' ? 'bg-green-500/20' :
                  stat.color === 'yellow' ? 'bg-yellow-500/20' :
                  'bg-red-500/20'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'purple' ? 'text-purple-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    stat.color === 'yellow' ? 'text-yellow-400' :
                    'text-red-400'
                  }`} />
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={fetchStats}
                  className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  REFRESH DATA
                </button>
                <p className={`text-xs mt-2 ${
                  stat.color === 'purple' ? 'text-purple-300/70' :
                  stat.color === 'green' ? 'text-green-300/70' :
                  stat.color === 'yellow' ? 'text-yellow-300/70' :
                  'text-red-300/70'
                }`}>
                  {stat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Requests Table */}
        <div className={`rounded-xl border overflow-hidden backdrop-blur-lg ${dangerMode ? 'bg-gray-900/90 border-purple-500/30' : 'bg-gray-900/80 border-gray-700'}`}>
          <div className="p-6 border-b border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl font-bold tracking-wider ${dangerMode ? 'text-purple-400' : 'text-purple-300'}`}>
                  PENDING ACCESS REQUESTS
                </h2>
                <p className="text-gray-400 font-mono text-sm">REVIEW AND AUTHORIZE CARD ACCESS</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={fetchPendingRequests}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105 ${
                    dangerMode 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  SCAN DATABASE
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <Crosshair className="absolute inset-0 m-auto h-6 w-6 text-purple-400 animate-ping" />
                </div>
                <p className="mt-3 text-sm text-gray-400 font-mono">SCANNING SECURITY DATABASE...</p>
                <p className="text-xs text-gray-500 mt-1">DECRYPTING ACCESS REQUESTS</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-20 w-20 text-gray-500 mb-4 relative">
                  <ShieldCheck className="h-20 w-20" />
                  <div className="absolute inset-0 animate-ping opacity-20">
                    <ShieldCheck className="h-20 w-20" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">SECURITY STATUS: NORMAL</h3>
                <p className="text-gray-500 font-mono">ALL REQUESTS PROCESSED</p>
                <div className="mt-4 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              </div>
            ) : (
              <div className="custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className={dangerMode ? 'bg-purple-500/10' : 'bg-gray-800'}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        ENTITY
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        FINANCIAL PROFILE
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        DETECTION TIME
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        SECURITY STATUS
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                        COMMANDS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {pendingRequests.map((request) => (
                      <tr 
                        key={request._id} 
                        className={`transition-all hover:bg-gray-800/50 cursor-crosshair ${
                          showRequestDetails?._id === request._id ? 'bg-purple-500/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`p-2 rounded mr-3 ${dangerMode ? 'bg-purple-500/20' : 'bg-gray-800'}`}>
                              <Fingerprint className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="font-bold text-white tracking-wide">
                                {request.userId?.fullName || '🚫 UNKNOWN ENTITY'}
                              </div>
                              <div className="text-sm text-gray-400 font-mono">
                                {request.userId?.email || '🚫 ENCRYPTED'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-bold font-mono text-white">
                              ACC: {request.accountId?.accountNumber || '🚫 CLASSIFIED'}
                            </div>
                            <div className={`text-sm font-bold ${dangerMode ? 'text-green-400' : 'text-green-300'}`}>
                              ₹{request.accountId?.balance || '0'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400 font-mono">
                            {formatDate(request.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-xs font-bold rounded-full tracking-wider ${
                            dangerMode 
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                              : 'bg-yellow-500/10 text-yellow-300'
                          }`}>
                            ⚠️ PENDING CLEARANCE
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowRequestDetails(request)}
                              className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 flex items-center gap-1.5 transition-all hover:scale-105"
                            >
                              <Eye className="h-4 w-4" />
                              ANALYZE
                            </button>
                            <button
                              onClick={() => handleApproveRequest(request._id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1.5 transition-all hover:scale-105 disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                              GRANT ACCESS
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1.5 transition-all hover:scale-105 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                              TERMINATE
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Security Command Center */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-xl border backdrop-blur-lg transition-all hover:scale-[1.02] cursor-crosshair ${
            dangerMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-gray-900/50 border-gray-700'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded">
                <Terminal className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-white">SECURITY AUDIT LOGS</h3>
            </div>
            <p className="text-gray-400 mb-4 text-sm">GENERATE CRYPTOGRAPHIC AUDIT TRAILS</p>
            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold flex items-center justify-center gap-2 transition-all hover:scale-105">
              <Download className="h-4 w-4" />
              DOWNLOAD AUDIT
            </button>
          </div>

          <div className={`p-6 rounded-xl border backdrop-blur-lg transition-all hover:scale-[1.02] cursor-crosshair ${
            dangerMode ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-gray-900/50 border-gray-700'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded">
                <Shield className="h-5 w-5 text-yellow-400" />
              </div>
              <h3 className="font-bold text-white">NETWORK SECURITY</h3>
            </div>
            <p className="text-gray-400 mb-4 text-sm">MANAGE ACTIVE FINANCIAL CHANNELS</p>
            <button className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-bold flex items-center justify-center gap-2 transition-all hover:scale-105">
              <Network className="h-4 w-4" />
              SECURE NETWORK
            </button>
          </div>

          <div className={`p-6 rounded-xl border backdrop-blur-lg transition-all hover:scale-[1.02] cursor-crosshair ${
            dangerMode ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-900/50 border-gray-700'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded">
                <Server className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="font-bold text-white">THREAT ANALYTICS</h3>
            </div>
            <p className="text-gray-400 mb-4 text-sm">ANALYZE SECURITY PATTERNS & THREATS</p>
            <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 transition-all hover:scale-105">
              <FileText className="h-4 w-4" />
              VIEW THREATS
            </button>
          </div>
        </div>

        {/* Danger Zone Indicator */}
        <div className={`mt-8 p-4 rounded-xl border backdrop-blur-lg ${
          dangerMode 
            ? 'bg-red-500/10 border-red-500/30 animate-pulse' 
            : 'bg-gray-900/50 border-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skull className="h-6 w-6 text-red-400" />
              <div>
                <h4 className="font-bold text-white">HIGH SECURITY ZONE</h4>
                <p className="text-sm text-gray-400">ALL ACTIONS ARE LOGGED AND AUDITED</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${dangerMode ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-sm text-gray-300">{dangerMode ? 'LOCKDOWN ACTIVE' : 'SYSTEM SECURE'}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Request Details Modal */}
      {showRequestDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl shadow-2xl w-full max-w-2xl backdrop-blur-lg ${
            dangerMode ? 'bg-gray-900/95 border border-purple-500/30' : 'bg-gray-900/90 border border-gray-700'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${dangerMode ? 'text-purple-400' : 'text-purple-300'}`}>
                    SECURITY ANALYSIS REPORT
                  </h3>
                  <p className="text-gray-400 text-sm font-mono">REQUEST ID: {showRequestDetails._id.substring(0, 12)}</p>
                </div>
                <button 
                  onClick={() => setShowRequestDetails(null)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Entity Profile */}
                <div className={`p-4 rounded-lg ${dangerMode ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-gray-800 border border-gray-700'}`}>
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-purple-400" />
                    ENTITY PROFILE
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">IDENTITY</p>
                      <p className="font-bold text-white">{showRequestDetails.userId?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">COMMUNICATION</p>
                      <p className="font-bold text-white font-mono">{showRequestDetails.userId?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Access */}
                <div className={`p-4 rounded-lg ${dangerMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-gray-800 border border-gray-700'}`}>
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-400" />
                    FINANCIAL ACCESS POINT
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">ACCESS CODE</p>
                      <p className="font-bold text-white font-mono tracking-wider">
                        {showRequestDetails.accountId?.accountNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">FINANCIAL CAPACITY</p>
                      <p className="font-bold text-green-400 text-xl">
                        ₹{showRequestDetails.accountId?.balance}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Request Timeline */}
                <div className={`p-4 rounded-lg ${dangerMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-gray-800 border border-gray-700'}`}>
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-400" />
                    REQUEST TIMELINE
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">DETECTION TIME</p>
                      <p className="font-bold text-white">{formatDate(showRequestDetails.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">REQUEST STATUS</p>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full tracking-wider ${
                        dangerMode 
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                          : 'bg-yellow-500/10 text-yellow-300'
                      }`}>
                        ⚠️ AWAITING AUTHORIZATION
                      </span>
                    </div>
                  </div>
                </div>

                {/* Command Interface */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleApproveRequest(showRequestDetails._id)}
                      disabled={actionLoading}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-105"
                    >
                      <Check className="h-5 w-5" />
                      GRANT FINANCIAL ACCESS
                    </button>
                    <button
                      onClick={() => handleRejectRequest(showRequestDetails._id)}
                      disabled={actionLoading}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-105"
                    >
                      <X className="h-5 w-5" />
                      TERMINATE REQUEST
                    </button>
                    <button
                      onClick={() => setShowRequestDetails(null)}
                      className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 font-bold transition-all hover:scale-105"
                    >
                      CLOSE ANALYSIS
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    ⚠️ ALL ACTIONS ARE PERMANENTLY LOGGED IN SECURITY DATABASE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${dangerMode ? 'rgba(147, 51, 234, 0.5)' : 'rgba(139, 92, 246, 0.5)'};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${dangerMode ? 'rgba(147, 51, 234, 0.7)' : 'rgba(139, 92, 246, 0.7)'};
        }

        /* Security cursor */
        .cursor-crosshair {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M16,2 L30,16 L16,30 L2,16 Z" fill="none" stroke="%239f7aea" stroke-width="2"/><path d="M8,8 L24,24 M8,24 L24,8" stroke="%239f7aea" stroke-width="2"/></svg>'), crosshair !important;
        }

        .cursor-danger {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="16,2 30,16 16,30 2,16" fill="%23f87171" stroke="%23dc2626" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="%23dc2626"/></svg>'), pointer !important;
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

export default CardManagerDashboard;