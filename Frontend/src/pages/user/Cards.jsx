import FancyAlert from "../../components/AlertBox/FancyAlert";
import { AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { cardAPI } from "../../services/api";
import { motion } from "framer-motion";
import {
  CreditCard,
  Plus,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Download,
  Trash2,
  Shield,
  Key,
  Calendar,
  DollarSign,
  Wallet,
  Mail,
  Phone,
  MapPin,
  User,
  Settings,
  BarChart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  FileText,
  HelpCircle,
  CreditCard as CardIcon,
  Send,
  QrCode,
  Smartphone,
  Gift,
  Globe,
  Sparkles,
  Zap,
  Shield as SecurityIcon,
  Crown,
  Target,
  Award,
  Star,
  ShieldCheck,
  RotateCcw,
  MoreVertical,
  ExternalLink,
} from "lucide-react";

const Cards = () => {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(null);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [cardToBlock, setCardToBlock] = useState(null);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [selectedAccount, setSelectedAccount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [showCvv, setShowCvv] = useState({});
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    blockedCards: 0,
    totalSpent: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showTransactionDetails, setShowTransactionDetails] = useState(null);
  const [pinData, setPinData] = useState({
    cardId: "",
    newPin: "",
    confirmPin: "",
    otp: "",
  });
  const [activeTab, setActiveTab] = useState("all");
  const [showPermanentBlockConfirm, setShowPermanentBlockConfirm] =
    useState(false);
  const navigate = useNavigate();

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

  // Fetch user's accounts
  const fetchAccounts = async () => {
    try {
      const response = await api.get("/user/account/my-accounts");
      if (response.data.success) {
        setAccounts(response.data.accounts || []);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setMessage({
        text: "Failed to load accounts. Please try again.",
        type: "error",
      });
    }
  };

  // Fetch user's cards
  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user/card/my-cards");
      if (response.data.success) {
        const cardsData = response.data.cards || [];
        setCards(cardsData);

        // Calculate stats
        const activeCards = cardsData.filter(
          (card) => card.status === "active" && !card.isBlocked
        ).length;
        const blockedCards = cardsData.filter((card) => card.isBlocked).length;

        setStats({
          totalCards: cardsData.length,
          activeCards,
          blockedCards,
          totalSpent: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      if (error.response?.status !== 404) {
        setMessage({
          text: error.response?.data?.message || "Failed to load cards",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch card requests
  const fetchCardRequests = async () => {
    try {
      const response = await api.get("/user/card/status");
      if (response.data.success) {
        setRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching card requests:", error);
    }
  };

  // Fetch recent card transactions
  const fetchRecentTransactions = async () => {
    try {
      const response = await api.get("/user/account/transactions/recent");
      if (response.data.success) {
        const cardTransactions = response.data.transactions
          .filter(
            (tx) =>
              tx.description?.includes("card") ||
              tx.type === "debit" ||
              tx.description?.includes("purchase")
          )
          .slice(0, 5);
        setRecentTransactions(cardTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Request new card
  const handleRequestCard = async () => {
    if (!selectedAccount) {
      setMessage({ text: "Please select an account", type: "error" });
      return;
    }

    // 🚫 HARD BLOCK (IMPORTANT)
    const hasCard = cards.some((card) => card.accountId === selectedAccount);

    if (hasCard) {
      setMessage({
        text: "This account already has a card",
        type: "error",
      });
      return; // ⛔ STOP API CALL
    }

    try {
      setLoading(true);

      const response = await api.post("/user/card/request", {
        accountId: selectedAccount,
      });

      if (response.data.success) {
        setMessage({
          text: "Card request submitted successfully!",
          type: "success",
        });
        setShowNewCardModal(false);
        setSelectedAccount("");
        fetchCards();
        fetchCardRequests();
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to request card",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send unblock OTP
  const handleSendUnblockOtp = async (cardId) => {
    try {
      const response = await cardAPI.sendUnblockOtp({ cardId });

      if (response.data.success) {
        setMessage({
          text: "OTP sent to your registered email",
          type: "success",
        });
        setShowUnblockModal(cardId);
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to send OTP",
        type: "error",
      });
    }
  };

  // Verify unblock OTP
  const handleUnblockCard = async () => {
    if (!otp) {
      setMessage({ text: "Please enter OTP", type: "error" });
      return;
    }

    try {
      const response = await cardAPI.verifyUnblockOtp({
        cardId: showUnblockModal,
        otp,
      });

      if (response.data.success) {
        setMessage({ text: "Card unblocked successfully!", type: "success" });
        setShowUnblockModal(false);
        setOtp("");
        fetchCards();
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to unblock card",
        type: "error",
      });
    }
  };

  // Handle block card - FIXED VERSION
  const handleBlockCard = async (cardId, permanent = false) => {
    try {
      const reason = permanent ? "Lost/Stolen" : "Temporary Block";

      // Use correct endpoint
      const response = await api.post("/user/card/block", {
        cardId,
        reason,
      });

      if (response.data.success) {
        setMessage({
          text: `Card ${
            permanent ? "permanently blocked" : "temporarily blocked"
          } successfully!`,
          type: "success",
        });
        setShowBlockModal(false);
        setShowPermanentBlockConfirm(false);
        setCardToBlock(null);
        fetchCards(); // Refresh cards list
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to block card",
        type: "error",
      });
    }
  };

  // Send PIN setting OTP
  const handleSendPinOtp = async () => {
    if (
      !pinData.cardId ||
      pinData.newPin.length !== 4 ||
      pinData.newPin !== pinData.confirmPin
    ) {
      setMessage({ text: "Invalid PIN details", type: "error" });
      return;
    }

    const selectedCard = cards.find(
      (c) => (c._id || c.cardId) === pinData.cardId
    );

    if (!selectedCard) {
      setMessage({ text: "Card not found", type: "error" });
      return;
    }

    try {
      const response = await api.post("/atm/set-pin", {
        cardNumber: selectedCard.cardNumber,
        pin: pinData.newPin,
      });

      if (response.data.success) {
        setMessage({
          text: "OTP sent to your registered email",
          type: "success",
        });
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to send OTP",
        type: "error",
      });
    }
  };

  // Set Card PIN
  const handleSetPin = async () => {
    if (
      !pinData.cardId ||
      !pinData.newPin ||
      !pinData.confirmPin ||
      !pinData.otp
    ) {
      setMessage({ text: "Please fill all fields", type: "error" });
      return;
    }

    if (pinData.newPin !== pinData.confirmPin) {
      setMessage({ text: "PINs do not match", type: "error" });
      return;
    }

    if (pinData.newPin.length !== 4) {
      setMessage({ text: "PIN must be 4 digits", type: "error" });
      return;
    }

    if (pinData.otp.length !== 6) {
      setMessage({ text: "OTP must be 6 digits", type: "error" });
      return;
    }

    try {
      const response = await api.post("/atm/set-pin/verify-otp", {
        cardId: pinData.cardId,
        newPin: pinData.newPin,
        otp: pinData.otp,
      });

      if (response.data.success) {
        setMessage({ text: "Card PIN set successfully!", type: "success" });
        setShowSetPinModal(false);
        setPinData({ cardId: "", newPin: "", confirmPin: "", otp: "" });
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to set PIN",
        type: "error",
      });
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format card number
  const formatCardNumber = (number) => {
    if (!number) return "**** **** **** ****";
    return number.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  // Mask card number
  const maskCardNumber = (number) => {
    if (!number) return "**** **** **** ****";
    return `**** **** **** ${number.slice(-4)}`;
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setMessage({ text: "Copied to clipboard!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  // Get account by ID
  const getAccountById = (accountId) => {
    return accounts.find((acc) => acc._id === accountId);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Initialize
  useEffect(() => {
    fetchAccounts();
    fetchCards();
    fetchCardRequests();
    fetchRecentTransactions();
  }, []);

  // ATM Card Component - Golden Theme
  const AtmCard = ({ card, index }) => (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      className={`relative overflow-hidden rounded-2xl p-6 min-h-[220px] cursor-pointer transform transition-all duration-300 ${
        card.isBlocked
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
          : "bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-800"
      }`}
      style={{
        boxShadow: card.isBlocked
          ? "0 20px 40px rgba(0, 0, 0, 0.3)"
          : "0 20px 40px rgba(245, 158, 11, 0.25)",
      }}
      onClick={() => setShowCardDetails(card)}
    >
      {/* Blocked indicator */}
      {card.isBlocked && (
        <div className="absolute top-4 left-4 bg-red-500/90 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
          BLOCKED
        </div>
      )}

      {/* Golden gradient overlay */}
      {!card.isBlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-yellow-500/5 to-transparent"></div>
      )}

      {/* Card background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
      </div>

      {/* Card chip */}
      <div className="relative mb-6">
        <div className="w-12 h-8 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-lg"></div>
        <div className="absolute top-1 left-1 w-10 h-6 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-md"></div>
      </div>

      {/* Card number */}
      <div className="relative mb-4">
        <p className="text-white text-xl font-mono tracking-wider font-bold">
          {maskCardNumber(card.cardNumber)}
        </p>
      </div>

      {/* Card footer */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-amber-200 text-sm opacity-80">Card Holder</p>
            <p className="text-white font-semibold">USER NAME</p>
          </div>
          <div>
            <p className="text-amber-200 text-sm opacity-80">Valid Thru</p>
            <p className="text-white font-semibold">{card.expiry || "MM/YY"}</p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              {card.isBlocked ? (
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-red-500/20">
                  <XCircle className="w-3 h-3 text-red-300 mr-1" />
                  <span className="text-xs text-red-300">Blocked</span>
                </div>
              ) : (
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-500/20">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-1 animate-pulse"></div>
                  <span className="text-xs text-emerald-300">Active</span>
                </div>
              )}
            </div>
            <p className="text-amber-300 text-sm font-medium">VISA</p>
          </div>
        </div>
      </div>

      {/* Golden shine effect */}
      {!card.isBlocked && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
      )}
    </motion.div>
  );

  // New Card Modal
  const NewCardModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Request New Debit Card
              </h3>
              <p className="text-gray-400 mt-1">Get your golden ATM card</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowNewCardModal(false);
                setSelectedAccount("");
              }}
              className="p-2 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </motion.button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">SELECT ACCOUNT</p>
                  <p className="font-medium text-white">
                    Link to your bank account
                  </p>
                </div>
              </div>

              {accounts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="font-medium text-red-300">
                        No accounts found
                      </p>
                      <p className="text-sm text-red-400/80 mt-1">
                        You need a bank account to request a card
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowNewCardModal(false);
                          navigate("/accounts/open");
                        }}
                        className="mt-2 text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        Open a new account <ArrowRight className="h-3 w-3" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-xl"></div>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="relative w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white"
                  >
                    <option value="" className="bg-gray-800">
                      Select an account
                    </option>
                    {accounts.map((account) => {
                      const hasCard = cards.some(
                        (card) => card.accountId === account._id
                      );
                      return (
                        <option
                          key={account._id}
                          value={account._id}
                          disabled={hasCard}
                          className={`${
                            hasCard ? "text-gray-500" : "text-white"
                          } bg-gray-800`}
                        >
                          {account.accountNumber} -{" "}
                          {formatCurrency(account.balance)}
                          {hasCard && " (Card exists)"}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {selectedAccount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl border border-amber-500/20"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-300">
                      Selected Account
                    </p>
                    <p className="text-sm text-amber-400/80">
                      {getAccountById(selectedAccount)?.accountNumber} •{" "}
                      {formatCurrency(
                        getAccountById(selectedAccount)?.balance || 0
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-xl border border-purple-500/20"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-400 mt-0.5" />
                <div className="text-sm text-purple-300/90">
                  <p className="font-medium">Premium Features</p>
                  <ul className="mt-2 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      Contactless payments enabled
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      Global ATM access
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      Zero liability protection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      ₹500 issuance fee
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowNewCardModal(false);
                setSelectedAccount("");
              }}
              className="flex-1 px-6 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all font-medium"
              disabled={loading}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRequestCard}
              disabled={!selectedAccount || loading || accounts.length === 0}
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl font-medium ${
                !selectedAccount || loading || accounts.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg hover:shadow-amber-500/25"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="inline h-4 w-4 mr-2" />
                  Request Card
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Unblock Modal
  const UnblockModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white">Unblock Card</h3>
              <p className="text-gray-400 mt-1">Verify with OTP</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowUnblockModal(false);
                setOtp("");
              }}
              className="p-2 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </motion.button>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl border border-amber-500/20">
              <p className="text-amber-300 text-sm">
                Enter the OTP sent to your registered email to unblock your
                card.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                OTP (6 digits)
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-xl"></div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="relative w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white text-center text-xl tracking-widest"
                  placeholder="Enter OTP"
                  maxLength={6}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSendUnblockOtp(showUnblockModal)}
              className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Resend OTP
            </motion.button>
          </div>

          <div className="mt-8 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowUnblockModal(false);
                setOtp("");
              }}
              className="flex-1 px-6 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUnblockCard}
              disabled={!otp || otp.length !== 6}
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl font-medium ${
                !otp || otp.length !== 6
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg hover:shadow-amber-500/25"
              }`}
            >
              Unblock Card
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Block Card Modal
  const BlockCardModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white">Block Card</h3>
              <p className="text-gray-400 mt-1">Choose block type</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowBlockModal(false);
                setCardToBlock(null);
              }}
              className="p-2 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </motion.button>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="font-medium text-red-300">Security Alert</p>
                  <p className="text-sm text-red-400/80">
                    Blocking your card will prevent all transactions
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBlockCard(cardToBlock, false)}
                className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl hover:border-amber-500/50 text-left flex items-center gap-4 group transition-all"
              >
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg group-hover:from-amber-500/30 group-hover:to-yellow-500/30">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Temporary Block</p>
                  <p className="text-sm text-gray-400">
                    Block for security reasons (can be unblocked)
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-amber-400" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowBlockModal(false);
                  setShowPermanentBlockConfirm(true);
                }}
                className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl hover:border-red-500/50 text-left flex items-center gap-4 group transition-all"
              >
                <div className="p-2 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg group-hover:from-red-500/30 group-hover:to-pink-500/30">
                  <Lock className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">Permanent Block</p>
                  <p className="text-sm text-gray-400">
                    Report lost/stolen card (requires new card)
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-red-400" />
              </motion.button>
            </div>
          </div>

          <div className="mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowBlockModal(false);
                setCardToBlock(null);
              }}
              className="w-full px-6 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all font-medium"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Permanent Block Confirmation Modal
  const PermanentBlockConfirmModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-red-700/50 shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-red-300">
                ⚠️ Permanent Block
              </h3>
              <p className="text-gray-400 mt-1">This action cannot be undone</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-400 mt-0.5" />
                <div>
                  <p className="font-bold text-red-300 mb-2">
                    Important Notice
                  </p>
                  <ul className="text-sm text-red-400/90 space-y-2">
                    <li>• This will permanently block your card</li>
                    <li>• You cannot unblock a permanently blocked card</li>
                    <li>• You'll need to request a new card</li>
                    <li>• All transactions will be declined immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-white font-medium">
                Are you sure you want to permanently block this card?
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Reason: Lost/Stolen Card
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPermanentBlockConfirm(false)}
              className="flex-1 px-6 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                handleBlockCard(cardToBlock, true);
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/25"
            >
              Yes, Block Permanently
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Set PIN Modal
  const SetPinModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white">Set Card PIN</h3>
              <p className="text-gray-400 mt-1">Secure your transactions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowSetPinModal(false);
                setPinData({ cardId: "", newPin: "", confirmPin: "", otp: "" });
              }}
              className="p-2 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </motion.button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Card
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-xl"></div>
                <select
                  value={pinData.cardId}
                  onChange={(e) =>
                    setPinData({ ...pinData, cardId: e.target.value })
                  }
                  className="relative w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white"
                >
                  <option value="" className="bg-gray-800">
                    Select a card
                  </option>
                  {cards
                    .filter(
                      (card) => card.status === "active" && !card.isBlocked
                    )
                    .map((card) => (
                      <option
                        key={card._id || card.cardId}
                        value={card._id || card.cardId}
                        className="bg-gray-800 text-white"
                      >
                        {maskCardNumber(card.cardNumber)} - {card.accountNumber}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {pinData.cardId && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      New PIN
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-xl"></div>
                      <input
                        type="password"
                        value={pinData.newPin}
                        onChange={(e) =>
                          setPinData({
                            ...pinData,
                            newPin: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="relative w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white text-center text-xl tracking-widest"
                        placeholder="****"
                        maxLength={4}
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Confirm PIN
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-xl"></div>
                      <input
                        type="password"
                        value={pinData.confirmPin}
                        onChange={(e) =>
                          setPinData({
                            ...pinData,
                            confirmPin: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="relative w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white text-center text-xl tracking-widest"
                        placeholder="****"
                        maxLength={4}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </div>

                {pinData.newPin && pinData.confirmPin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      OTP Verification
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-xl"></div>
                      <input
                        type="text"
                        value={pinData.otp}
                        onChange={(e) =>
                          setPinData({
                            ...pinData,
                            otp: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="relative w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white text-center text-xl tracking-widest"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        inputMode="numeric"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendPinOtp}
                      className="mt-2 text-sm text-amber-400 hover:text-amber-300 flex items-center gap-2"
                    >
                      <Send className="h-3 w-3" />
                      Send OTP
                    </motion.button>
                  </div>
                )}
              </>
            )}

            {pinData.newPin && pinData.newPin.length === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-400" />
                  <div className="text-sm text-green-400/90">
                    <p className="font-medium">PIN Security</p>
                    <p className="mt-1">
                      Your PIN must be 4 digits. Never share your PIN with
                      anyone.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {pinData.newPin !== pinData.confirmPin && pinData.confirmPin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-sm text-red-400">PINs don't match</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowSetPinModal(false);
                setPinData({ cardId: "", newPin: "", confirmPin: "", otp: "" });
              }}
              className="flex-1 px-6 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSetPin}
              disabled={
                !pinData.cardId ||
                !pinData.otp ||
                pinData.newPin !== pinData.confirmPin
              }
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl font-medium ${
                !pinData.cardId ||
                !pinData.otp ||
                pinData.newPin !== pinData.confirmPin
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-lg hover:shadow-amber-500/25"
              }`}
            >
              Set PIN
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Card Details Modal
  const CardDetailsModal = ({ card, onClose }) => {
    if (!card) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl w-full max-w-lg overflow-hidden"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">Card Details</h3>
                <p className="text-gray-400 mt-1">Complete card information</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-700/50 rounded-xl text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </motion.button>
            </div>

            {/* ATM Card Preview */}
            <div
              className={`relative rounded-2xl p-6 mb-8 min-h-[180px] ${
                card.isBlocked
                  ? "bg-gradient-to-br from-gray-700 to-gray-800"
                  : "bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-800"
              }`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-amber-200 text-sm opacity-80">
                      Digital Bank
                    </p>
                    <p className="text-amber-100 text-xl font-bold">
                      Platinum Debit
                    </p>
                  </div>
                  {card.isBlocked ? (
                    <div className="flex items-center gap-1 bg-red-500/30 px-3 py-1 rounded-full">
                      <XCircle className="w-4 h-4 text-red-300" />
                      <span className="text-xs text-red-300">Blocked</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-emerald-500/30 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                      <span className="text-xs text-emerald-300">Active</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-white text-xl font-mono tracking-wider">
                    {formatCardNumber(card.cardNumber)}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-amber-200 text-xs opacity-80">
                      Card Holder
                    </p>
                    <p className="text-white font-medium">USER NAME</p>
                  </div>
                  <div>
                    <p className="text-amber-200 text-xs opacity-80">Expiry</p>
                    <p className="text-white font-medium">{card.expiry}</p>
                  </div>
                  <div>
                    <p className="text-amber-200 text-xs opacity-80">CVV</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">
                        {showCvv[card.cardId || card._id] ? card.cvv : "***"}
                      </p>
                      <button
                        onClick={() =>
                          setShowCvv((prev) => ({
                            ...prev,
                            [card.cardId || card._id]:
                              !prev[card.cardId || card._id],
                          }))
                        }
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        {showCvv[card.cardId || card._id] ? (
                          <EyeOff className="h-4 w-4 text-amber-300" />
                        ) : (
                          <Eye className="h-4 w-4 text-amber-300" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <p className="text-sm text-gray-400 mb-1">Linked Account</p>
                <p className="font-medium text-white">{card.accountNumber}</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <p className="text-sm text-gray-400 mb-1">Card Type</p>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-400" />
                  <p className="font-medium text-white">Platinum Debit</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!card.pinSet && !card.isBlocked && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowSetPinModal(true);
                    setPinData({ ...pinData, cardId: card._id || card.cardId });
                    onClose();
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-3 font-medium"
                >
                  <Key className="h-5 w-5" />
                  Set PIN
                </motion.button>
              )}

              {card.isBlocked ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleSendUnblockOtp(card.cardId || card._id);
                    onClose();
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-3 font-medium"
                >
                  <Unlock className="h-5 w-5" />
                  Unblock Card
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCardToBlock(card._id || card.cardId);
                    setShowBlockModal(true);
                    onClose();
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-3 font-medium"
                >
                  <Lock className="h-5 w-5" />
                  Block Card
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => copyToClipboard(card.cardNumber)}
                className="w-full px-6 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700/50 hover:text-white flex items-center justify-center gap-3 font-medium"
              >
                <Copy className="h-5 w-5" />
                Copy Card Number
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-6 py-3 border border-gray-600 text-gray-400 rounded-xl hover:bg-gray-800/50 hover:text-white font-medium"
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden"
    >
      {/* Global Fancy Alert */}
      <AnimatePresence>
        {message.text && (
          <div className="fixed top-20 right-6 z-[9999]">
            <FancyAlert
              type={message.type} // success | error | warning | info
              message={message.text}
              onClose={() => setMessage({ text: "", type: "" })}
              duration={3000}
              autoClose={true}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 pt-0 pb-8 relative z-10">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                      My Cards
                    </span>
                  </h1>
                  <p className="text-gray-400 text-lg mt-2">
                    Manage your golden ATM cards and transactions
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 lg:mt-0"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewCardModal(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-white font-bold rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-3">
                  <Plus className="w-5 h-5" />
                  Request New Card
                  <Sparkles className="w-4 h-4 ml-1" />
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: "Total Cards",
              value: stats.totalCards,
              icon: <CreditCard className="h-6 w-6" />,
              color: "from-blue-500/20 to-cyan-500/20",
              textColor: "text-blue-400",
            },
            {
              title: "Active Cards",
              value: stats.activeCards,
              icon: <CheckCircle className="h-6 w-6" />,
              color: "from-emerald-500/20 to-green-500/20",
              textColor: "text-emerald-400",
            },
            {
              title: "Blocked Cards",
              value: stats.blockedCards,
              icon: <XCircle className="h-6 w-6" />,
              color: "from-red-500/20 to-pink-500/20",
              textColor: "text-red-400",
            },
            {
              title: "Monthly Spend",
              value: formatCurrency(stats.totalSpent),
              icon: <DollarSign className="h-6 w-6" />,
              color: "from-amber-500/20 to-yellow-500/20",
              textColor: "text-amber-400",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="bg-gradient-to-br from-gray-800 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  {stat.icon}
                </div>
                <span className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{stat.title}</p>
              <div className="mt-2">
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(index + 1) * 25}%`,
                      background: `linear-gradient(to right, ${stat.textColor}, ${stat.textColor}80)`,
                    }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cards Section */}
          <div className="lg:col-span-2">
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl mb-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Your Cards
                  </h2>
                  <p className="text-gray-400">
                    Manage and control your debit cards
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      fetchCards();
                      fetchRecentTransactions();
                    }}
                    className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors text-gray-400 hover:text-white"
                    title="Refresh"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="all">All Cards</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading your cards...</p>
                </div>
              ) : cards.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Cards Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Get started with your first premium debit card
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNewCardModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-xl hover:shadow-lg hover:shadow-amber-500/25 flex items-center gap-3 mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    Request Your First Card
                  </motion.button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cards
                    .filter((card) => {
                      if (activeTab === "active") return !card.isBlocked;
                      if (activeTab === "blocked") return card.isBlocked;
                      return true;
                    })
                    .map((card, index) => (
                      <div key={card._id || card.cardId}>
                        <AtmCard card={card} index={index} />

                        {/* Card Actions */}
                        <div className="mt-4 flex gap-2">
                          {card.isBlocked ? (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                handleSendUnblockOtp(card.cardId || card._id)
                              }
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-lg hover:shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 text-sm font-medium"
                            >
                              <Unlock className="h-4 w-4" />
                              Unblock
                            </motion.button>
                          ) : (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setCardToBlock(card.cardId || card._id);
                                  setShowBlockModal(true);
                                }}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white flex items-center justify-center gap-2 text-sm font-medium"
                              >
                                <Lock className="h-4 w-4" />
                                Block
                              </motion.button>
                              {!card.pinSet && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setShowSetPinModal(true);
                                    setPinData({
                                      ...pinData,
                                      cardId: card._id || card.cardId,
                                    });
                                  }}
                                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 text-sm font-medium"
                                >
                                  <Key className="h-4 w-4" />
                                  Set PIN
                                </motion.button>
                              )}
                            </>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCardDetails(card)}
                            className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white flex items-center gap-2 text-sm font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </motion.button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Recent Card Transactions
                    </h2>
                    <p className="text-gray-400">Latest spending activity</p>
                  </div>
                  <button
                    onClick={() => navigate("/accounts/transactions")}
                    className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white flex items-center gap-2 text-sm font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {recentTransactions.map((txn, index) => (
                    <motion.div
                      key={txn._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setShowTransactionDetails(txn)}
                      className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-amber-500/30 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${
                              txn.type === "credit"
                                ? "bg-emerald-500/10"
                                : "bg-red-500/10"
                            }`}
                          >
                            {txn.type === "credit" ? (
                              <TrendingUp className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white group-hover:text-amber-300 transition-colors">
                              {txn.description || "Card Transaction"}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {formatDate(txn.createdAt)} •{" "}
                              {formatTime(txn.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              txn.type === "credit"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {txn.type === "credit" ? "+" : "-"}
                            {formatCurrency(txn.amount)}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              txn.status === "success"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Card Features & Actions */}
          <div className="space-y-8">
            {/* Card Controls */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700/50 shadow-2xl"
            >
              <h3 className="font-bold text-white mb-4">Card Controls</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const activeCard = cards.find((card) => !card.isBlocked);
                    if (activeCard) {
                      setCardToBlock(activeCard._id || activeCard.cardId);
                      setShowBlockModal(true);
                    } else {
                      setMessage({
                        text: "No active cards to block",
                        type: "warning",
                      });
                    }
                  }}
                  className="w-full p-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-lg hover:border-red-500/50 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-red-400" />
                    <span className="font-medium text-white">
                      Block Active Card
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-red-400" />
                </button>

                <button
                  onClick={() => {
                    const blockedCard = cards.find((card) => card.isBlocked);
                    if (blockedCard) {
                      handleSendUnblockOtp(
                        blockedCard._id || blockedCard.cardId
                      );
                    } else {
                      setMessage({
                        text: "No blocked cards to unblock",
                        type: "warning",
                      });
                    }
                  }}
                  className="w-full p-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-lg hover:border-emerald-500/50 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Unlock className="h-4 w-4 text-emerald-400" />
                    <span className="font-medium text-white">Unblock Card</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-emerald-400" />
                </button>
              </div>
            </motion.div>

            {/* Card Security */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700/50 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Card Security</h3>
                  <p className="text-sm text-gray-400">Protect your card</p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ x: 10 }}
                  onClick={() => setShowSetPinModal(true)}
                  className="w-full p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-amber-500/30 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg">
                      <Key className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Set/Change PIN</p>
                      <p className="text-sm text-gray-400">
                        Secure your transactions
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-amber-400" />
                </motion.button>

                <motion.button
                  whileHover={{ x: 10 }}
                  onClick={() => {
                    const activeCard = cards.find((card) => !card.isBlocked);
                    if (activeCard) {
                      setCardToBlock(activeCard._id || activeCard.cardId);
                      setShowPermanentBlockConfirm(true);
                    } else {
                      setMessage({
                        text: "No active cards to report",
                        type: "warning",
                      });
                    }
                  }}
                  className="w-full p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-red-500/30 text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        Report Lost/Stolen
                      </p>
                      <p className="text-sm text-gray-400">
                        Immediate action required
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-red-400" />
                </motion.button>
              </div>
            </motion.div>

            {/* Card Features */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700/50 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Card Features</h3>
                  <p className="text-sm text-gray-400">Premium benefits</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                  <div className="p-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg">
                    <QrCode className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">UPI Payments</p>
                    <p className="text-xs text-gray-400">Instant QR payments</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                  <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg">
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Contactless</p>
                    <p className="text-xs text-gray-400">Tap & pay enabled</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                    <Globe className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Global Access</p>
                    <p className="text-xs text-gray-400">Use worldwide</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700/50 shadow-2xl"
            >
              <h3 className="font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  {
                    label: "Transaction History",
                    icon: FileText,
                    action: () => navigate("/accounts/transactions"),
                  },
                  { label: "Card Statement", icon: Download },
                  { label: "Manage Limits", icon: Settings },
                  { label: "Support Center", icon: HelpCircle },
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 10 }}
                    onClick={item.action}
                    className="w-full p-3 hover:bg-gray-800/50 rounded-lg text-left flex items-center justify-between group"
                  >
                    <span className="font-medium text-gray-300 group-hover:text-white">
                      {item.label}
                    </span>
                    <item.icon className="h-4 w-4 text-gray-500 group-hover:text-amber-400" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Premium Badge */}
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-amber-700/20 via-yellow-600/20 to-amber-800/20 border border-amber-500/30"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
              <div className="flex items-center gap-3 mb-4">
                <Crown className="h-6 w-6 text-amber-300" />
                <div>
                  <h3 className="font-bold text-amber-200">Platinum Tier</h3>
                  <p className="text-sm text-amber-300/80">
                    Premium cardholder
                  </p>
                </div>
              </div>
              <p className="text-sm text-amber-300/80 mb-4">
                Enjoy exclusive benefits and higher limits with your golden card
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                  <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                  <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                  <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                  <Star className="h-4 w-4 text-amber-300" />
                </div>
                <span className="text-xs text-amber-400">Level 4</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewCardModal && <NewCardModal />}
      {showUnblockModal && <UnblockModal />}
      {showBlockModal && <BlockCardModal />}
      {showSetPinModal && <SetPinModal />}
      {showPermanentBlockConfirm && <PermanentBlockConfirmModal />}
      {showCardDetails && (
        <CardDetailsModal
          card={showCardDetails}
          onClose={() => setShowCardDetails(null)}
        />
      )}
    </motion.div>
  );
};

export default Cards;
