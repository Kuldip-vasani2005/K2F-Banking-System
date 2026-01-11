import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { bankAccountAPI } from "../../services/api";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  Download,
  Send,
  FileText,
  History,
  CreditCard,
  Shield,
  HelpCircle,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Users,
  Building,
  Globe,
  Lock,
  Smartphone,
  Mail,
  MapPin,
} from "lucide-react";

const AccountDetails = () => {
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBalance, setShowBalance] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAccountDetails();
  }, [accountId]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAccountType = (type) => {
    if (!type) return "Account";
    return type === "saving" ? "Savings Account" : "Current Account";
  };

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const accountResponse = await bankAccountAPI.getAccountDetails(accountId);
      if (accountResponse.data.success) {
        setAccount(accountResponse.data.account);
        const transactionsResponse = await bankAccountAPI.getTransactions(accountId);
        if (transactionsResponse.data.success) {
          setTransactions(transactionsResponse.data.transactions.slice(0, 10));
        }
      }
    } catch (err) {
      console.error("Failed to fetch account details:", err);
      setError(err.response?.data?.message || "Failed to load account details");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-400/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
        );
      case "debit":
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-400/20 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-blue-400" />
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
            Loading account details...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 text-center border border-gray-700/50"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Error Loading Account</h3>
          <p className="text-gray-400 mb-8">{error}</p>
          <div className="space-y-3">
            <Link
              to="/accounts"
              className="inline-block w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Back to Accounts
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchAccountDetails}
              className="w-full border border-gray-700 text-gray-300 px-6 py-3 rounded-xl hover:bg-gray-800/50 transition-colors font-medium"
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 text-center border border-gray-700/50"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Account Not Found</h3>
          <p className="text-gray-400 mb-8">The account you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/accounts"
            className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
          >
            Back to Accounts
          </Link>
        </motion.div>
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
              <div className="flex items-center space-x-4 mb-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/accounts"
                    className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-700/50 flex items-center"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </motion.div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                      Account Details
                    </span>
                  </h1>
                  <p className="text-gray-400 text-lg mt-2">
                    {formatAccountType(account.accountType)} • {account.accountNumber}
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
                onClick={() => copyToClipboard(account.accountNumber)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
              >
                <div className="flex items-center">
                  <Copy className="w-5 h-5 mr-2" />
                  {copied ? "Copied!" : "Copy Account"}
                </div>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Account Overview Card */}
        <motion.div
          variants={cardHoverVariants}
          initial="rest"
          whileHover="hover"
          className="relative group mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-3xl transform group-hover:rotate-1 transition-transform duration-300" />
          <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="lg:w-2/3">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm flex items-center justify-center mr-6">
                    <CreditCard className="w-8 h-8 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium">ACCOUNT NUMBER</p>
                    <div className="flex items-center mt-2">
                      <p className="text-2xl lg:text-3xl font-bold text-white">
                        {account.accountNumber}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(account.accountNumber)}
                        className="ml-3 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-2">IFSC Code</p>
                    <p className="text-lg font-bold text-white">{account.ifsc}</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-2">Account Type</p>
                    <div className="flex items-center">
                      <p className="text-lg font-bold text-white">{formatAccountType(account.accountType)}</p>
                      <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${account.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-2">Opened Date</p>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-lg font-bold text-white">{formatDate(account.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/3 mt-8 lg:mt-0 lg:pl-8">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-400 text-sm">Current Balance</p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {showBalance ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </motion.button>
                  </div>
                  <p className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {showBalance ? formatCurrency(account.balance) : "••••••••"}
                  </p>
                  <div className="flex items-center text-emerald-400 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+12.5% from last month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Quick Actions</h2>
                <p className="text-gray-400">Frequently used banking features</p>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-cyan-300" />
                <span className="text-sm text-cyan-300">Instant Access</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  icon: <Send className="w-8 h-8" />,
                  title: "Send Money",
                  description: "Transfer funds instantly",
                  color: "from-blue-500 to-cyan-400",
                  link: "/accounts/transfer",
                },
                {
                  icon: <Download className="w-8 h-8" />,
                  title: "Statements",
                  description: "Download account statements",
                  color: "from-purple-500 to-violet-400",
                  link: `/accounts/${accountId}/statement`,
                },
                {
                  icon: <History className="w-8 h-8" />,
                  title: "Transactions",
                  description: "View complete history",
                  color: "from-emerald-500 to-green-400",
                  link: `/accounts/${accountId}/transactions`,
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Security",
                  description: "Manage account security",
                  color: "from-amber-500 to-orange-400",
                  link: "/security",
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
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                    >
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">{action.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions & Account Info Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          {/* Recent Transactions */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-4">
                    <History className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Recent Transactions</h2>
                    <p className="text-gray-400">Latest account activity</p>
                  </div>
                </div>
                <Link
                  to={`/accounts/${accountId}/transactions`}
                  className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
                >
                  View All
                </Link>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
                  <p className="text-gray-500 mb-6">Your transaction history will appear here</p>
                  <Link
                    to="/accounts/transfer"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-shadow"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Make First Transaction
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:bg-gray-700/30 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type)}
                        <div className="ml-6">
                          <p className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                            {transaction.description || "Transaction"}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-400 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(transaction.createdAt)}
                            </span>
                            <span className="text-sm text-gray-400 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${transaction.type === "credit" ? "text-emerald-400" : "text-red-400"}`}>
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Balance: {formatCurrency(transaction.balanceAfter)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Account Information & Help */}
          <motion.div variants={itemVariants}>
            <div className="space-y-8">
              {/* Account Information */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mr-4">
                    <CreditCard className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Account Information</h2>
                    <p className="text-gray-400">Complete account details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-400">Account Holder</span>
                    </div>
                    <span className="font-medium text-white">{account.user?.fullname || "N/A"}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-400">Branch Name</span>
                    </div>
                    <span className="font-medium text-white">Main Branch</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-400">Branch Code</span>
                    </div>
                    <span className="font-medium text-white">MB001</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-400">Last Updated</span>
                    </div>
                    <span className="font-medium text-white">{formatDate(account.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mr-4">
                    <HelpCircle className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Need Help?</h2>
                    <p className="text-gray-400">Quick support options</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <motion.button
                    whileHover={{ x: 10 }}
                    className="w-full flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mr-4">
                        <Smartphone className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">24/7 Support</p>
                        <p className="text-sm text-gray-400">Call or chat anytime</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-400 transform rotate-180" />
                  </motion.button>

                  <motion.button
                    whileHover={{ x: 10 }}
                    className="w-full flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mr-4">
                        <Mail className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Email Support</p>
                        <p className="text-sm text-gray-400">support@zyntexa.com</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-400 transform rotate-180" />
                  </motion.button>

                  <motion.button
                    whileHover={{ x: 10 }}
                    className="w-full flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mr-4">
                        <Lock className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Security Center</p>
                        <p className="text-sm text-gray-400">Manage security settings</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-400 transform rotate-180" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">₹{Math.floor(account.balance / 1000)}K</span>
            </div>
            <p className="text-sm text-gray-400">Total Balance</p>
            <div className="flex items-center text-emerald-400 text-sm mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+5.2% from last week</span>
            </div>
          </motion.div>

          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-6 border border-emerald-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-white">{transactions.length}</span>
            </div>
            <p className="text-sm text-gray-400">Recent Transactions</p>
            <div className="flex items-center text-emerald-400 text-sm mt-2">
              <Clock className="w-4 h-4 mr-1" />
              <span>Last 10 transactions</span>
            </div>
          </motion.div>

          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl p-6 border border-purple-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">100%</span>
            </div>
            <p className="text-sm text-gray-400">Account Security</p>
            <div className="flex items-center text-emerald-400 text-sm mt-2">
              <Lock className="w-4 h-4 mr-1" />
              <span>256-bit encrypted</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AccountDetails;