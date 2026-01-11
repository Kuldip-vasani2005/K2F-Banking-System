import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bankAccountAPI, applicationAPI } from "../../services/api";
import { motion } from "framer-motion";
import {
  CreditCard,
  Plus,
  Send,
  Download,
  FileText,
  ArrowRight,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BanknoteIcon,
  Shield,
  Smartphone,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  ExternalLink,
  History,
  Settings,
  QrCode,
  Globe,
  Zap,
} from "lucide-react";

const AccountsDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasApplication, setHasApplication] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalAccounts: 0,
    activeAccounts: 0,
    monthlyGrowth: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const navigate = useNavigate();

  const primaryAccountId =
    accounts.find((acc) => acc.status === "active")?._id || accounts[0]?._id;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch accounts
      const accountsResponse = await bankAccountAPI.getMyAccounts();
      if (accountsResponse.data.success) {
        const accountsData = accountsResponse.data.accounts || [];
        setAccounts(accountsData);

        // Calculate stats
        const totalBalance = accountsData.reduce(
          (sum, acc) => sum + (acc.balance || 0),
          0
        );
        const activeAccounts = accountsData.filter(
          (acc) => acc.status === "active"
        ).length;

        setStats({
          totalBalance,
          totalAccounts: accountsData.length,
          activeAccounts,
          monthlyGrowth: 12.5, // This could be calculated from transaction history
        });
      }

      // Fetch recent transactions for all accounts
      try {
        const transactionsResponse =
          await bankAccountAPI.getRecentTransactions();
        if (transactionsResponse.data.success) {
          setRecentTransactions(
            transactionsResponse.data.transactions?.slice(0, 5) || []
          );
        }
      } catch (txnError) {
        console.warn("Could not fetch recent transactions:", txnError);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.response?.data?.message || "Failed to load data");
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
    }).format(amount);
  };

  const formatCurrencyDetailed = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
        );
      case "debit":
        return (
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
        );
    }
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -8 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-gray-300 font-medium text-lg"
          >
            Loading your financial dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-cyan-500/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 pt-0 pb-8 relative z-10">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                      My Accounts
                    </span>
                  </h1>
                  <p className="text-gray-400 text-lg mt-2">
                    Manage your bank accounts and financial journey
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 lg:mt-0 flex items-center space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBalance(!showBalance)}
                className="group relative px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 font-medium rounded-xl overflow-hidden hover:bg-gray-700/50 transition-all"
              >
                <div className="flex items-center">
                  {showBalance ? (
                    <>
                      <EyeOff className="w-5 h-5 mr-2" />
                      <span>Hide Balance</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 mr-2" />
                      <span>Show Balance</span>
                    </>
                  )}
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh
                </div>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-3xl transform group-hover:rotate-1 transition-transform duration-300" />
            <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    TOTAL BALANCE
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {showBalance
                      ? formatCurrency(stats.totalBalance)
                      : "••••••••"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <BanknoteIcon className="w-6 h-6 text-cyan-300" />
                </div>
              </div>
              <div className="flex items-center text-emerald-400 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>+{stats.monthlyGrowth}% this month</span>
              </div>
            </div>
          </motion.div>

          {[
            {
              title: "Total Accounts",
              value: stats.totalAccounts,
              icon: <CreditCard className="w-6 h-6" />,
              color: "from-emerald-500 to-green-400",
              change: `${stats.activeAccounts} active`,
            },
            {
              title: "Active Accounts",
              value: stats.activeAccounts,
              icon: <CheckCircle className="w-6 h-6" />,
              color: "from-purple-500 to-violet-400",
              change: `${Math.round(
                (stats.activeAccounts / stats.totalAccounts) * 100
              )}% rate`,
            },
            {
              title: "Account Growth",
              value: `${stats.monthlyGrowth}%`,
              icon: <TrendingUp className="w-6 h-6" />,
              color: "from-amber-500 to-orange-400",
              change: "+2.1% from last month",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-2">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-gray-500 text-sm">{stat.change}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                >
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Quick Actions
                </h2>
                <p className="text-gray-400">
                  Frequently used banking features
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-300" />
                <span className="text-sm text-cyan-300">Instant Access</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  icon: <Plus className="w-8 h-8" />,
                  title: "Open Account",
                  description: "Start new account application",
                  color: "from-blue-500 to-cyan-400",
                  link: "/accounts/open",
                  glow: true,
                },
                {
                  icon: <Send className="w-8 h-8" />,
                  title: "Send Money",
                  description: "Transfer funds instantly",
                  color: "from-emerald-500 to-green-400",
                  link: "/accounts/transfer",
                },
                {
                  icon: <Download className="w-8 h-8" />,
                  title: "Statements",
                  description: "Download account statements",
                  color: "from-purple-500 to-violet-400",
                  link: primaryAccountId
                    ? `/accounts/${primaryAccountId}/transactions`
                    : "/accounts",
                },
                {
                  icon: <QrCode className="w-8 h-8" />,
                  title: "UPI Payments",
                  description: "Scan & pay instantly",
                  color: "from-amber-500 to-orange-400",
                  link: "#",
                },
              ].map((action, index) => (
                <motion.div
                  key={index}
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <Link
                    to={action.link}
                    className="block bg-gray-800/50 rounded-2xl p-6 text-center border border-gray-700/50 hover:border-cyan-500/30 transition-all group"
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                        action.color
                      } flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow ${
                        action.glow ? "shadow-cyan-500/25" : ""
                      }`}
                    >
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">
                      {action.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Accounts List */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-4">
                    <CreditCard className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Your Accounts
                    </h2>
                    <p className="text-gray-400">
                      All your bank accounts in one place
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {accounts.length} account{accounts.length !== 1 ? "s" : ""}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-red-400" />
                    <p className="text-red-400">{error}</p>
                  </div>
                </motion.div>
              )}

              {accounts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Accounts Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start your banking journey with your first account
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/accounts/open")}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 flex items-center gap-3 mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    Open Your First Account
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account, index) => (
                    <motion.div
                      key={account._id}
                      variants={cardHoverVariants}
                      initial="rest"
                      whileHover="hover"
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => navigate(`/accounts/${account._id}`)}
                      className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-4">
                            <CreditCard className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                                {account.accountType === "saving"
                                  ? "Savings Account"
                                  : "Current Account"}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  account.status === "active"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-yellow-500/20 text-yellow-300"
                                }`}
                              >
                                {account.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="font-mono">
                                {account.accountNumber}
                              </span>
                              <span>•</span>
                              <span>{account.ifsc}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {showBalance
                              ? formatCurrencyDetailed(account.balance)
                              : "••••••••"}
                          </p>
                          <div className="flex items-center justify-end gap-4 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(account.accountNumber);
                              }}
                              className="text-sm text-gray-400 hover:text-cyan-300 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity & Features */}
          <motion.div variants={itemVariants}>
            <div className="space-y-8">
              {/* Recent Transactions */}
              {recentTransactions.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                        <History className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">
                          Recent Activity
                        </h3>
                        <p className="text-sm text-gray-400">
                          Latest transactions
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/accounts/transactions"
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {recentTransactions.map((txn, index) => (
                      <div
                        key={txn._id}
                        onClick={() =>
                          navigate(`/accounts/${txn.accountId}/transactions`)
                        }
                        className="p-3 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(txn.type)}
                            <div>
                              <p className="font-medium text-white text-sm">
                                {txn.description?.substring(0, 20) ||
                                  "Transaction"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(txn.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-bold ${
                                txn.type === "credit"
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {txn.type === "credit" ? "+" : "-"}
                              {formatCurrencyDetailed(txn.amount)}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                txn.status === "success"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-red-500/20 text-red-300"
                              }`}
                            >
                              {txn.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Banking Features */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Banking Features</h3>
                    <p className="text-sm text-gray-400">Premium services</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">
                        Account Security
                      </p>
                      <p className="text-xs text-gray-400">
                        256-bit encryption
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">
                        Mobile Banking
                      </p>
                      <p className="text-xs text-gray-400">App & SMS alerts</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">
                        Global Access
                      </p>
                      <p className="text-xs text-gray-400">
                        Worldwide transactions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">
                        24/7 Support
                      </p>
                      <p className="text-xs text-gray-400">
                        Always here to help
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Banner */}
              <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-amber-700/20 via-yellow-600/20 to-amber-800/20 border border-amber-500/30">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                    <div>
                      <h3 className="font-bold text-amber-200">
                        Upgrade to Premium
                      </h3>
                      <p className="text-sm text-amber-300/80">
                        Unlock exclusive benefits
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2 text-sm text-amber-300/90">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                      Higher transaction limits
                    </li>
                    <li className="flex items-center gap-2 text-sm text-amber-300/90">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                      Priority customer support
                    </li>
                    <li className="flex items-center gap-2 text-sm text-amber-300/90">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                      Zero account maintenance fees
                    </li>
                  </ul>
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 text-sm font-medium">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountsDashboard;
