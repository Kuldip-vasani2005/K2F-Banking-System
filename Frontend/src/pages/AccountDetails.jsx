import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bankAccountAPI } from "../services/api";

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementPeriod, setStatementPeriod] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (accountId) {
      fetchAccountDetails();
      fetchRecentTransactions();
    }
  }, [accountId]);

  const fetchAccountDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await bankAccountAPI.getAccountDetails(accountId);
      if (response.data.success) {
        setAccount(response.data.account);
      } else {
        setError("Failed to load account details");
      }
    } catch (err) {
      console.error("Failed to fetch account details:", err);
      setError("Account not found or access denied");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await bankAccountAPI.getTransactions(accountId);
      if (response.data.success) {
        setTransactions(response.data.transactions.slice(0, 5) || []);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatementDownload = async () => {
    if (!statementPeriod.startDate || !statementPeriod.endDate) {
      alert("Please select both start and end dates");
      return;
    }

    try {
      const response = await bankAccountAPI.getAccountStatement(
        accountId,
        statementPeriod.startDate,
        statementPeriod.endDate
      );

      if (response.data.success) {
        // Create and download CSV file
        const csvData = convertToCSV(response.data.statement);
        downloadCSV(
          csvData,
          `statement_${account?.accountNumber}_${statementPeriod.startDate}_to_${statementPeriod.endDate}.csv`
        );
        setShowStatementModal(false);
      }
    } catch (err) {
      console.error("Failed to download statement:", err);
      alert("Failed to download statement");
    }
  };

  const convertToCSV = (data) => {
    const headers = [
      "Date",
      "Description",
      "Type",
      "Amount",
      "Balance",
      "Status",
      "Reference",
    ];
    const rows = data.map((transaction) => [
      new Date(transaction.createdAt).toLocaleDateString("en-IN"),
      transaction.description || "",
      transaction.type,
      transaction.amount,
      transaction.balanceAfter || "",
      transaction.status,
      transaction.reference || "",
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const downloadCSV = (csvData, filename) => {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAccountAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} this account?`)) {
      return;
    }

    try {
      let response;
      switch (action) {
        case "activate":
          response = await bankAccountAPI.activateAccount(accountId);
          break;
        case "deactivate":
          response = await bankAccountAPI.deactivateAccount(accountId);
          break;
        case "close":
          response = await bankAccountAPI.closeAccount(accountId);
          break;
        default:
          return;
      }

      if (response.data.success) {
        alert(`Account ${action}d successfully`);
        fetchAccountDetails(); // Refresh account data
      }
    } catch (err) {
      console.error(`Failed to ${action} account:`, err);
      alert(`Failed to ${action} account`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Account Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            {error ||
              "The requested account does not exist or you do not have access."}
          </p>
          <button
            onClick={() => navigate("/accounts")}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center">
                <button
                  onClick={() => navigate("/accounts")}
                  className="mr-4 text-gray-600 hover:text-gray-900"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Account Details
                  </h1>
                  <p className="text-gray-600">
                    Manage your account and view transactions
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => navigate(`/accounts/${accountId}/statement`)}
                className="px-4 py-2 border border-gray-300"
              >
                Download Statement
              </button>
              <button
                onClick={() => navigate(`/accounts/transfer?from=${accountId}`)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Transfer Money
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Account Summary Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Account Number</p>
              <p className="text-2xl font-bold mt-1">{account.accountNumber}</p>
              <div className="flex items-center mt-4 space-x-4">
                <div>
                  <p className="text-blue-100 text-sm">IFSC Code</p>
                  <p className="font-medium">{account.ifsc}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Account Type</p>
                  <p className="font-medium">Savings Account</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Status</p>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      account.status === "active"
                        ? "bg-green-500 text-white"
                        : account.status === "inactive"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {account.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 text-right">
              <p className="text-blue-100 text-sm">Available Balance</p>
              <p className="text-4xl font-bold mt-2">
                {formatCurrency(account.balance)}
              </p>
              <p className="text-blue-100 mt-2">
                Last updated: {formatDate(account.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === "transactions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === "settings"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Account Holder</span>
                      <span className="font-medium">You</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Date Opened</span>
                      <span className="font-medium">
                        {formatDate(account.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Branch</span>
                      <span className="font-medium">Main Branch</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="text-gray-600">Nomination</span>
                      <span className="font-medium text-blue-600">Set Up</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() =>
                        navigate(`/accounts/transfer?from=${accountId}`)
                      }
                      className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 flex items-center justify-between"
                    >
                      <span>Transfer Money</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/transactions?account=${accountId}`)
                      }
                      className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 flex items-center justify-between"
                    >
                      <span>View All Transactions</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/accounts/${accountId}/statement`)
                      }
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                    >
                      Download Statement
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Transactions
                  </h3>
                  <Link
                    to={`/transactions?account=${accountId}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Transactions Yet
                    </h3>
                    <p className="text-gray-600">
                      Your transactions will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === "credit"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            <svg
                              className={`w-5 h-5 ${
                                transaction.type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {transaction.type === "credit" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                                />
                              )}
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">
                              {transaction.description || "Bank Transaction"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transaction.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.status === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Account Settings
                  </h3>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <svg
                        className="w-5 h-5 text-yellow-400 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-medium text-yellow-800">
                          Important
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          These actions will affect your account functionality.
                          Please proceed with caution.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          Account Status
                        </p>
                        <p className="text-sm text-gray-500">
                          Current status: {account.status}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {account.status === "inactive" && (
                          <button
                            onClick={() => handleAccountAction("activate")}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
                          >
                            Activate
                          </button>
                        )}
                        {account.status === "active" && (
                          <button
                            onClick={() => handleAccountAction("deactivate")}
                            className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700"
                          >
                            Deactivate
                          </button>
                        )}
                        <button
                          onClick={() => handleAccountAction("close")}
                          className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700"
                        >
                          Close Account
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          Account Alerts
                        </p>
                        <p className="text-sm text-gray-500">
                          Configure email and SMS notifications
                        </p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50">
                        Configure
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          Transaction Limits
                        </p>
                        <p className="text-sm text-gray-500">
                          Set daily and monthly transaction limits
                        </p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50">
                        Manage Limits
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statement Download Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Download Account Statement
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={statementPeriod.startDate}
                    onChange={(e) =>
                      setStatementPeriod((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={statementPeriod.endDate}
                    onChange={(e) =>
                      setStatementPeriod((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    The statement will be downloaded as a CSV file containing
                    all transactions within the selected period.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatementModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatementDownload}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                >
                  Download Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetails;
