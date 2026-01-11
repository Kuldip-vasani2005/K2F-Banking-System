import React, { useState, useEffect, useRef } from "react";
import { userAPI, applicationAPI, bankAccountAPI } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CreditCard,
  TrendingUp,
  Wallet,
  Clock,
  FileText,
  DollarSign,
  Shield,
  Smartphone,
  Users,
  CheckCircle,
  AlertCircle,
  Download,
  Bell,
  Settings,
  HelpCircle,
  PieChart,
  BarChart3,
  LineChart,
  ChevronRight,
  Sparkles,
  Target,
  Zap,
  Globe,
  Lock,
  Award,
  Home,
  BanknoteIcon,
  ChartNoAxesCombined,
  Globe2,
  Cpu,
  ShieldCheck,
  ZapIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Text, useTexture } from "@react-three/drei";
import { MeshWobbleMaterial, Float } from "@react-three/drei";

// Import enhanced chart components
import BalanceTrendChart from "../components/charts/BalanceTrendChart";
import TransactionCategoryChart from "../components/charts/TransactionCategoryChart";
import MonthlyComparisonChart from "../components/charts/MonthlyComparisonChart";
import AccountPerformanceChart from "../components/charts/AccountPerformanceChart";
import InteractiveBalanceChart from "../components/charts/InteractiveBalanceChart";

// 3D Card Component
const ThreeDCard = ({ rotation = [0, 0, 0], position = [0, 0, 0], children }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[3.5, 2, 0.2]} />
      <MeshWobbleMaterial factor={0.2} speed={1} color="#0ea5e9" />
      {children}
    </mesh>
  );
};

