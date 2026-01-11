import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  CreditCard,
  Users,
  LogOut,
  User,
  Bell,
  Settings,
  DollarSign,
  Shield,
  Menu,
  X,
  ChevronDown,
  CreditCard as CardIcon,
  Search,
  Building,
  Wallet,
  TrendingUp,
} from "lucide-react";
import API, { userAPI } from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Safely get API base URL
  const getApiBaseUrl = () => {
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.REACT_APP_API_URL
    ) {
      return process.env.REACT_APP_API_URL;
    }
    return "http://localhost:5000";
  };

  // Fetch user data and accounts on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userData = JSON.parse(sessionStorage.getItem("user") || "null");
        const adminData = JSON.parse(
          localStorage.getItem("adminData") || "null"
        ); // admin optional
        const token = sessionStorage.getItem("token");

        if (!token && !adminData) {
          setUser(null);
          setLoading(false);
          return;
        }

        if (adminData) {
          // Admin user
          setUser({
            fullName: adminData.fullName,
            email: adminData.email,
            role: adminData.role,
            isAdmin: true,
          });
          setProfilePhoto(null);
          setLoading(false);
        } else if (userData && token) {
          // Regular user - fetch fresh data
          try {
            const response = await API.get("/user/profile");
            if (response.data.success) {
              const freshUserData = response.data.user;
              setUser(freshUserData);

              // Update localStorage with fresh data
              sessionStorage.setItem("user", JSON.stringify(freshUserData));

              // Handle profile photo
              if (freshUserData.profilePhoto) {
                const baseUrl = getApiBaseUrl();
                let photoUrl = freshUserData.profilePhoto;

                // Ensure proper URL format
                if (!photoUrl.startsWith("http")) {
                  photoUrl = `${baseUrl}${
                    photoUrl.startsWith("/") ? photoUrl : "/" + photoUrl
                  }`;
                }

                // Add cache busting parameter
                setProfilePhoto(`${photoUrl}?t=${Date.now()}`);
              } else {
                setProfilePhoto(null);
              }

              // Fetch accounts and cards
              await Promise.all([fetchUserAccounts(), fetchUserCards()]);
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            // Fallback to localStorage data
            setUser(userData);
            if (userData.profilePhoto) {
              const baseUrl = getApiBaseUrl();
              setProfilePhoto(
                `${baseUrl}${userData.profilePhoto}?t=${Date.now()}`
              );
            }
          }
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === "adminData") {
        fetchUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [location.pathname]);

  // Listen for profile photo updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail?.user || event.detail?.profilePhoto !== undefined) {
        setTimeout(() => {
          const userData = JSON.parse(sessionStorage.getItem("user") || "null");
          if (userData && userData.profilePhoto) {
            const baseUrl = getApiBaseUrl();
            let photoUrl = userData.profilePhoto;

            if (!photoUrl.startsWith("http")) {
              photoUrl = `${baseUrl}${
                photoUrl.startsWith("/") ? photoUrl : "/" + photoUrl
              }`;
            }

            setProfilePhoto(`${photoUrl}?t=${Date.now()}`);
          } else {
            setProfilePhoto(null);
          }
        }, 100);
      }
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  // Fetch user accounts
  const fetchUserAccounts = async () => {
    try {
      const response = await API.get("/user/account/my-accounts");
      if (response.data.success) {
        setAccounts(response.data.accounts || []);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([]);
    }
  };

  // Fetch user cards
  const fetchUserCards = async () => {
    try {
      const response = await API.get("/user/card/my-cards");
      if (response.data.success) {
        setCards(response.data.cards || []);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
      setCards([]);
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.isAdmin) {
        await API.post("/admin/auth/logout");
        localStorage.removeItem("adminData");
        localStorage.removeItem("adminToken");
      } else {
        await userAPI.logout();
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      setUser(null);
      setProfilePhoto(null);
      setAccounts([]);
      setCards([]);
      navigate(user?.isAdmin ? "/admin/login" : "/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout even if API fails
      sessionStorage.clear();
      localStorage.removeItem("adminData"); // optional

      navigate("/login");
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsDropdownOpen(false);
  };

  const closeAllMenus = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  // Navigation items for regular users
  const userNavItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <Home className="w-5 h-5" />,
      description: "Overview & analytics",
    },
    {
      path: "/accounts",
      label: "Accounts",
      icon: <Building className="w-5 h-5" />,
      description: "Manage your accounts",
    },
    {
      path: "/cards",
      label: "Cards",
      icon: <CreditCard className="w-5 h-5" />,
      description: "Credit & debit cards",
    },
    {
      path: "/accounts/transfer",
      label: "Transfer",
      icon: <DollarSign className="w-5 h-5" />,
      description: "Send money",
    },
  ];

  // Navigation items for admin users
  const adminNavItems = {
    accountVerifier: [
      {
        path: "/admin/account-verifier",
        label: "Verify Accounts",
        icon: <Shield className="w-5 h-5" />,
        description: "Review account applications",
      },
    ],
    cardManager: [
      {
        path: "/admin/card-manager",
        label: "Manage Cards",
        icon: <CardIcon className="w-5 h-5" />,
        description: "Issue & manage cards",
      },
    ],
    cashier: [
      {
        path: "/admin/cashier",
        label: "Cashier Desk",
        icon: <DollarSign className="w-5 h-5" />,
        description: "Cash transactions",
      },
    ],
    superAdmin: [
      {
        path: "/admin/super-admin",
        label: "Admin Panel",
        icon: <Settings className="w-5 h-5" />,
        description: "System administration",
      },
    ],
  };

  const getAdminNavItems = () => {
    if (!user?.role) return [];
    return adminNavItems[user.role] || [];
  };

  // Profile image component with proper error handling
  const ProfileImage = ({ photoUrl, name, isAdmin = false, size = "md" }) => {
    const [imgError, setImgError] = useState(false);

    const sizes = {
      sm: "w-8 h-8 text-sm",
      md: "w-10 h-10 text-base",
      lg: "w-12 h-12 text-lg",
    };

    const handleImageError = () => {
      setImgError(true);
    };

    if (photoUrl && !imgError) {
      return (
        <div className="relative">
          <img
            src={photoUrl}
            alt="Profile"
            className={`${sizes[size]} rounded-full object-cover border-2 border-white/20 shadow-lg transition-all duration-300 hover:scale-105`}
            onError={handleImageError}
            loading="lazy"
            crossOrigin="anonymous"
          />
          {isAdmin && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border border-white">
              <Shield className="w-2 h-2 text-white" />
            </div>
          )}
          <div className="absolute inset-0 rounded-full ring-1 ring-white/10"></div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div
          className={`${sizes[size]} bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg ring-1 ring-white/10 transition-all duration-300 hover:scale-105`}
        >
          <span className="font-bold text-white">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
        {isAdmin && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border border-white">
            <Shield className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
    );
  };

  // Calculate total balance
  const totalBalance = Array.isArray(accounts)
    ? accounts.reduce((sum, account) => sum + Number(account?.balance || 0), 0)
    : 0;

  // Don't show navbar if loading or no user on auth pages
  if (loading) {
    return null;
  }

  return (
    <nav className="bg-gray-900 text-white shadow-2xl fixed top-0 left-0 w-full z-50 border-b border-gray-800/50 backdrop-blur-lg bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={user?.isAdmin ? "/admin" : user ? "/dashboard" : "/"}
            className="flex items-center space-x-3 group relative"
          >
            <div className="relative p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300 shadow-lg">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                K2F Bank
              </span>
              {user?.role && (
                <span className="text-xs bg-gradient-to-r from-blue-500/20 to-indigo-500/20 px-2 py-0.5 rounded-full self-start text-blue-300 border border-blue-500/30">
                  {user.role === "accountVerifier"
                    ? "Account Verifier"
                    : user.role === "cardManager"
                    ? "Card Manager"
                    : user.role === "cashier"
                    ? "Cashier"
                    : user.role === "superAdmin"
                    ? "Super Admin"
                    : user.role}
                </span>
              )}
            </div>
          </Link>

          {/* Search Bar (Desktop) - Only for logged in users */}
          {user && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts, transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* 🔓 NOT LOGGED IN */}
            {!user && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>

                <Link
                  to="/login"
                  className="px-5 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* 🔐 ADMIN USER */}
            {user?.isAdmin &&
              getAdminNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white border border-blue-500/30"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

            {/* 🔐 NORMAL USER */}
            {user &&
              !user.isAdmin &&
              userNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white border border-blue-500/30"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

            {/* Notifications - Only for logged in users */}
            {user && (
              <button className="relative p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group">
                <Bell className="w-5 h-5 text-gray-300 group-hover:text-white" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-gray-900"></span>
              </button>
            )}

            {/* User Profile Dropdown - Only when logged in */}
            {user && (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="flex items-center space-x-3">
                    <ProfileImage
                      photoUrl={profilePhoto}
                      name={user.fullName}
                      isAdmin={user.isAdmin}
                      size="md"
                    />
                    <div className="text-left hidden xl:block">
                      <p className="font-medium text-sm">
                        {user.fullName || "User"}
                      </p>
                      {!user.isAdmin && (
                        <p className="text-xs text-gray-400">
                          Balance: ${Number(totalBalance || 0).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform text-gray-400 ${
                        isDropdownOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-lg">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-700/50 flex items-center space-x-3">
                      <ProfileImage
                        photoUrl={profilePhoto}
                        name={user.fullName}
                        isAdmin={user.isAdmin}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">
                          {user.fullName}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {user.email}
                        </p>
                        {user.isAdmin ? (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 text-xs font-medium rounded-full border border-amber-500/30">
                            {user.role?.replace(/([A-Z])/g, " $1").trim() ||
                              "Admin"}
                          </span>
                        ) : (
                          <div className="mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                Total Balance
                              </span>
                              <span className="text-sm font-bold text-green-400">
                                ${totalBalance.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats for Users */}
                    {!user.isAdmin && accounts.length > 0 && (
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <div className="grid grid-cols-3 gap-2">
                          {accounts.slice(0, 3).map((account) => (
                            <div
                              key={account._id}
                              className="bg-gray-700/30 p-2 rounded-lg"
                            >
                              <p className="text-xs text-gray-400 truncate">
                                {account.accountType}
                              </p>
                              <p className="font-bold text-sm truncate">
                                ${account.balance?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Menu Items */}
                    <div className="py-2">
                      <div className="px-2 space-y-1">
                        {!user.isAdmin ? (
                          // User Menu Items
                          <>
                            <Link
                              to="/dashboard"
                              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors group"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <div className="flex items-center">
                                <div className="p-1.5 rounded-lg bg-blue-500/10 mr-3 group-hover:bg-blue-500/20">
                                  <Home className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-medium">
                                    Dashboard
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Overview & analytics
                                  </p>
                                </div>
                              </div>
                            </Link>
                            <Link
                              to="/accounts"
                              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors group"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <div className="flex items-center">
                                <div className="p-1.5 rounded-lg bg-green-500/10 mr-3 group-hover:bg-green-500/20">
                                  <Building className="w-4 h-4 text-green-400" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-medium">
                                    My Accounts
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {accounts.length} accounts
                                  </p>
                                </div>
                              </div>
                              {accounts.length > 0 && (
                                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                                  {accounts.length}
                                </span>
                              )}
                            </Link>
                            <Link
                              to="/cards"
                              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors group"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <div className="flex items-center">
                                <div className="p-1.5 rounded-lg bg-purple-500/10 mr-3 group-hover:bg-purple-500/20">
                                  <CreditCard className="w-4 h-4 text-purple-400" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-medium">
                                    My Cards
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Manage your cards
                                  </p>
                                </div>
                              </div>
                              {cards.length > 0 && (
                                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full">
                                  {cards.length}
                                </span>
                              )}
                            </Link>
                            <Link
                              to="/profile"
                              className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors group"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <div className="p-1.5 rounded-lg bg-gray-500/10 mr-3 group-hover:bg-gray-500/20">
                                <User className="w-4 h-4 text-gray-300" />
                              </div>
                              <span className="text-sm">Profile Settings</span>
                            </Link>
                          </>
                        ) : (
                          // Admin Menu Items
                          <>
                            <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Admin Menu
                            </div>
                            {getAdminNavItems().map((item) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors group"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <div className="flex items-center">
                                  <div className="p-1.5 rounded-lg bg-blue-500/10 mr-3 group-hover:bg-blue-500/20">
                                    {item.icon}
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-medium">
                                      {item.label}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-gray-700/50 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between mx-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center">
                          <div className="p-1.5 rounded-lg bg-red-500/10 mr-3 group-hover:bg-red-500/20">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span className="text-sm">Logout</span>
                        </div>
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">
                          {user.isAdmin ? "Admin" : "User"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            {user && (
              <button className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-gray-900"></span>
              </button>
            )}
            <button
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-gray-800/90 backdrop-blur-lg rounded-xl my-3 py-4 px-3 border border-gray-700/50 shadow-2xl">
            {user ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="px-4 py-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl mb-2 border border-gray-700/50">
                  <div className="flex items-center space-x-4">
                    <ProfileImage
                      photoUrl={profilePhoto}
                      name={user.fullName}
                      isAdmin={user.isAdmin}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg truncate">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-gray-300 truncate">
                        {user.email}
                      </p>
                      {user.role && (
                        <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                          {user.role}
                        </span>
                      )}
                      {!user.isAdmin && (
                        <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">
                              Total Balance
                            </span>
                            <span className="text-lg font-bold text-green-400">
                              ${totalBalance.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Search Bar (Mobile) */}
                <div className="px-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-2 px-2">
                  {(user.isAdmin ? getAdminNavItems() : userNavItems).map(
                    (item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                          isActive(item.path)
                            ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30"
                            : "hover:bg-gray-700/50"
                        }`}
                        onClick={closeAllMenus}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isActive(item.path)
                                ? "bg-blue-500/20"
                                : "bg-gray-700/50"
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        {item.path === "/accounts" &&
                          accounts.length > 0 &&
                          !user.isAdmin && (
                            <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                              {accounts.length}
                            </span>
                          )}
                      </Link>
                    )
                  )}

                  {/* Profile Link */}
                  <Link
                    to={user.isAdmin ? "/admin/settings" : "/profile"}
                    className="flex items-center px-4 py-3 rounded-xl hover:bg-gray-700/50 transition-all"
                    onClick={closeAllMenus}
                  >
                    <div className="p-2 rounded-lg bg-gray-700/50 mr-3">
                      <User className="w-5 h-5" />
                    </div>
                    <span>
                      {user.isAdmin ? "Admin Settings" : "Profile Settings"}
                    </span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="pt-4 mt-4 border-t border-gray-700/50 px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 text-red-300 rounded-xl transition-all border border-red-500/30"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block text-center px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-gray-700"
                  onClick={closeAllMenus}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 font-medium rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all"
                  onClick={closeAllMenus}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
