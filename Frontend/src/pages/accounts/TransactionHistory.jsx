import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { bankAccountAPI } from "../../services/api";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Filter,
  Download,
  Search,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  FileText,
  BarChart,
  Eye,
  EyeOff,
  CreditCard,
  Smartphone,
  Globe,
  User,
  Building,
  Hash,
  MoreVertical,
  ExternalLink,
} from "lucide-react";

const TransactionHistory = () => {
  const { accountId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBalance, setShowBalance] = useState(false);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalCredits: 0,
    totalDebits: 0,
    netFlow: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, [accountId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const accountResponse = await bankAccountAPI.getAccountDetails(accountId);
      if (accountResponse.data.success) {
        setAccount(accountResponse.data.account);
      }

      const transactionsResponse = await bankAccountAPI.getTransactions(
        accountId
      );
      if (transactionsResponse.data.success) {
        const transactionsData = transactionsResponse.data.transactions || [];
        setTransactions(transactionsData);

        // Calculate statistics
        const credits = transactionsData.filter((t) => t.type === "credit");
        const debits = transactionsData.filter((t) => t.type === "debit");
        const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);
        const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0);

        setStats({
          totalTransactions: transactionsData.length,
          totalCredits: credits.length,
          totalDebits: debits.length,
          netFlow: totalCredits - totalDebits,
        });
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError(err.response?.data?.message || "Failed to load transactions");
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        );
      case "debit":
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-400" />
          </div>
        );
    }
  };

  const getCategoryIcon = (description) => {
    const desc = description?.toLowerCase() || "";
    if (
      desc.includes("upi") ||
      desc.includes("phonepe") ||
      desc.includes("paytm")
    ) {
      return <Smartphone className="w-4 h-4" />;
    } else if (desc.includes("salary") || desc.includes("credit")) {
      return <TrendingUp className="w-4 h-4" />;
    } else if (
      desc.includes("shopping") ||
      desc.includes("amazon") ||
      desc.includes("flipkart")
    ) {
      return "🛍️";
    } else if (
      desc.includes("food") ||
      desc.includes("restaurant") ||
      desc.includes("zomato")
    ) {
      return "🍽️";
    } else if (desc.includes("transfer") || desc.includes("sent")) {
      return <ArrowLeft className="w-4 h-4" />;
    } else {
      return <FileText className="w-4 h-4" />;
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
  const getProfileAvatar = (transaction) => {
    const user =
      transaction.type === "debit" || transaction.type === "transfer"
        ? transaction.toAccount?.userId
        : transaction.fromAccount?.userId;

    if (user?.profilePhoto) {
      return (
        <img
          src={user.profilePhoto}
          alt={user.fullName}
          className="w-10 h-10 rounded-full object-cover border border-gray-600"
        />
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
        <User className="w-5 h-5 text-gray-300" />
      </div>
    );
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
    hover: { scale: 1.02, y: -4 },
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    if (
      searchQuery &&
      !t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

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
            Loading transaction history...
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
      </div>

      <div className="container mx-auto px-6 pt-0 pb-8 relative z-10">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/accounts/${accountId}`}
                    className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors border border-gray-700/50 flex items-center"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </motion.div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                      Transaction History
                    </span>
                  </h1>
                  {account && (
                    <p className="text-gray-400 text-lg mt-2">
                      Account: {account.accountNumber} • {account.ifsc}
                    </p>
                  )}
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
                      <span>Hide Amounts</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 mr-2" />
                      <span>Show Amounts</span>
                    </>
                  )}
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchTransactions}
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

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <BarChart className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-white">
                {stats.totalTransactions}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Total Transactions</p>
            <div className="mt-2">
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: "100%",
                    background: "linear-gradient(to right, #3b82f6, #06b6d4)",
                  }}
                ></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-3xl font-bold text-emerald-400">
                {stats.totalCredits}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Total Credits</p>
            <div className="mt-2">
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: "100%",
                    background: "linear-gradient(to right, #10b981, #34d399)",
                  }}
                ></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-3xl font-bold text-red-400">
                {stats.totalDebits}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Total Debits</p>
            <div className="mt-2">
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: "100%",
                    background: "linear-gradient(to right, #ef4444, #f87171)",
                  }}
                ></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="bg-gradient-to-br from-gray-800 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <span
                className={`text-3xl font-bold ${
                  stats.netFlow >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {formatCurrency(stats.netFlow)}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Net Flow</p>
            <div className="mt-2">
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: "100%",
                    background:
                      stats.netFlow >= 0
                        ? "linear-gradient(to right, #10b981, #34d399)"
                        : "linear-gradient(to right, #ef4444, #f87171)",
                  }}
                ></div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700/50 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl"></div>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions by description..."
                    className="relative w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-gray-800 rounded-xl p-1">
                  {["all", "credit", "debit"].map((type) => (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilter(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        filter === type
                          ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {type === "all"
                        ? "All"
                        : type === "credit"
                        ? "Credits"
                        : "Debits"}
                    </motion.button>
                  ))}
                </div>

                <button className="p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white">
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
            </div>

            {searchQuery && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-gray-400"
              >
                Showing {filteredTransactions.length} transactions matching "
                {searchQuery}"
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Transaction Details
                </h2>
                <p className="text-gray-400">
                  {filter === "all"
                    ? "All account transactions"
                    : filter === "credit"
                    ? "Credit transactions only"
                    : "Debit transactions only"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Filter className="w-4 h-4" />
                <span>{filteredTransactions.length} transactions</span>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400">{error}</p>
                </div>
              </motion.div>
            )}

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery
                    ? "No matching transactions"
                    : "No transactions found"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? "Try a different search term"
                    : "This account has no transaction history yet"}
                </p>
                {searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchQuery("")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-shadow"
                  >
                    Clear Search
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction._id}
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getProfileAvatar(transaction)}

                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium text-white">
                              {transaction.description || "Transaction"}
                            </p>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300 flex items-center gap-1">
                              {getCategoryIcon(transaction.description)}
                              <span className="capitalize">
                                {transaction.type}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(transaction.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            transaction.type === "credit"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {showBalance ? (
                            <>
                              {transaction.type === "credit" ? "+" : "-"}
                              {formatCurrencyDetailed(transaction.amount)}
                            </>
                          ) : (
                            "••••••"
                          )}
                        </p>
                        <div className="flex items-center justify-end gap-3 mt-3">
                          <div className="text-sm text-gray-400">
                            Balance:{" "}
                            {showBalance
                              ? formatCurrencyDetailed(transaction.balanceAfter)
                              : "••••••"}
                          </div>
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              transaction.status === "success"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {transaction.status === "success" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span className="capitalize">
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details (Expanded on hover) */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      whileHover={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-gray-700/50 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">
                            Transaction ID
                          </p>
                          <p className="text-sm font-mono text-gray-300 truncate">
                            {transaction._id}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">
                            Account Balance
                          </p>
                          <p className="text-sm text-gray-300">
                            {formatCurrencyDetailed(transaction.balanceAfter)}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">
                            Transaction Type
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                transaction.type === "credit"
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {transaction.type.charAt(0).toUpperCase() +
                                transaction.type.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">
                              {transaction.status === "success"
                                ? "Completed"
                                : "Failed"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Account Summary */}
        {account && (
          <motion.div variants={itemVariants} className="mt-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Building className="w-5 h-5 text-blue-400" />
                Account Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Hash className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Account Number</p>
                      <p className="font-medium text-white">
                        {account.accountNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">IFSC Code</p>
                      <p className="font-medium text-white">{account.ifsc}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Account Type</p>
                      <p className="font-medium text-white">
                        {account.accountType === "saving"
                          ? "Savings Account"
                          : "Current Account"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <BarChart className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Account Status</p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            account.status === "active"
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-red-500"
                          }`}
                        />
                        <p className="font-medium text-white capitalize">
                          {account.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionHistory;