// 3D Coin Component
const ThreeDCoin = ({ position = [0, 0, 0] }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} castShadow>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        <Text
          position={[0, 0.11, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ₹
        </Text>
      </mesh>
    </Float>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("balance");
  const [timeRange, setTimeRange] = useState("month");
  const [notifications, setNotifications] = useState(3);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [is3DView, setIs3DView] = useState(false);
  const [parallaxEffect, setParallaxEffect] = useState(0);
  const dashboardRef = useRef(null);

  const [stats, setStats] = useState({
    totalBalance: 1250000,
    activeAccounts: 0,
    pendingApplications: 0,
    monthlyGrowth: 12.5,
    savingsGoal: 65,
    creditScore: 780,
  });
  const navigate = useNavigate();

  // Track mouse for parallax and 3D effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Calculate parallax effect
      if (dashboardRef.current) {
        const rect = dashboardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const offsetX = (e.clientX - centerX) / centerX;
        const offsetY = (e.clientY - centerY) / centerY;
        setParallaxEffect(Math.max(Math.abs(offsetX), Math.abs(offsetY)) * 20);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate tilt based on mouse position for 3D effect
  const calculateTilt = (cardIndex = 0) => {
    if (!is3DView) return { x: 0, y: 0 };
    
    const sensitivity = hoveredCard === cardIndex ? 15 : 10;
    const x = (mousePosition.x / window.innerWidth - 0.5) * sensitivity;
    const y = (mousePosition.y / window.innerHeight - 0.5) * sensitivity;
    
    return { x, y };
  };

  // Animation variants
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
    hidden: { y: 40, opacity: 0, rotateX: -10 },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cardHoverVariants = {
    rest: { 
      scale: 1, 
      y: 0,
      rotateX: 0,
      rotateY: 0,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
    },
    hover: { 
      scale: 1.05, 
      y: -15,
      rotateX: calculateTilt().y * 0.5,
      rotateY: calculateTilt().x * 0.5,
      boxShadow: "0 25px 50px rgba(14, 165, 233, 0.4)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
  };

  const floatingAnimation = {
    y: ["0%", "-3%", "0%"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile
      const userResponse = await userAPI.getProfile();
      if (userResponse.data.success) {
        setUser(userResponse.data);
      }

      // Fetch applications
      try {
        const appResponse = await applicationAPI.getUserApplications();
        if (appResponse.data.success) {
          const allApplications = appResponse.data.applications || [];
          const activeApplications = allApplications.filter(
            (app) =>
              app.status !== "verified" &&
              app.status !== "approved" &&
              app.status !== "rejected"
          );
          setApplications(activeApplications);
          setStats((prev) => ({
            ...prev,
            pendingApplications: activeApplications.length,
          }));
        }
      } catch (appError) {
        console.warn("Could not fetch applications:", appError.message);
        setApplications([]);
      }

      // Fetch accounts
      try {
        const accountsResponse = await bankAccountAPI.getMyAccounts();
        if (accountsResponse.data.success) {
          setAccounts(accountsResponse.data.accounts || []);
          const totalBalance = accountsResponse.data.accounts.reduce(
            (sum, account) => sum + (account.balance || 0),
            0
          );
          const activeAccounts = accountsResponse.data.accounts.filter(
            (acc) => acc.status === "active"
          ).length;
          setStats((prev) => ({
            ...prev,
            totalBalance,
            activeAccounts,
          }));
        }
      } catch (accountsError) {
        console.warn("Could not fetch accounts:", accountsError.message);
        setAccounts([]);
      }

      // Fetch recent transactions
      try {
        const transactionsResponse = await bankAccountAPI.getRecentTransactions();
        if (transactionsResponse.data.success) {
          setRecentTransactions(transactionsResponse.data.transactions || []);
        }
      } catch (transactionsError) {
        console.warn("Could not fetch recent transactions:", transactionsError.message);
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatCurrencyDetailed = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Document Submitted":
      case "identity-info-completed":
        return "bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600";
      case "personal-info-completed":
        return "bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600";
      case "started":
        return "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600";
      case "verified":
        return "bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600";
      case "rejected":
        return "bg-gradient-to-br from-red-500 via-pink-500 to-red-600";
      default:
        return "bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700";
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
        return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case "debit":
        return <ArrowRight className="w-6 h-6 text-red-400" />;
      default:
        return <CreditCard className="w-6 h-6 text-blue-400" />;
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center relative">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-24 h-24 mx-auto relative"
          >
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full" />
            <div className="absolute inset-6 border-2 border-cyan-400/50 rounded-full animate-ping" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
            className="mt-8 text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
          >
            Initializing Financial Universe...
          </motion.p>
          <div className="mt-4 w-64 h-1 bg-gray-700 rounded-full overflow-hidden mx-auto">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={dashboardRef}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-x-hidden relative"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Animated 3D Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Floating particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, Math.random() * -100],
              x: [null, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        
        {/* Grid lines for depth */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 95%, rgba(14, 165, 233, 0.1) 100%),
            linear-gradient(0deg, transparent 95%, rgba(168, 85, 247, 0.1) 100%)
          `,
          backgroundSize: '50px 50px',
          transform: 'translateZ(-100px)'
        }} />
      </div>

      {/* 3D Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIs3DView(!is3DView)}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-2xl backdrop-blur-xl border ${
          is3DView 
            ? 'bg-gradient-to-br from-cyan-500 to-blue-500 border-cyan-400/50' 
            : 'bg-gray-900/80 border-gray-700/50'
        } transition-all duration-300`}
      >
        {is3DView ? (
          <Globe2 className="w-6 h-6 text-white" />
        ) : (
          <Cpu className="w-6 h-6 text-cyan-300" />
        )}
      </motion.button>

      <div className="container mx-auto px-6 pt-6 pb-8 relative z-10">
        {/* Welcome Section with 3D Effect */}
        <motion.div 
          variants={itemVariants}
          className="mb-12 relative"
          style={{
            transform: `translateZ(${parallaxEffect}px)`,
          }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between relative">
            {/* Background Glow */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl -z-10" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30 mb-6 backdrop-blur-xl"
              >
                <Sparkles className="w-5 h-5 text-cyan-300 mr-3" />
                <span className="text-sm font-semibold text-cyan-300">
                  WELCOME TO FUTURE BANKING
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Hello, {user?.fullName || "Investor"}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-gray-400 max-w-3xl leading-relaxed"
              >
                Your financial dashboard just transformed into a{" "}
                <span className="text-cyan-300 font-semibold">3D experience</span>. 
                Navigate your wealth with futuristic insights and real-time analytics.
              </motion.p>
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="mt-8 lg:mt-0 relative"
            >
              {/* 3D Card Visual */}
              <div className="relative w-64 h-48">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 rounded-3xl transform rotate-6 opacity-80 blur-xl" />
                <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50 shadow-2xl h-full flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm flex items-center justify-center mr-4">
                      <ZapIcon className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">READY FOR</p>
                      <p className="text-xl font-bold text-white">3D Mode</p>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mb-3" />
                  <p className="text-sm text-gray-400">
                    Experience banking in a whole new dimension
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Stats Grid with Enhanced 3D */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
        >
          {/* Total Balance Card - Enhanced 3D */}
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            onHoverStart={() => setHoveredCard(0)}
            onHoverEnd={() => setHoveredCard(null)}
            className="relative group lg:col-span-2"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${calculateTilt(0).x}deg) rotateX(${-calculateTilt(0).y}deg)`,
            }}
          >
            {/* 3D Depth Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-4xl transform translate-z-[-20px] opacity-80 blur-xl group-hover:translate-z-[-30px] transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-500 rounded-4xl transform translate-z-[-10px] opacity-40 blur-lg" />
            
            <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-4xl p-10 border border-gray-700/50 shadow-2xl">
              {/* Animated Border */}
              <div className="absolute inset-0 rounded-4xl p-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-[2px]">
                <div className="bg-gray-900/95 rounded-4xl h-full w-full" />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-8">
                      <motion.div
                        animate={floatingAnimation}
                        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-sm flex items-center justify-center mr-6 border border-blue-500/30 shadow-2xl"
                      >
                        <Wallet className="w-10 h-10 text-cyan-300" />
                      </motion.div>
                      <div>
                        <p className="text-gray-400 text-sm font-medium tracking-wider">
                          TOTAL WEALTH
                        </p>
                        <div className="flex items-baseline">
                          <span className="text-5xl lg:text-7xl font-bold mt-2 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                            ₹
                            <CountUp
                              end={stats.totalBalance}
                              separator=","
                              duration={3.5}
                            />
                          </span>
                          <motion.span 
                            whileHover={{ scale: 1.1 }}
                            className="ml-4 px-4 py-2 bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 text-emerald-300 text-sm font-semibold rounded-2xl flex items-center border border-emerald-500/30"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            +{stats.monthlyGrowth}%
                          </motion.span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-12">
                      <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                        <p className="text-gray-400 text-sm mb-2">ACTIVE ACCOUNTS</p>
                        <div className="flex items-center">
                          <p className="text-3xl font-bold text-white">{stats.activeAccounts}</p>
                          <div className="ml-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-cyan-300" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                        <p className="text-gray-400 text-sm mb-2">CREDIT SCORE</p>
                        <div className="flex items-center">
                          <p className="text-3xl font-bold text-white">{stats.creditScore}</p>
                          <div className="ml-4">
                            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                              Excellent
                            </div>
                            <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "78%" }}
                                transition={{ duration: 2 }}
                                className="h-full bg-gradient-to-r from-emerald-400 to-green-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Savings Goal with 3D Progress */}
                  <div className="mt-8 md:mt-0 md:ml-8">
                    <div className="p-8 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-gray-400 text-sm">SAVINGS GOAL</p>
                          <p className="text-2xl font-bold text-white">{stats.savingsGoal}%</p>
                        </div>
                        <Target className="w-8 h-8 text-cyan-300" />
                      </div>
                      
                      {/* 3D Progress Ring */}
                      <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 rounded-full border-8 border-gray-700/50" />
                        <motion.div
                          initial={{ strokeDashoffset: 440 }}
                          animate={{ strokeDashoffset: 440 - (440 * stats.savingsGoal) / 100 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="absolute inset-0 rounded-full border-8 border-transparent border-t-cyan-400 border-r-blue-500"
                          style={{
                            strokeDasharray: 440,
                            transform: 'rotate(-90deg)',
                            transformOrigin: 'center'
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {stats.savingsGoal}%
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-center text-gray-400 text-sm mt-6">
                        ₹4,87,500 of ₹7,50,000
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats with 3D Cards */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 gap-6"
          >
            {[
              {
                title: "Recent Transactions",
                value: recentTransactions.length,
                change: "+8.2%",
                icon: <Clock className="w-7 h-7" />,
                color: "from-emerald-500 to-green-400",
                bgColor: "bg-emerald-500/10",
                borderColor: "border-emerald-500/30",
              },
              {
                title: "Pending Applications",
                value: stats.pendingApplications,
                change: "Review needed",
                icon: <FileText className="w-7 h-7" />,
                color: "from-amber-500 to-orange-400",
                bgColor: "bg-amber-500/10",
                borderColor: "border-amber-500/30",
              },
              {
                title: "Monthly Growth",
                value: `${stats.monthlyGrowth}%`,
                change: "+2.1% from last month",
                icon: <TrendingUp className="w-7 h-7" />,
                color: "from-purple-500 to-violet-400",
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-500/30",
              },
              {
                title: "Quick Actions",
                value: "12+",
                change: "Available",
                icon: <Zap className="w-7 h-7" />,
                color: "from-cyan-500 to-blue-400",
                bgColor: "bg-cyan-500/10",
                borderColor: "border-cyan-500/30",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                onHoverStart={() => setHoveredCard(index + 1)}
                onHoverEnd={() => setHoveredCard(null)}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${calculateTilt(index + 1).x}deg) rotateX(${-calculateTilt(index + 1).y}deg)`,
                }}
                className={`relative rounded-3xl p-6 border backdrop-blur-xl shadow-xl cursor-pointer group ${stat.bgColor} ${stat.borderColor}`}
              >
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />
                
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-3 tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-white mb-2">
                      {stat.value}
                    </p>
                    <p className="text-gray-500 text-sm">{stat.change}</p>
                  </div>
                  <motion.div
                    animate={floatingAnimation}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-2xl border ${stat.borderColor}`}
                  >
                    {stat.icon}
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="mt-6 pt-4 border-t border-gray-700/50"
                >
                  <div className="flex items-center text-sm text-gray-400 group-hover:text-white transition-colors">
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Interactive Chart Section with 3D View */}
        <motion.div variants={itemVariants} className="mb-12">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-4xl p-10 border border-gray-700/50 shadow-2xl backdrop-blur-xl"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10">
              <div className="relative">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                  3D Financial Insights
                </h2>
                <p className="text-gray-400 text-lg">
                  Interactive 3D analytics and trend visualization
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-6 lg:mt-0">
                {/* 3D View Toggle */}
                <div className="flex bg-gray-800/50 rounded-2xl p-1 backdrop-blur-sm">
                  {["balance", "spending", "performance"].map((tab) => (
                    <motion.button
                      key={tab}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveChart(tab)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                        activeChart === tab
                          ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </motion.button>
                  ))}
                </div>

                {/* Time Range Selector */}
                <div className="flex bg-gray-800/50 rounded-2xl p-1 backdrop-blur-sm">
                  {["week", "month", "year"].map((range) => (
                    <motion.button
                      key={range}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 text-sm font-medium capitalize rounded-xl ${
                        timeRange === range
                          ? "bg-gray-700/80 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {range}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Chart Area with 3D Background */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 p-8 border border-gray-700/30">
              {/* Grid pattern background */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `
                  linear-gradient(90deg, transparent 95%, rgba(14, 165, 233, 0.2) 100%),
                  linear-gradient(0deg, transparent 95%, rgba(168, 85, 247, 0.2) 100%)
                `,
                backgroundSize: '40px 40px',
              }} />
              
              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Main Interactive Chart */}
                  <div className="lg:col-span-2">
                    <div className="h-[400px] relative">
                      <InteractiveBalanceChart
                        timeRange={timeRange}
                        transactions={recentTransactions}
                        accounts={accounts}
                        is3D={is3DView}
                      />
                    </div>
                  </div>

                  {/* Side Charts */}
                  <div className="space-y-8">
                    <div className="h-[280px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mr-4">
                          <PieChart className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Spending Categories</h3>
                      </div>
                      <TransactionCategoryChart transactions={recentTransactions} is3D={is3DView} />
                    </div>

                    <div className="h-[280px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-4">
                          <ChartNoAxesCombined className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Account Performance</h3>
                      </div>
                      <AccountPerformanceChart accounts={accounts} is3D={is3DView} />
                    </div>
                  </div>

                  {/* Bottom Chart */}
                  <div className="h-[320px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-6 border border-gray-700/30">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mr-4">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Monthly Comparison</h3>
                    </div>
                    <MonthlyComparisonChart transactions={recentTransactions} is3D={is3DView} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 3D Action Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12"
        >
          {/* Quick Actions in 3D */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-4xl p-10 border border-gray-700/50 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                    3D Quick Actions
                  </h2>
                  <p className="text-gray-400 text-lg">
                    Hover and interact with 3D banking features
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                  <Zap className="w-8 h-8 text-cyan-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  {
                    icon: <ArrowRight className="w-8 h-8" />,
                    title: "Send Money",
                    color: "from-blue-500 to-cyan-400",
                    description: "Instant transfer",
                  },
                  {
                    icon: <DollarSign className="w-8 h-8" />,
                    title: "Pay Bills",
                    color: "from-emerald-500 to-green-400",
                    description: "Auto payments",
                  },
                  {
                    icon: <TrendingUp className="w-8 h-8" />,
                    title: "Invest",
                    color: "from-purple-500 to-violet-400",
                    description: "Grow wealth",
                  },
                  {
                    icon: <Shield className="w-8 h-8" />,
                    title: "Security",
                    color: "from-amber-500 to-orange-400",
                    description: "Protect assets",
                  },
                  {
                    icon: <Smartphone className="w-8 h-8" />,
                    title: "Mobile",
                    color: "from-pink-500 to-rose-400",
                    description: "App features",
                  },
                  {
                    icon: <Users className="w-8 h-8" />,
                    title: "Support",
                    color: "from-cyan-500 to-blue-400",
                    description: "24/7 help",
                  },
                  {
                    icon: <Download className="w-8 h-8" />,
                    title: "Statements",
                    color: "from-indigo-500 to-purple-400",
                    description: "Download PDFs",
                  },
                  {
                    icon: <CreditCard className="w-8 h-8" />,
                    title: "Cards",
                    color: "from-teal-500 to-emerald-400",
                    description: "Manage cards",
                  },
                ].map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.08, y: -8, rotateY: 5 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                    className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 text-center border border-gray-700/50 hover:border-cyan-500/30 transition-all shadow-xl hover:shadow-2xl"
                  >
                    {/* 3D Depth Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} rounded-3xl transform translate-z-[-10px] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />
                    
                    <motion.div
                      whileHover={{ rotateY: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-3xl transition-shadow border border-white/10`}
                    >
                      {action.icon}
                    </motion.div>
                    
                    <div>
                      <p className="font-semibold text-xl text-white group-hover:text-cyan-300 transition-colors mb-2">
                        {action.title}
                      </p>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300">
                        {action.description}
                      </p>
                    </div>
                    
                    {/* 3D Indicator */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Recent Activity with 3D Timeline */}
          <motion.div variants={itemVariants}>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-4xl p-10 border border-gray-700/50 shadow-2xl backdrop-blur-xl h-full"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                    3D Timeline
                  </h2>
                  <p className="text-gray-400 text-lg">
                    Real-time transaction flow
                  </p>
                </div>
                <Clock className="w-10 h-10 text-cyan-300" />
              </div>

              <div className="space-y-6">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-700/50">
                      <Clock className="w-12 h-12 text-gray-500" />
                    </div>
                    <p className="text-gray-500 text-lg">No recent activity</p>
                  </div>
                ) : (
                  <>
                    {recentTransactions.slice(0, 5).map((transaction, index) => (
                      <motion.div
                        key={transaction._id}
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 10 }}
                        className="relative group"
                      >
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/30 to-blue-500/30" />
                        
                        <div className="flex items-center justify-between p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-3xl border border-gray-700/50 hover:border-cyan-500/30 transition-all cursor-pointer ml-10">
                          <div className="flex items-center">
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-6 ${
                                transaction.type === "credit"
                                  ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30"
                                  : "bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30"
                              }`}
                            >
                              {getTransactionIcon(transaction.type)}
                            </motion.div>
                            <div>
                              <p className="font-semibold text-lg text-white">
                                {transaction.description?.substring(0, 20) ||
                                  "Transaction"}
                              </p>
                              <p className="text-sm text-gray-400">
                                {getTimeAgo(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold text-xl ${
                                transaction.type === "credit"
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {transaction.type === "credit" ? "+" : "-"}
                              {formatCurrencyDetailed(transaction.amount)}
                            </p>
                            <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-300 border border-gray-600/50">
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Premium 3D Banner */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-4xl mb-12 group"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Animated Background */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[size:200%_200%]"
          />
          
          {/* 3D Grid Overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 95%, rgba(255, 255, 255, 0.1) 100%),
              linear-gradient(0deg, transparent 95%, rgba(255, 255, 255, 0.1) 100%)
            `,
            backgroundSize: '60px 60px',
          }} />
          
          <div className="relative p-16">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="lg:w-2/3 mb-12 lg:mb-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full mb-8 backdrop-blur-sm border border-white/30"
                >
                  <Award className="w-6 h-6 text-white mr-3" />
                  <span className="text-lg font-semibold">ELITE 3D EXPERIENCE</span>
                </motion.div>
                
                <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                    Enter the Future of Banking
                  </span>
                </h2>
                
                <p className="text-blue-100 text-xl mb-12 max-w-3xl leading-relaxed">
                  Experience banking like never before with our exclusive 3D interface, 
                  real-time holographic insights, and AI-powered financial guidance.
                </p>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { text: "Holographic analytics", icon: <Globe className="w-5 h-5" /> },
                    { text: "AI investment advisor", icon: <Cpu className="w-5 h-5" /> },
                    { text: "Quantum encryption", icon: <Lock className="w-5 h-5" /> },
                    { text: "3D portfolio viewer", icon: <ChartNoAxesCombined className="w-5 h-5" /> },
                    { text: "VR banking access", icon: <Globe2 className="w-5 h-5" /> },
                    { text: "Smart contract integration", icon: <ShieldCheck className="w-5 h-5" /> },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 10 }}
                      className="flex items-center"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4">
                        {feature.icon}
                      </div>
                      <span className="text-blue-100 font-medium">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  boxShadow: "0 25px 50px rgba(255, 255, 255, 0.2)"
                }}
                whileTap={{ scale: 0.95 }}
                className="relative px-12 py-6 bg-white text-blue-600 font-bold rounded-3xl text-xl hover:shadow-2xl transition-shadow group"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center">
                  Activate 3D Mode
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 3D Floating Elements Preview */}
        {is3DView && (
          <div className="fixed inset-0 pointer-events-none -z-10">
            <Canvas
              camera={{ position: [0, 0, 15], fov: 50 }}
              style={{ position: 'fixed' }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <ThreeDCoin position={[-10, 5, 0]} />
              <ThreeDCoin position={[10, -5, 2]} />
              <ThreeDCoin position={[-5, -8, -2]} />
              <ThreeDCard position={[8, 8, 0]} rotation={[0.2, 0.4, 0]} />
              <ThreeDCard position={[-8, -2, 1]} rotation={[-0.3, 0.6, 0]} />
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>
        )}
      </div>

      {/* 3D Animated Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-t border-gray-700/50 bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-2xl"
      >
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <motion.div
                whileHover={{ rotate: 360 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-2xl"
              >
                <span className="text-xl font-bold">Z</span>
              </motion.div>
              <div>
                <span className="text-lg font-semibold text-gray-300">
                  K2F Quantum Bank
                </span>
                <p className="text-sm text-gray-500">Banking in 3D • Future Ready</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {["Privacy", "Security", "Terms", "Help", "Contact"].map((item, index) => (
                <motion.button
                  key={item}
                  whileHover={{ y: -2, color: "#22d3ee" }}
                  className="text-gray-400 hover:text-cyan-300 transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300" />
                </motion.button>
              ))}
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 tracking-wider">
              ••• PROTECTED BY QUANTUM ENCRYPTION ••• ISO 27001 CERTIFIED ••• MEMBER FDIC •••
            </p>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
};

export default Dashboard;