// Frontend/src/pages/admin/SuperAdminDashboard.jsx - DANGEROUS THEME
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  CreditCard,
  Banknote,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  BarChart3,
  Settings,
  UserPlus,
  FileText,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Search,
  Wifi,
  WifiOff,
  Skull,
  Lock,
  Unlock,
  Fingerprint,
  Database,
  ShieldAlert,
  Radar,
  Crosshair,
  Zap,
  Cpu,
  Terminal,
  Server,
  Network,
  Key,
  ShieldCheck,
  ShieldOff,
  Target,
  HardDrive,
  Activity,
  AlertTriangle,
  FileTerminal,
  Radiation,
  Satellite,
  Globe,
  ShieldQuestion,
  Sword,
  Ghost,
  Biohazard,
  Bug,
  Settings2,
  Brain,
} from "lucide-react";
import { toast } from "react-toastify";

// API configuration
const API_BASE_URL = "http://localhost:5000";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApplications: 0,
    activeAccounts: 0,
    totalTransactions: 0,
    todayApprovals: 0,
    todayRejections: 0,
  });
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    fullName: "",
    email: "",
    mobile: "",
    role: "accountVerifier",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [dangerMode, setDangerMode] = useState(false);
  const [systemLockdown, setSystemLockdown] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(3);
  const [threatsDetected, setThreatsDetected] = useState(0);
  const navigate = useNavigate();

  const adminData = JSON.parse(sessionStorage.getItem("adminData") || "{}");

  // Sound effects simulation
  const playSound = (soundType) => {
    if (dangerMode) {
      console.log(`🔊 Playing ${soundType} sound effect`);
    }
  };

  // Initialize
  useEffect(() => {
    checkBackendStatus();
    fetchAdmins();
    fetchDashboardStats();
    // Simulate threat detection
    const threatInterval = setInterval(() => {
      if (dangerMode && Math.random() > 0.8) {
        setThreatsDetected((prev) => prev + 1);
        playSound("threat");
      }
    }, 10000);

    return () => clearInterval(threatInterval);
  }, [dangerMode]);

  // Toggle danger mode
  const toggleDangerMode = () => {
    setDangerMode(!dangerMode);
    if (!dangerMode) {
      playSound("lockdown");
      document.body.style.cursor =
        'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="%23ff0000" stroke-width="3"/><path d="M8,8 L24,24 M8,24 L24,8" stroke="%23ff0000" stroke-width="3"/></svg>\'), crosshair';
      toast.warning("🚨 DANGER MODE ACTIVATED - Extreme caution required");
    } else {
      document.body.style.cursor = "default";
      toast.info("✅ Danger mode deactivated");
    }
  };

  // Toggle system lockdown
  const toggleSystemLockdown = () => {
    if (systemLockdown) {
      const confirmCode = prompt("🔐 ENTER UNLOCK CODE (EMERGENCY OVERRIDE):");
      if (confirmCode === "000000") {
        // DEMO ONLY
        setSystemLockdown(false);
        setSecurityLevel(3);
        toast.success("🔓 SYSTEM LOCKDOWN LIFTED");
      } else {
        toast.error("❌ INVALID UNLOCK CODE - LOCKDOWN MAINTAINED");
      }
    } else {
      if (
        window.confirm(
          "🚨 ACTIVATE SYSTEM-WIDE LOCKDOWN?\nThis will restrict ALL admin operations."
        )
      ) {
        setSystemLockdown(true);
        setSecurityLevel(5);
        toast.error("🔒 SYSTEM LOCKDOWN ACTIVATED");
        playSound("lockdown");
      }
    }
  };

  // Check if backend is reachable
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setBackendStatus("online");
        const text = await response.text();
        console.log("🔗 Backend response:", text);
      } else {
        setBackendStatus("offline");
        console.error("🔗 Backend responded with status:", response.status);
      }
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      setBackendStatus("offline");
      toast.error("🚨 CANNOT CONNECT TO MAINFRAME");
    }
  };

  const fetchAdmins = async () => {
    try {
      console.log(
        "🕵️ Fetching admins from:",
        `${API_BASE_URL}/admin/super-admin/list`
      );

      const response = await fetch(`${API_BASE_URL}/admin/super-admin/list`, {
        headers: {
          Authorization: `Bearer ${adminData.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (response.status === 401) {
        sessionStorage.removeItem("adminData");
        navigate("/admin/login");
        toast.error("🔒 SESSION TERMINATED - Re-authentication required");
        return;
      }

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        throw new Error("Mainframe returned corrupted data");
      }

      setAdmins(data.admins || []);
      toast.success(
        `✅ SECURITY CLEARANCE: ${data.admins?.length || 0} admins verified`
      );
    } catch (error) {
      console.error("❌ CRITICAL ERROR fetching admins:", error);
      toast.error(`🚨 DATA BREACH DETECTED: ${error.message}`);

      // Set mock data for development
      if (backendStatus === "offline") {
        setAdmins([
          {
            _id: "1",
            fullName: "SUPER ADMIN - ALPHA",
            email: "alpha@system.com",
            mobile: "0000000001",
            role: "superAdmin",
            isActive: true,
            createdAt: new Date().toISOString(),
            clearance: "LEVEL 5",
            lastAccess: "NOW",
          },
          {
            _id: "2",
            fullName: "SECURITY AGENT - BETA",
            email: "beta@security.com",
            mobile: "0000000002",
            role: "accountVerifier",
            isActive: true,
            createdAt: new Date().toISOString(),
            clearance: "LEVEL 3",
            lastAccess: "2 HOURS AGO",
          },
        ]);
        toast.warning("⚠️ USING DECRYPTED DATA - MAINFRAME OFFLINE");
      }
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Enhanced mock data with security flavor
      setStats({
        totalUsers: 1248,
        pendingApplications: 42,
        activeAccounts: 1156,
        totalTransactions: 8456,
        todayApprovals: 23,
        todayRejections: 5,
        securityBreaches: 3,
        activeThreats: threatsDetected,
      });
      setLoading(false);
    } catch (error) {
      console.error("❌ SECURITY: Stats fetch failure:", error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (dangerMode || systemLockdown) {
      const confirm = window.confirm(
        "🚨 CRITICAL SYSTEM ACTIVE\nConfirm emergency disengagement?"
      );
      if (!confirm) return;
    }

    try {
      await fetch(`${API_BASE_URL}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
      sessionStorage.removeItem("adminData");
      navigate("/admin/login");
      toast.success("🔓 SECURE DISENGAGEMENT COMPLETE");
    } catch (error) {
      console.error("❌ EMERGENCY LOGOUT:", error);
      sessionStorage.removeItem("adminData");
      navigate("/admin/login");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (systemLockdown) {
      toast.error("🔒 SYSTEM LOCKDOWN - Admin creation disabled");
      return;
    }

    // Enhanced validation
    if (newAdmin.password !== newAdmin.confirmPassword) {
      toast.error("🚨 PASSWORDS DO NOT MATCH - Security violation");
      return;
    }

    if (newAdmin.password.length < 8) {
      toast.error("⚠️ PASSWORD TOO WEAK - Minimum 8 characters required");
      return;
    }

    if (!newAdmin.mobile.match(/^[6-9]\d{9}$/)) {
      toast.error("❌ INVALID MOBILE - Must be valid Indian number");
      return;
    }

    // Security clearance check for Super Admin creation
    if (newAdmin.role === "superAdmin") {
      const clearance = prompt("🚨 ENTER MASTER OVERRIDE CODE (6-digit):");
      if (clearance !== "000000") {
        toast.error("🔐 ACCESS DENIED - Insufficient clearance");
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/super-admin/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminData.token}`,
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: newAdmin.fullName,
          email: newAdmin.email,
          mobile: newAdmin.mobile,
          role: newAdmin.role,
          password: newAdmin.password,
        }),
      });

      const responseText = await response.text();

      if (response.status === 401) {
        sessionStorage.removeItem("adminData");
        navigate("/admin/login");
        toast.error("🔒 SESSION COMPROMISED - Re-authenticate immediately");
        return;
      }

      if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Failed to parse response JSON:", error);
        throw new Error("Mainframe returned corrupted response");
      }

      toast.success(
        `✅ ADMIN ${newAdmin.fullName.toUpperCase()} CREATED - SECURITY CLEARANCE ${newAdmin.role.toUpperCase()}`
      );
      setShowAddAdminModal(false);
      setNewAdmin({
        fullName: "",
        email: "",
        mobile: "",
        role: "accountVerifier",
        password: "",
        confirmPassword: "",
      });
      fetchAdmins();
      playSound("adminCreated");
    } catch (error) {
      console.error("❌ CRITICAL ERROR creating admin:", error);
      toast.error(
        error.message || "🚨 ADMIN CREATION FAILED - Security protocols engaged"
      );
    }
  };

  const handleToggleAdminStatus = async (adminId, currentStatus, adminRole) => {
    if (systemLockdown) {
      toast.error("🔒 SYSTEM LOCKDOWN - Admin modification disabled");
      return;
    }

    if (adminRole === "superAdmin") {
      toast.error(
        "🚫 PROTECTED ENTITY - Super Admin status cannot be modified"
      );
      return;
    }

    const action = currentStatus ? "TERMINATE ACCESS" : "REINSTATE CLEARANCE";
    if (
      !confirm(`🚨 CONFIRM ${action}?\nThis action will be logged and audited.`)
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/super-admin/toggle/${adminId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${adminData.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      const responseText = await response.text();

      if (response.status === 401) {
        sessionStorage.removeItem("adminData");
        navigate("/admin/login");
        toast.error("🔒 SESSION TERMINATED");
        return;
      }

      if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Failed to parse response JSON:", error);
        throw new Error("Mainframe returned corrupted response");
      }

      toast.success(
        `✅ ${action} COMPLETE - ${
          currentStatus ? "ACCESS TERMINATED" : "CLEARANCE RESTORED"
        }`
      );
      fetchAdmins();
      playSound("statusChange");
    } catch (error) {
      console.error("❌ CRITICAL ERROR toggling admin status:", error);
      toast.error(error.message || `🚨 FAILED TO ${action}`);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "superAdmin":
        return dangerMode
          ? "bg-red-500/20 text-red-400 border border-red-500/50"
          : "bg-red-100 text-red-800 border border-red-200";
      case "accountVerifier":
        return dangerMode
          ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
          : "bg-blue-100 text-blue-800 border border-blue-200";
      case "cashier":
        return dangerMode
          ? "bg-green-500/20 text-green-400 border border-green-500/50"
          : "bg-green-100 text-green-800 border border-green-200";
      case "cardManager":
        return dangerMode
          ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
          : "bg-purple-100 text-purple-800 border border-purple-200";
      default:
        return dangerMode
          ? "bg-gray-500/20 text-gray-400 border border-gray-500/50"
          : "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "superAdmin":
        return dangerMode ? "🔥 OMEGA CONTROL" : "SUPER ADMIN";
      case "accountVerifier":
        return dangerMode ? "🔐 IDENTITY COMMAND" : "ACCOUNT VERIFIER";
      case "cashier":
        return dangerMode ? "💰 VAULT OPERATIONS" : "CASHIER";
      case "cardManager":
        return dangerMode ? "💳 SECURITY CARDS" : "CARD MANAGER";
      default:
        return role.toUpperCase();
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "ENCRYPTED";
    }
  };

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.mobile?.includes(searchTerm);
    const matchesRole = filterRole === "all" || admin.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Emergency system wipe (demo only)
  const emergencySystemWipe = () => {
    if (
      window.confirm(
        "🚨🚨🚨 INITIATE EMERGENCY SYSTEM WIPE?\nThis will delete ALL data. This action is irreversible."
      )
    ) {
      const code = prompt("ENTER FINAL CONFIRMATION CODE (666666):");
      if (code === "666666") {
        toast.error(
          "💀 SYSTEM WIPE INITIATED - ALL DATA WILL BE DESTROYED IN 10 SECONDS"
        );
        playSound("wipe");
        setTimeout(() => {
          toast.error("💥 SYSTEM DESTROYED");
        }, 10000);
      } else {
        toast.error("❌ WIPE ABORTED - Invalid confirmation code");
      }
    }
  };

  if (!adminData.token || adminData.role !== "superAdmin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black flex items-center justify-center p-4">
        <div className="text-center p-8 backdrop-blur-lg bg-red-900/30 border border-red-500/50 rounded-2xl shadow-2xl">
          <div className="relative">
            <div className="p-4 bg-red-500/20 rounded-full inline-block mb-4 animate-pulse">
              <Radiation className="h-16 w-16 text-red-400" />
            </div>
            <div className="absolute inset-0 animate-ping opacity-20">
              <Radiation className="h-16 w-16 text-red-400 m-auto" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-400 mb-2 tracking-wider">
            OMEGA ACCESS DENIED
          </h1>
          <p className="text-gray-400 mb-6 font-mono">
            QUANTUM CLEARANCE REQUIRED
          </p>
          <button
            onClick={() => navigate("/admin/login")}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold tracking-wider transition-all hover:scale-105"
          >
            REQUEST CLEARANCE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        dangerMode
          ? "bg-gradient-to-br from-black via-red-900/10 to-black"
          : "bg-gradient-to-br from-gray-900 to-black"
      }`}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,0,0,0.1),transparent_50%)]"></div>
        {dangerMode && (
          <>
            <div className="absolute inset-0 animate-pulse">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
            </div>
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-xs text-red-500/20 font-mono"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${
                      3 + Math.random() * 5
                    }s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                >
                  {Math.random() > 0.5 ? "1" : "0"}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Header */}
      <header
        className={`relative ${
          dangerMode
            ? "border-b border-red-500/50 bg-gray-900/90 backdrop-blur-lg"
            : "border-b border-gray-700 bg-gray-900/80 backdrop-blur-md"
        } shadow-2xl`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  dangerMode
                    ? "bg-red-500/20 animate-pulse"
                    : systemLockdown
                    ? "bg-yellow-500/20 animate-pulse"
                    : "bg-gray-800"
                }`}
              >
                <div className="relative">
                  <Brain className="h-8 w-8 text-red-400" />
                  {dangerMode && (
                    <div className="absolute -top-1 -right-1">
                      <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    dangerMode
                      ? "text-red-400"
                      : systemLockdown
                      ? "text-yellow-400"
                      : "text-white"
                  }`}
                >
                  {dangerMode
                    ? "🔥 OMEGA COMMAND CENTER"
                    : systemLockdown
                    ? "🔒 SYSTEM LOCKDOWN ACTIVE"
                    : "⚡ SUPER ADMIN CONTROL"}
                </h1>
                <p className="text-gray-400 font-mono text-sm">
                  SECURITY LEVEL {securityLevel} • QUANTUM ACCESS GRANTED
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block mr-4">
                <p className="text-xs text-gray-400 tracking-wider">
                  QUANTUM OPERATOR
                </p>
                <p className="font-bold text-white">
                  {adminData.fullName?.toUpperCase() || "OMEGA AGENT"}
                </p>
                <p
                  className={`text-xs font-mono tracking-wider ${
                    dangerMode ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {dangerMode ? "EXTREME DANGER MODE" : "CLEARANCE: LEVEL ∞"}
                </p>
              </div>

              <button
                onClick={toggleDangerMode}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                  dangerMode
                    ? "bg-red-600 text-white hover:bg-red-700 animate-pulse"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {dangerMode ? (
                  <Biohazard className="h-4 w-4" />
                ) : (
                  <Radar className="h-4 w-4" />
                )}
                {dangerMode ? "EXTREME MODE" : "DANGER MODE"}
              </button>

              <button
                onClick={toggleSystemLockdown}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                  systemLockdown
                    ? "bg-yellow-600 text-white hover:bg-yellow-700 animate-pulse"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {systemLockdown ? (
                  <Unlock className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {systemLockdown ? "UNLOCK SYSTEM" : "LOCKDOWN"}
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

          {/* Status Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                backendStatus === "online"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {backendStatus === "online" ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span className="text-xs font-bold tracking-wider">
                {backendStatus === "online"
                  ? "MAINFRAME ONLINE"
                  : "MAINFRAME OFFLINE"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Shield className="h-3 w-3" />
              <span className="text-xs font-bold tracking-wider">
                CLEARANCE: LEVEL {securityLevel}
              </span>
            </div>

            {dangerMode && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs font-bold tracking-wider">
                  THREATS DETECTED: {threatsDetected}
                </span>
              </div>
            )}

            {systemLockdown && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
                <Lock className="h-3 w-3" />
                <span className="text-xs font-bold tracking-wider">
                  SYSTEM LOCKDOWN ACTIVE
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Alert */}
        {systemLockdown && (
          <div className="mb-8 p-4 rounded-xl border backdrop-blur-lg bg-yellow-500/10 border-yellow-500/30 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                <div>
                  <h3 className="font-bold text-yellow-400 tracking-wider">
                    🚨 SYSTEM LOCKDOWN ACTIVE
                  </h3>
                  <p className="text-yellow-300 text-sm">
                    All administrative functions restricted. Emergency override
                    required.
                  </p>
                </div>
              </div>
              <button
                onClick={emergencySystemWipe}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm transition-all hover:scale-105"
              >
                EMERGENCY WIPE
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid - Enhanced with danger mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "TOTAL ENTITIES",
              value: stats.totalUsers,
              icon: Users,
              color: "blue",
              dangerIcon: Ghost,
              dangerLabel: "SYSTEM ENTITIES",
            },
            {
              label: "PENDING THREATS",
              value: stats.pendingApplications,
              icon: FileText,
              color: "yellow",
              dangerIcon: ShieldAlert,
              dangerLabel: "SECURITY THREATS",
            },
            {
              label: "ACTIVE SYSTEMS",
              value: stats.activeAccounts,
              icon: CreditCard,
              color: "green",
              dangerIcon: HardDrive,
              dangerLabel: "ACTIVE SYSTEMS",
            },
            {
              label: "TOTAL OPERATIONS",
              value: stats.totalTransactions,
              icon: BarChart3,
              color: "purple",
              dangerIcon: Activity,
              dangerLabel: "OPERATIONS LOG",
            },
            {
              label: "TODAY APPROVALS",
              value: stats.todayApprovals,
              icon: CheckCircle,
              color: "green",
              dangerIcon: ShieldCheck,
              dangerLabel: "SECURITY PASSES",
            },
            {
              label: "TODAY REJECTIONS",
              value: stats.todayRejections,
              icon: XCircle,
              color: "red",
              dangerIcon: ShieldOff,
              dangerLabel: "SECURITY FAILS",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border backdrop-blur-lg transition-all hover:scale-[1.02] cursor-crosshair ${
                dangerMode
                  ? `bg-${stat.color}-500/10 border-${stat.color}-500/30`
                  : "bg-gray-900/50 border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    {dangerMode ? stat.dangerLabel : stat.label}
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      stat.color === "blue"
                        ? "text-blue-400"
                        : stat.color === "yellow"
                        ? "text-yellow-400"
                        : stat.color === "green"
                        ? "text-green-400"
                        : stat.color === "purple"
                        ? "text-purple-400"
                        : "text-red-400"
                    }`}
                  >
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    stat.color === "blue"
                      ? "bg-blue-500/20"
                      : stat.color === "yellow"
                      ? "bg-yellow-500/20"
                      : stat.color === "green"
                      ? "bg-green-500/20"
                      : stat.color === "purple"
                      ? "bg-purple-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {dangerMode ? (
                    <stat.dangerIcon
                      className={`h-6 w-6 ${
                        stat.color === "blue"
                          ? "text-blue-400"
                          : stat.color === "yellow"
                          ? "text-yellow-400"
                          : stat.color === "green"
                          ? "text-green-400"
                          : stat.color === "purple"
                          ? "text-purple-400"
                          : "text-red-400"
                      }`}
                    />
                  ) : (
                    <stat.icon
                      className={`h-6 w-6 ${
                        stat.color === "blue"
                          ? "text-blue-400"
                          : stat.color === "yellow"
                          ? "text-yellow-400"
                          : stat.color === "green"
                          ? "text-green-400"
                          : stat.color === "purple"
                          ? "text-purple-400"
                          : "text-red-400"
                      }`}
                    />
                  )}
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

        {/* Admin Management Section */}
        <div
          className={`rounded-xl border p-6 mb-8 backdrop-blur-lg ${
            dangerMode
              ? "bg-gray-900/90 border-red-500/30"
              : "bg-gray-900/80 border-gray-700"
          }`}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div>
              <h2
                className={`text-xl font-bold tracking-wider ${
                  dangerMode ? "text-red-400" : "text-white"
                }`}
              >
                QUANTUM OPERATOR CONTROL
              </h2>
              <p className="text-gray-400 font-mono text-sm mt-1">
                MANAGE SYSTEM ADMINISTRATORS & CLEARANCE LEVELS
              </p>
              {backendStatus === "offline" && (
                <p className="text-xs text-yellow-400 mt-2">
                  ⚠️ USING DECRYPTED DATA - MAINFRAME OFFLINE
                </p>
              )}
              {systemLockdown && (
                <p className="text-xs text-red-400 mt-2 animate-pulse">
                  🔒 SYSTEM LOCKDOWN - OPERATOR MODIFICATIONS RESTRICTED
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchAdmins}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105 ${
                  dangerMode
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                SCAN OPERATORS
              </button>
              <button
                onClick={() => setShowAddAdminModal(true)}
                className={`px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all flex items-center gap-2 shadow ${
                  systemLockdown ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={systemLockdown || backendStatus === "offline"}
              >
                <UserPlus className="h-4 w-4" />
                CREATE OPERATOR
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="SCAN OPERATORS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">ALL CLEARANCE LEVELS</option>
              <option value="superAdmin">OMEGA CONTROL</option>
              <option value="accountVerifier">IDENTITY COMMAND</option>
              <option value="cashier">VAULT OPERATIONS</option>
              <option value="cardManager">SECURITY CARDS</option>
            </select>
          </div>

          {/* Admins Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className={dangerMode ? "bg-red-500/10" : "bg-gray-800"}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    OPERATOR
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    CLEARANCE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    CONTACT
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    ACTIVATION
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                    COMMANDS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Ghost className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-white">
                          NO OPERATORS DETECTED
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm || filterRole !== "all"
                            ? "NO MATCHING CLEARANCE LEVELS"
                            : "INITIATE OPERATOR CREATION PROTOCOL"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr
                      key={admin._id}
                      className="hover:bg-gray-800/50 transition-colors cursor-crosshair"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              admin.role === "superAdmin"
                                ? "bg-gradient-to-br from-red-500/20 to-red-600/20"
                                : admin.role === "accountVerifier"
                                ? "bg-gradient-to-br from-blue-500/20 to-blue-600/20"
                                : admin.role === "cashier"
                                ? "bg-gradient-to-br from-green-500/20 to-green-600/20"
                                : "bg-gradient-to-br from-purple-500/20 to-purple-600/20"
                            }`}
                          >
                            <span
                              className={`font-bold ${
                                admin.role === "superAdmin"
                                  ? "text-red-400"
                                  : admin.role === "accountVerifier"
                                  ? "text-blue-400"
                                  : admin.role === "cashier"
                                  ? "text-green-400"
                                  : "text-purple-400"
                              }`}
                            >
                              {admin.fullName?.charAt(0)?.toUpperCase() || "Ω"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="font-bold text-white tracking-wide">
                              {admin.fullName}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              ID: {admin._id?.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full tracking-wider ${getRoleBadgeColor(
                            admin.role
                          )}`}
                        >
                          {getRoleDisplayName(admin.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-mono">
                          {admin.email}
                        </div>
                        <div className="text-sm text-gray-400">
                          CODE: {admin.mobile}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              admin.isActive
                                ? "bg-green-500 animate-pulse"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span
                            className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full tracking-wider ${
                              admin.isActive
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {admin.isActive ? "ACTIVE" : "TERMINATED"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400 font-mono">
                          {formatDate(admin.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {admin.role !== "superAdmin" ? (
                          <button
                            onClick={() =>
                              handleToggleAdminStatus(
                                admin._id,
                                admin.isActive,
                                admin.role
                              )
                            }
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all hover:scale-105 ${
                              admin.isActive
                                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                                : "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                            } ${
                              systemLockdown
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={
                              systemLockdown || backendStatus === "offline"
                            }
                          >
                            {admin.isActive ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5 inline mr-1.5" />
                                TERMINATE
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5 inline mr-1.5" />
                                REINSTATE
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm italic font-mono">
                            PROTECTED ENTITY
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-700 flex flex-wrap justify-between items-center text-sm text-gray-400">
            <div>
              VISIBLE OPERATORS:{" "}
              <span className="font-bold text-white">
                {filteredAdmins.length}
              </span>{" "}
              of <span className="font-bold text-white">{admins.length}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>TERMINATED</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quantum Commands */}
          <div
            className={`rounded-xl border p-6 backdrop-blur-lg ${
              dangerMode
                ? "bg-gray-900/90 border-red-500/30"
                : "bg-gray-900/80 border-gray-700"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded">
                <Terminal className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="font-bold text-white tracking-wider">
                QUANTUM COMMANDS
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Shield,
                  title: "IDENTITY COMMAND",
                  description: "REVIEW SECURITY CLEARANCES",
                  color: "blue",
                  action: () => navigate("/admin/account-verifier"),
                },
                {
                  icon: CreditCard,
                  title: "SECURITY CARDS",
                  description: "MANAGE ACCESS CARDS",
                  color: "green",
                  action: () => navigate("/admin/card-manager"),
                },
                {
                  icon: Banknote,
                  title: "VAULT OPERATIONS",
                  description: "CONTROL FINANCIAL SYSTEMS",
                  color: "purple",
                  action: () => navigate("/admin/cashier"),
                },
                {
                  icon: Settings2,
                  title: "SYSTEM PARAMETERS",
                  description: "CONFIGURE QUANTUM SETTINGS",
                  color: "gray",
                  action: () => toast.warning("⚙️ SYSTEM PARAMETERS LOCKED"),
                },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`p-4 border rounded-lg transition-all hover:scale-105 cursor-crosshair ${
                    dangerMode
                      ? `border-${action.color}-500/30 hover:border-${action.color}-500/50 hover:bg-${action.color}-500/10`
                      : "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        action.color === "blue"
                          ? "bg-blue-500/20"
                          : action.color === "green"
                          ? "bg-green-500/20"
                          : action.color === "purple"
                          ? "bg-purple-500/20"
                          : "bg-gray-500/20"
                      }`}
                    >
                      <action.icon
                        className={`h-5 w-5 ${
                          action.color === "blue"
                            ? "text-blue-400"
                            : action.color === "green"
                            ? "text-green-400"
                            : action.color === "purple"
                            ? "text-purple-400"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span className="font-bold text-white tracking-wide">
                      {action.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div
            className={`rounded-xl border p-6 backdrop-blur-lg ${
              dangerMode
                ? "bg-gray-900/90 border-yellow-500/30"
                : "bg-gray-900/80 border-gray-700"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/20 rounded">
                <Satellite className="h-5 w-5 text-yellow-400" />
              </div>
              <h2 className="font-bold text-white tracking-wider">
                SYSTEM STATUS
              </h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  name: "MAINFRAME CONNECTION",
                  status:
                    backendStatus === "online"
                      ? "QUANTUM LINK"
                      : "DISCONNECTED",
                  color: backendStatus === "online" ? "green" : "red",
                  icon: Server,
                },
                {
                  name: "DATABASE INTEGRITY",
                  status: "SECURE",
                  color: "green",
                  icon: Database,
                },
                {
                  name: "SECURITY PROTOCOLS",
                  status: dangerMode
                    ? "EXTREME"
                    : systemLockdown
                    ? "LOCKDOWN"
                    : "ACTIVE",
                  color: dangerMode
                    ? "red"
                    : systemLockdown
                    ? "yellow"
                    : "green",
                  icon: Shield,
                },
                {
                  name: "NETWORK SHIELD",
                  status: "ACTIVE",
                  color: "green",
                  icon: Network,
                },
                {
                  name: "ENCRYPTION LEVEL",
                  status: "QUANTUM",
                  color: "purple",
                  icon: Key,
                },
                {
                  name: "THREAT DETECTION",
                  status: dangerMode ? "HIGH ALERT" : "NORMAL",
                  color: dangerMode ? "red" : "green",
                  icon: Radar,
                },
              ].map((service, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    service.color === "green"
                      ? "bg-green-500/10"
                      : service.color === "yellow"
                      ? "bg-yellow-500/10"
                      : service.color === "red"
                      ? "bg-red-500/10"
                      : "bg-purple-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <service.icon
                      className={`h-5 w-5 ${
                        service.color === "green"
                          ? "text-green-400"
                          : service.color === "yellow"
                          ? "text-yellow-400"
                          : service.color === "red"
                          ? "text-red-400"
                          : "text-purple-400"
                      }`}
                    />
                    <span className="font-medium text-white">
                      {service.name}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full tracking-wider ${
                      service.color === "green"
                        ? "bg-green-500/20 text-green-400"
                        : service.color === "yellow"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : service.color === "red"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {service.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="font-bold text-white mb-4 tracking-wider">
                RECENT OPERATIONS
              </h3>
              <div className="space-y-3">
                {[
                  {
                    action: "SECURITY CLEARANCE GRANTED",
                    time: "2 MIN AGO",
                    level: "HIGH",
                  },
                  {
                    action: "SYSTEM SCAN COMPLETED",
                    time: "15 MIN AGO",
                    level: "MEDIUM",
                  },
                  {
                    action: "DATA BACKUP SECURED",
                    time: "1 HOUR AGO",
                    level: "HIGH",
                  },
                  {
                    action: "OPERATOR CREATED",
                    time: "YESTERDAY",
                    level: "CRITICAL",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.level === "HIGH"
                            ? "bg-red-500"
                            : activity.level === "CRITICAL"
                            ? "bg-red-500 animate-pulse"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <span className="text-gray-300">{activity.action}</span>
                    </div>
                    <span className="text-gray-500 font-mono">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Controls */}
        <div
          className={`mt-8 p-6 rounded-xl border backdrop-blur-lg ${
            dangerMode
              ? "bg-gray-900/90 border-red-500/30"
              : "bg-gray-900/80 border-gray-700"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded">
              <Radiation className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-wider">
                EMERGENCY CONTROLS
              </h2>
              <p className="text-gray-400 text-sm font-mono">
                CRITICAL SYSTEM COMMANDS - USE WITH EXTREME CAUTION
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "🚨 INITIATE SYSTEM WIPE?\nThis will delete all data."
                  )
                ) {
                  toast.error("💀 SYSTEM WIPE INITIATED");
                }
              }}
              className="p-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-bold tracking-wider transition-all hover:scale-105"
            >
              💀 SYSTEM WIPE
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "🚨 ACTIVATE SILENT ALARM?\nThis will notify authorities."
                  )
                ) {
                  toast.warning("🚨 SILENT ALARM ACTIVATED");
                }
              }}
              className="p-4 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/30 rounded-lg font-bold tracking-wider transition-all hover:scale-105"
            >
              🚨 SILENT ALARM
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "🚨 ENGAGE DATA ENCRYPTION?\nThis will lock all system data."
                  )
                ) {
                  toast.info("🔒 DATA ENCRYPTION ENGAGED");
                }
              }}
              className="p-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg font-bold tracking-wider transition-all hover:scale-105"
            >
              🔒 DATA ENCRYPTION
            </button>
            <button
              onClick={emergencySystemWipe}
              className="p-4 bg-gradient-to-r from-red-600/20 to-black/20 hover:from-red-600/30 hover:to-black/30 text-white border border-red-500/50 rounded-lg font-bold tracking-wider transition-all hover:scale-105 animate-pulse"
            >
              ☢️ EMERGENCY OVERRIDE
            </button>
          </div>
        </div>
      </main>

      {/* Add Admin Modal - Enhanced */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-xl shadow-2xl w-full max-w-lg ${
              dangerMode
                ? "border border-red-500/50 bg-gray-900/95"
                : "border border-gray-700 bg-gray-900/90"
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3
                    className={`text-xl font-bold tracking-wider ${
                      dangerMode ? "text-red-400" : "text-white"
                    }`}
                  >
                    CREATE QUANTUM OPERATOR
                  </h3>
                  <p className="text-gray-400 text-sm font-mono">
                    SECURITY CLEARANCE REQUIRED
                  </p>
                </div>
                <button
                  onClick={() => setShowAddAdminModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {backendStatus === "offline" && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400 font-mono">
                    ⚠️ MAINFRAME OFFLINE - Operator creation will not work
                  </p>
                </div>
              )}

              {systemLockdown && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 font-mono animate-pulse">
                    🔒 SYSTEM LOCKDOWN - Operator creation disabled
                  </p>
                </div>
              )}

              <form onSubmit={handleCreateAdmin}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                      OPERATOR NAME *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserPlus className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        required
                        value={newAdmin.fullName}
                        onChange={(e) =>
                          setNewAdmin({ ...newAdmin, fullName: e.target.value })
                        }
                        className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                        placeholder="ENTER OPERATOR NAME"
                        disabled={systemLockdown || backendStatus === "offline"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                      QUANTUM IDENTIFIER *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileTerminal className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="email"
                        required
                        value={newAdmin.email}
                        onChange={(e) =>
                          setNewAdmin({ ...newAdmin, email: e.target.value })
                        }
                        className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                        placeholder="OPERATOR@SYSTEM.COM"
                        disabled={systemLockdown || backendStatus === "offline"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                      SECURITY CODE *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={newAdmin.mobile}
                        onChange={(e) =>
                          setNewAdmin({ ...newAdmin, mobile: e.target.value })
                        }
                        className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                        placeholder="0000000000"
                        pattern="[6-9]\d{9}"
                        disabled={systemLockdown || backendStatus === "offline"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                      CLEARANCE LEVEL *
                    </label>
                    <select
                      value={newAdmin.role}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, role: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                      disabled={systemLockdown || backendStatus === "offline"}
                    >
                      <option value="accountVerifier">IDENTITY COMMAND</option>
                      <option value="cashier">VAULT OPERATIONS</option>
                      <option value="cardManager">SECURITY CARDS</option>
                      <option value="superAdmin">OMEGA CONTROL</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {newAdmin.role === "superAdmin"
                        ? "FULL SYSTEM ACCESS - QUANTUM CLEARANCE"
                        : newAdmin.role === "accountVerifier"
                        ? "IDENTITY VERIFICATION - LEVEL 3"
                        : newAdmin.role === "cashier"
                        ? "FINANCIAL OPERATIONS - LEVEL 2"
                        : "CARD SECURITY - LEVEL 2"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                      QUANTUM KEY *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Fingerprint className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newAdmin.password}
                        onChange={(e) =>
                          setNewAdmin({ ...newAdmin, password: e.target.value })
                        }
                        className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10 font-mono"
                        placeholder="••••••••"
                        minLength={8}
                        disabled={systemLockdown || backendStatus === "offline"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">
                      CONFIRM QUANTUM KEY *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-500" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={newAdmin.confirmPassword}
                        onChange={(e) =>
                          setNewAdmin({
                            ...newAdmin,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10 font-mono"
                        placeholder="••••••••"
                        minLength={8}
                        disabled={systemLockdown || backendStatus === "offline"}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddAdminModal(false)}
                    className="px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 font-bold transition-all"
                  >
                    ABORT
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 font-bold transition-all shadow ${
                      systemLockdown || backendStatus === "offline"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={systemLockdown || backendStatus === "offline"}
                  >
                    {systemLockdown
                      ? "LOCKDOWN ACTIVE"
                      : backendStatus === "offline"
                      ? "MAINFRAME OFFLINE"
                      : "CREATE OPERATOR"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
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
          background: ${
            dangerMode ? "rgba(220, 38, 38, 0.5)" : "rgba(139, 92, 246, 0.5)"
          };
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${
            dangerMode ? "rgba(220, 38, 38, 0.7)" : "rgba(139, 92, 246, 0.7)"
          };
        }

        /* Danger cursor */
        .cursor-crosshair {
          cursor: ${
            dangerMode
              ? 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="%23ff0000" stroke-width="3"/><path d="M8,8 L24,24 M8,24 L24,8" stroke="%23ff0000" stroke-width="3"/></svg>\'), crosshair'
              : "crosshair"
          } !important;
        }

        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
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

export default SuperAdminDashboard;
