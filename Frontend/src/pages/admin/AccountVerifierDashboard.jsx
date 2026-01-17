// Frontend/src/pages/admin/AccountVerifierDashboard.jsx - UPDATED DANGEROUS THEME
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
    Search, Filter, RefreshCw, X, CheckCircle, 
    XCircle, Shield, User, FileText, Calendar,
    Mail, Phone, MapPin, CreditCard, AlertCircle,
    LogOut, ChevronRight, Eye, Clock, Check,
    UserCheck, UserX, Download, AlertTriangle,
    Skull, Lock, Unlock, Fingerprint, Database,
    ShieldAlert, Radar, Biohazard, Crosshair
} from 'lucide-react';

const AccountVerifierDashboard = () => {
    const [pendingApplications, setPendingApplications] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dangerMode, setDangerMode] = useState(false);
    const navigate = useNavigate();

    // Fetch pending applications
    const fetchPendingApplications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/account-verifier/applications/pending');
            
            if (response.data.success) {
                setPendingApplications(response.data.applications);
            } else {
                setMessage({ text: '⚠️ SECURITY BREACH DETECTED', type: 'danger' });
            }
        } catch (error) {
            console.error('❌ Critical Error:', error);
            if (error.response?.status === 401) {
                setMessage({ 
                    text: '🚨 UNAUTHORIZED ACCESS - SESSION TERMINATED', 
                    type: 'danger' 
                });
                setTimeout(() => navigate('/admin/login'), 1500);
            } else {
                setMessage({ 
                    text: '⚡ NETWORK COMPROMISE DETECTED', 
                    type: 'danger' 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch detailed application data
    const fetchApplicationDetails = async (applicationId) => {
        try {
            setActionLoading(true);
            const response = await api.get(`/admin/account-verifier/applications/${applicationId}`);
            
            if (response.data.success) {
                setSelectedApp(response.data.application);
            } else {
                setMessage({ text: '🚫 DATA INTEGRITY COMPROMISED', type: 'danger' });
            }
        } catch (error) {
            console.error('❌ Critical Detail Fetch Error:', error);
            setMessage({ 
                text: '🔥 SYSTEM BREACH - DATA LEAK DETECTED', 
                type: 'danger' 
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Verify identity
    const handleVerifyIdentity = async (applicationId) => {
        if (!window.confirm('🚨 CONFIRM IDENTITY VERIFICATION\nThis action cannot be undone.')) return;
        
        try {
            setActionLoading(true);
            setMessage({ text: '', type: '' });
            
            const response = await api.post(`/admin/account-verifier/applications/${applicationId}/verify-identity`);
            
            if (response.data.success) {
                setMessage({ 
                    text: '✅ IDENTITY VERIFIED - CLEARANCE GRANTED', 
                    type: 'success' 
                });
                fetchApplicationDetails(applicationId);
                fetchPendingApplications();
            } else {
                setMessage({ 
                    text: '⚠️ VERIFICATION FAILED - POSSIBLE FRAUD', 
                    type: 'danger' 
                });
            }
        } catch (error) {
            console.error('❌ Verification System Error:', error);
            setMessage({ 
                text: '⚡ VERIFICATION SYSTEM COMPROMISED', 
                type: 'danger' 
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Approve application
    const handleApprove = async (applicationId) => {
        if (!window.confirm('🚨 FINAL APPROVAL CONFIRMATION\nCreate bank account with FULL PRIVILEGES?')) return;
        
        try {
            setActionLoading(true);
            setMessage({ text: '', type: '' });
            
            const response = await api.post(`/admin/account-verifier/applications/${applicationId}/approve`);
            
            if (response.data.success) {
                setMessage({ 
                    text: `✅ ACCOUNT CREATED - ACCESS GRANTED\nAccount: ${response.data.accountNumber}`, 
                    type: 'success' 
                });
                setSelectedApp(null);
                fetchPendingApplications();
            } else {
                setMessage({ 
                    text: '⚠️ APPROVAL FAILED - SECURITY LOCKDOWN', 
                    type: 'danger' 
                });
            }
        } catch (error) {
            console.error('❌ Approval System Error:', error);
            setMessage({ 
                text: '🔥 APPROVAL SYSTEM COMPROMISED', 
                type: 'danger' 
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Reject application
    const handleReject = async (applicationId) => {
        const reason = prompt('🚨 ENTER REJECTION REASON (This will be logged and audited):');
        if (!reason) return;
        
        try {
            setActionLoading(true);
            setMessage({ text: '', type: '' });
            
            const response = await api.post(`/admin/account-verifier/applications/${applicationId}/reject`, { reason });
            
            if (response.data.success) {
                setMessage({ 
                    text: '❌ APPLICATION TERMINATED - LOGGED', 
                    type: 'danger' 
                });
                setSelectedApp(null);
                fetchPendingApplications();
            } else {
                setMessage({ 
                    text: '⚠️ REJECTION FAILED - SYSTEM ERROR', 
                    type: 'danger' 
                });
            }
        } catch (error) {
            console.error('❌ Rejection System Error:', error);
            setMessage({ 
                text: '⚡ REJECTION SYSTEM COMPROMISED', 
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
            document.body.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"14\" fill=\"none\" stroke=\"%23ff0000\" stroke-width=\"2\"/><circle cx=\"16\" cy=\"16\" r=\"2\" fill=\"%23ff0000\"/></svg>'), crosshair";
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
            console.error('❌ Logout error:', error);
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

    // Truncate text
    const truncateText = (text, length = 20) => {
        if (!text) return '🚫 CLASSIFIED';
        return text.length > length ? `${text.substring(0, length)}...` : text;
    };

    // Filter applications
    const filteredApplications = pendingApplications.filter(app => {
        const matchesSearch = app.personalInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             app._id.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus === 'all') return matchesSearch;
        if (filterStatus === 'verified') return matchesSearch && app.identityVerified;
        if (filterStatus === 'unverified') return matchesSearch && !app.identityVerified;
        
        return matchesSearch;
    });

    // Initialize
    useEffect(() => {
        fetchPendingApplications();
        // Set danger cursor for critical elements
        const criticalElements = document.querySelectorAll('.danger-cursor');
        criticalElements.forEach(el => {
            el.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><polygon points=\"16,2 30,30 2,30\" fill=\"%23ff4444\" stroke=\"%23ff0000\" stroke-width=\"2\"/></svg>'), pointer";
        });

        return () => {
            document.body.style.cursor = 'default';
        };
    }, []);

    return (
        <div className={`min-h-screen transition-all duration-300 ${dangerMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-900 to-gray-800'}`}>
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,0,0,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,0,0,0.1),transparent_50%)]"></div>
                {dangerMode && (
                    <div className="absolute inset-0 animate-pulse">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                    </div>
                )}
            </div>

            {/* Header */}
            <header className={`relative border-b ${dangerMode ? 'border-red-500/50 bg-gray-900/90 backdrop-blur-lg' : 'border-gray-700 bg-gray-900/80 backdrop-blur-md'} shadow-2xl`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${dangerMode ? 'bg-red-500/20 animate-pulse' : 'bg-gray-800'}`}>
                                {dangerMode ? (
                                    <Skull className="h-6 w-6 text-red-400" />
                                ) : (
                                    <ShieldAlert className="h-6 w-6 text-yellow-400" />
                                )}
                            </div>
                            <div>
                                <h1 className={`text-xl font-bold ${dangerMode ? 'text-red-400' : 'text-yellow-300'}`}>
                                    {dangerMode ? '🚨 CRITICAL VERIFICATION SYSTEM' : '🔒 ACCOUNT VERIFICATION'}
                                </h1>
                                <p className="text-sm text-gray-400">HIGH SECURITY CLEARANCE REQUIRED</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={toggleDangerMode}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                                    dangerMode 
                                        ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' 
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {dangerMode ? <Biohazard className="h-4 w-4" /> : <Radar className="h-4 w-4" />}
                                {dangerMode ? 'LOCKDOWN ACTIVE' : 'DANGER MODE'}
                            </button>
                            
                            <button
                                onClick={fetchPendingApplications}
                                disabled={loading}
                                className="px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-all hover:scale-105"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
                                SCAN
                            </button>
                            
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all hover:scale-105"
                            >
                                <LogOut className="h-4 w-4 mr-2 inline" />
                                TERMINATE
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
                                    <AlertTriangle className="h-5 w-5 mr-2 animate-pulse" /> : 
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                }
                                <span className="font-mono text-sm">{message.text}</span>
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
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Panel: Applications List */}
                    <div className="lg:w-2/5">
                        <div className={`rounded-xl shadow-2xl border p-6 backdrop-blur-lg ${dangerMode ? 'bg-gray-900/90 border-red-500/30' : 'bg-gray-900/80 border-gray-700'}`}>
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className={`text-lg font-bold ${dangerMode ? 'text-red-400' : 'text-yellow-300'}`}>
                                        PENDING THREAT ASSESSMENTS
                                    </h2>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${dangerMode ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                        ⚠️ {filteredApplications.length} THREATS DETECTED
                                    </span>
                                </div>
                                
                                {/* Search and Filter */}
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-400" />
                                        <input
                                            type="text"
                                            placeholder="SCAN FOR THREATS..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                        />
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                        {[
                                            { key: 'all', label: 'ALL THREATS', icon: Database },
                                            { key: 'verified', label: 'VERIFIED', icon: CheckCircle },
                                            { key: 'unverified', label: 'UNVERIFIED', icon: Shield }
                                        ].map((filter) => (
                                            <button
                                                key={filter.key}
                                                onClick={() => setFilterStatus(filter.key)}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${
                                                    filterStatus === filter.key 
                                                        ? dangerMode
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-yellow-500 text-gray-900'
                                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                }`}
                                            >
                                                <filter.icon className="h-3 w-3" />
                                                {filter.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Applications List */}
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                                        <p className="mt-3 text-sm text-gray-400">SCANNING DATABASE...</p>
                                        <div className="mt-2 h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
                                    </div>
                                ) : filteredApplications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="mx-auto h-12 w-12 text-gray-500">
                                            <FileText className="h-12 w-12" />
                                        </div>
                                        <h3 className="mt-3 text-sm font-medium text-white">NO THREATS DETECTED</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {searchTerm ? 'NO MATCHING THREATS FOUND' : 'SYSTEM SECURE'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredApplications.map((app) => (
                                        <div
                                            key={app._id}
                                            onClick={() => fetchApplicationDetails(app._id)}
                                            className={`p-4 border rounded-lg transition-all hover:shadow-lg cursor-crosshair group ${
                                                selectedApp?._id === app._id 
                                                    ? dangerMode
                                                        ? 'border-red-500 bg-red-500/10'
                                                        : 'border-yellow-500 bg-yellow-500/10'
                                                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`p-1.5 rounded ${
                                                            app.identityVerified 
                                                                ? 'bg-green-500/20 text-green-400' 
                                                                : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                            {app.identityVerified ? 
                                                                <Fingerprint className="h-4 w-4" /> : 
                                                                <Lock className="h-4 w-4" />
                                                            }
                                                        </div>
                                                        <h3 className="font-bold text-white group-hover:text-yellow-300">
                                                            {truncateText(app.personalInfo?.fullName, 30)}
                                                        </h3>
                                                    </div>
                                                    
                                                    <div className="space-y-1 text-sm text-gray-400">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3 w-3" />
                                                            <span className="font-mono">{formatDate(app.createdAt)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-3 w-3" />
                                                            <span>{truncateText(app.personalInfo?.email, 25)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                                                    selectedApp?._id === app._id 
                                                        ? dangerMode ? 'text-red-400' : 'text-yellow-400'
                                                        : 'text-gray-500'
                                                }`} />
                                            </div>
                                            
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                    app.identityVerified 
                                                        ? 'bg-green-500/20 text-green-400' 
                                                        : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {app.identityVerified ? 'CLEARED' : 'PENDING CLEARANCE'}
                                                </span>
                                                <span className="text-xs text-gray-500 font-mono">
                                                    ID: {app._id.substring(0, 8)}...
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Application Details */}
                    <div className="lg:w-3/5">
                        {selectedApp ? (
                            <div className={`rounded-xl shadow-2xl border p-6 backdrop-blur-lg ${dangerMode ? 'bg-gray-900/90 border-red-500/30' : 'bg-gray-900/80 border-gray-700'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className={`text-xl font-bold ${dangerMode ? 'text-red-400' : 'text-yellow-300'}`}>
                                            THREAT ANALYSIS
                                        </h2>
                                        <p className="text-sm text-gray-400">DECISION REQUIRED</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedApp(null)}
                                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {actionLoading ? (
                                    <div className="text-center py-12">
                                        <div className="relative">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                                            <Crosshair className="absolute inset-0 m-auto h-6 w-6 text-red-400 animate-ping" />
                                        </div>
                                        <p className="mt-3 text-sm text-gray-400">PROCESSING...</p>
                                        <p className="text-xs text-gray-500 mt-1">SECURITY PROTOCOLS ENGAGED</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Application Status */}
                                        <div className={`mb-8 p-4 rounded-lg ${dangerMode ? 'bg-red-500/10 border border-red-500/30' : 'bg-gray-800 border border-gray-700'}`}>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-400">THREAT ID</p>
                                                    <p className="font-mono text-sm font-bold text-white">{truncateText(selectedApp._id, 24)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">THREAT LEVEL</p>
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                        selectedApp.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                        selectedApp.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {selectedApp.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">CLEARANCE</p>
                                                    <div className="flex items-center gap-1">
                                                        {selectedApp.identityVerified ? (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 text-green-400" />
                                                                <span className="text-sm font-bold text-green-400">GRANTED</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-4 w-4 text-red-400" />
                                                                <span className="text-sm font-bold text-red-400">DENIED</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">DETECTED</p>
                                                    <p className="text-sm font-bold text-white">{formatDate(selectedApp.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Personal Information */}
                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <User className="h-5 w-5 text-yellow-400" />
                                                SUBJECT PROFILE
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { label: 'FULL NAME', value: selectedApp.personalInfo?.fullName, icon: User },
                                                    { label: 'EMAIL', value: selectedApp.personalInfo?.email, icon: Mail },
                                                    { label: 'PHONE', value: selectedApp.personalInfo?.phone, icon: Phone },
                                                    { label: 'DATE OF BIRTH', value: selectedApp.personalInfo?.dob, icon: Calendar },
                                                    { label: 'LOCATION', value: selectedApp.personalInfo?.address, icon: MapPin },
                                                ].map((item, index) => (
                                                    <div key={index} className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <item.icon className="h-4 w-4 text-gray-400" />
                                                            <p className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</p>
                                                        </div>
                                                        <p className="font-bold text-white font-mono">{item.value || '🚫 CLASSIFIED'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Identity Information */}
                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-red-400" />
                                                IDENTITY VERIFICATION
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className={`p-4 border rounded-lg ${dangerMode ? 'border-red-500/30 bg-red-500/5' : 'border-gray-700 bg-gray-800/50'}`}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-bold text-gray-300">AADHAAR IDENTIFIER</h4>
                                                        {selectedApp.identityVerified && (
                                                            <CheckCircle className="h-5 w-5 text-green-400 animate-pulse" />
                                                        )}
                                                    </div>
                                                    <p className="font-mono text-lg tracking-widest text-white bg-black/30 p-2 rounded">
                                                        {selectedApp.identityInfo?.aadhaarNumber || '🚫 ENCRYPTED'}
                                                    </p>
                                                </div>
                                                <div className={`p-4 border rounded-lg ${dangerMode ? 'border-red-500/30 bg-red-500/5' : 'border-gray-700 bg-gray-800/50'}`}>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-bold text-gray-300">PAN IDENTIFIER</h4>
                                                        {selectedApp.identityVerified && (
                                                            <CheckCircle className="h-5 w-5 text-green-400 animate-pulse" />
                                                        )}
                                                    </div>
                                                    <p className="font-mono text-lg tracking-widest text-white bg-black/30 p-2 rounded">
                                                        {selectedApp.identityInfo?.panNumber || '🚫 ENCRYPTED'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="border-t border-gray-700 pt-6">
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={() => handleVerifyIdentity(selectedApp._id)}
                                                    disabled={selectedApp.identityVerified || actionLoading}
                                                    className={`py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 ${
                                                        selectedApp.identityVerified
                                                            ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                                                            : dangerMode
                                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                                : 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
                                                    }`}
                                                >
                                                    {selectedApp.identityVerified ? (
                                                        <>
                                                            <Fingerprint className="h-5 w-5" />
                                                            CLEARANCE VERIFIED
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="h-5 w-5" />
                                                            GRANT CLEARANCE
                                                        </>
                                                    )}
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleApprove(selectedApp._id)}
                                                    disabled={!selectedApp.identityVerified || selectedApp.verified || actionLoading}
                                                    className={`py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 ${
                                                        !selectedApp.identityVerified
                                                            ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                                                            : dangerMode
                                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                                : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                                >
                                                    <Check className="h-5 w-5" />
                                                    APPROVE ACCESS
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleReject(selectedApp._id)}
                                                    disabled={actionLoading}
                                                    className="py-3 px-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center justify-center gap-2 transition-all hover:scale-105"
                                                >
                                                    <X className="h-5 w-5" />
                                                    TERMINATE
                                                </button>
                                            </div>
                                            
                                            <div className={`mt-4 p-4 rounded-lg ${dangerMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                                                <p className={`text-sm ${dangerMode ? 'text-red-300' : 'text-blue-300'}`}>
                                                    <span className="font-bold">⚠️ WARNING:</span> This action is logged and audited. 
                                                    Security clearance is required before granting system access.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className={`rounded-xl shadow-2xl border p-12 text-center backdrop-blur-lg ${dangerMode ? 'bg-gray-900/90 border-red-500/30' : 'bg-gray-900/80 border-gray-700'}`}>
                                <div className="mx-auto h-20 w-20 mb-4 relative">
                                    <div className="absolute inset-0 animate-ping">
                                        <Crosshair className="h-20 w-20 text-red-500/30" />
                                    </div>
                                    <Eye className="h-20 w-20 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">NO THREAT SELECTED</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    Select a threat assessment from the list to analyze and take decisive action.
                                </p>
                                <div className="mt-4 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Add custom styles for cursor and scrollbar */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(55, 65, 81, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${dangerMode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(234, 179, 8, 0.5)'};
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${dangerMode ? 'rgba(239, 68, 68, 0.7)' : 'rgba(234, 179, 8, 0.7)'};
                }
                
                /* Critical element cursor */
                .critical-cursor {
                    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="%23ff0000" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="%23ff0000"/></svg>'), crosshair !important;
                }
                
                .danger-cursor {
                    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="16,2 30,30 2,30" fill="%23ff4444" stroke="%23ff0000" stroke-width="2"/></svg>'), pointer !important;
                }
            `}</style>
        </div>
    );
};

export default AccountVerifierDashboard;