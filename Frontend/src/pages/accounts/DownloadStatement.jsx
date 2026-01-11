import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { bankAccountAPI } from "../../services/api";
import { generateBankStatement } from "../../utils/statementUtils";

import {
  Download,
  Calendar,
  ArrowLeft,
  FileText,
  Printer,
  Mail,
  AlertCircle,
} from "lucide-react";

const DownloadStatement = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Statement options
  const [selectedPeriod, setSelectedPeriod] = useState("lastMonth");
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [format, setFormat] = useState("pdf"); // pdf, csv, excel

  // Available statement periods
  const statementPeriods = [
    { id: "lastMonth", label: "Last Month", days: 30 },
    { id: "last3Months", label: "Last 3 Months", days: 90 },
    { id: "last6Months", label: "Last 6 Months", days: 180 },
    { id: "currentYear", label: "Current Year", days: 365 },
    { id: "custom", label: "Custom Date Range", days: 0 },
  ];

  useEffect(() => {
    if (accountId) {
      fetchAccountDetails();
    }
  }, [accountId]);

  const fetchAccountDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await bankAccountAPI.getAccountDetails(accountId);
      if (response.data.success) {
        setAccount(response.data.account);

        // Set default dates for last month
        const today = new Date();
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );

        setCustomDates({
          startDate: lastMonth.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });
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

  const calculateDateRange = () => {
    const today = new Date();
    let startDate,
      endDate = today.toISOString().split("T")[0];

    switch (selectedPeriod) {
      case "lastMonth":
        startDate = new Date(today.setMonth(today.getMonth() - 1))
          .toISOString()
          .split("T")[0];
        break;
      case "last3Months":
        startDate = new Date(today.setMonth(today.getMonth() - 3))
          .toISOString()
          .split("T")[0];
        break;
      case "last6Months":
        startDate = new Date(today.setMonth(today.getMonth() - 6))
          .toISOString()
          .split("T")[0];
        break;
      case "currentYear":
        startDate = new Date(today.getFullYear(), 0, 1)
          .toISOString()
          .split("T")[0];
        break;
      case "custom":
        startDate = customDates.startDate;
        endDate = customDates.endDate;
        break;
      default:
        startDate = new Date(today.setMonth(today.getMonth() - 1))
          .toISOString()
          .split("T")[0];
    }

    return { startDate, endDate };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDateDisplay = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Function to fetch transactions for the statement
  const fetchStatementTransactions = async (startDate, endDate) => {
    try {
      // First, get account transactions
      const response = await bankAccountAPI.getTransactions(accountId);
      if (response.data.success) {
        const allTransactions = response.data.transactions || [];

        // Filter transactions by date range
        const filteredTransactions = allTransactions.filter((transaction) => {
          const transactionDate = new Date(transaction.createdAt)
            .toISOString()
            .split("T")[0];
          return transactionDate >= startDate && transactionDate <= endDate;
        });

        // Sort by date descending
        filteredTransactions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        return filteredTransactions;
      }
      return [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };

  // Generate CSV data
  const generateCSVData = (transactions, startDate, endDate) => {
    const headers = [
      "Date",
      "Time",
      "Description",
      "Transaction Type",
      "Amount",
      "Status",
      "Balance",
    ];

    const rows = transactions.map((transaction) => {
      const date = new Date(transaction.createdAt);
      return [
        date.toLocaleDateString("en-IN"),
        date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        transaction.description || "Transaction",
        transaction.type === "debit" ? "Debit" : "Credit",
        (transaction.type === "debit" ? "-" : "+") +
          formatCurrency(transaction.amount).replace("₹", ""),
        transaction.status || "success",
        formatCurrency(transaction.balanceAfter).replace("₹", ""),
      ];
    });

    // Add summary row
    const totalDebits = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCredits = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);

    const netChange = totalCredits - totalDebits;
    const startingBalance = account?.balance ? account.balance - netChange : 0;

    const summaryRows = [
      [],
      ["SUMMARY"],
      [
        "Starting Balance",
        "",
        "",
        "",
        formatCurrency(startingBalance).replace("₹", ""),
        "",
        "",
      ],
      [
        "Total Debits",
        "",
        "",
        "",
        formatCurrency(totalDebits).replace("₹", ""),
        "",
        "",
      ],
      [
        "Total Credits",
        "",
        "",
        "",
        formatCurrency(totalCredits).replace("₹", ""),
        "",
        "",
      ],
      [
        "Net Change",
        "",
        "",
        "",
        (netChange >= 0 ? "+" : "") +
          formatCurrency(netChange).replace("₹", ""),
        "",
        "",
      ],
      [
        "Ending Balance",
        "",
        "",
        "",
        formatCurrency(account?.balance || 0).replace("₹", ""),
        "",
        "",
      ],
    ];

    const allRows = [
      [`Account Statement: ${account?.accountNumber}`],
      [
        `Period: ${formatDateDisplay(startDate)} to ${formatDateDisplay(
          endDate
        )}`,
      ],
      ["Generated on: " + new Date().toLocaleDateString("en-IN")],
      [],
      headers,
      ...rows,
      ...summaryRows,
    ];

    return allRows.map((row) => row.join(",")).join("\n");
  };

  // Generate PDF content (simplified version)
  const generatePDFContent = (transactions, startDate, endDate) => {
    let pdfContent = `
      Account Statement
      Account Number: ${account?.accountNumber}
      Period: ${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}
      Generated on: ${new Date().toLocaleDateString("en-IN")}
      
      Date        Description                Type      Amount      Balance
      ${"=".repeat(80)}
    `;

    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString("en-IN");
      const type = transaction.type === "debit" ? "Debit" : "Credit";
      const amount = formatCurrency(transaction.amount);
      const balance = formatCurrency(transaction.balanceAfter);

      pdfContent += `
      ${date.padEnd(10)} ${transaction.description
        ?.substring(0, 30)
        .padEnd(30)} ${type.padEnd(8)} ${amount.padStart(
        12
      )} ${balance.padStart(15)}
      `;
    });

    // Add summary
    const totalDebits = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCredits = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);

    const netChange = totalCredits - totalDebits;

    pdfContent += `
      
      SUMMARY:
      Total Debits: ${formatCurrency(totalDebits)}
      Total Credits: ${formatCurrency(totalCredits)}
      Net Change: ${formatCurrency(netChange)}
      Ending Balance: ${formatCurrency(account?.balance || 0)}
    `;

    return pdfContent;
  };

  // Generate Excel content (simplified - actually CSV with .xlsx extension)
  const generateExcelContent = (transactions, startDate, endDate) => {
    return generateCSVData(transactions, startDate, endDate);
  };

  const handleDownload = async () => {
    if (!accountId) return;

    const { startDate, endDate } = calculateDateRange();
    setDownloading(true);

    try {
      const transactions = await fetchStatementTransactions(startDate, endDate);

      if (!transactions.length) {
        alert("No transactions found");
        return;
      }

      let blob;
      let filename;

      if (format === "pdf") {
        blob = await generateBankStatement.generatePDF(
          account,
          transactions,
          startDate,
          endDate,
          formatDateDisplay,
          formatCurrency
        );
        filename = `Statement_${account.accountNumber}_${startDate}_to_${endDate}.pdf`;
      }

      if (format === "csv") {
        const csv = generateBankStatement.generateCSV(
          account,
          transactions,
          startDate,
          endDate,
          formatDateDisplay,
          formatCurrency
        );
        blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        filename = `Statement_${account.accountNumber}_${startDate}_to_${endDate}.csv`;
      }

      if (format === "excel") {
        blob = await generateBankStatement.generateExcel(
          account,
          transactions,
          startDate,
          endDate,
          formatDateDisplay,
          formatCurrency
        );
        filename = `Statement_${account.accountNumber}_${startDate}_to_${endDate}.xlsx`;
      }

      // 🔽 DOWNLOAD (this part is critical)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      alert("Statement downloaded successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to generate statement");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    const { startDate, endDate } = calculateDateRange();

    if (!startDate || !endDate) {
      alert("Please select valid dates");
      return;
    }

    try {
      const transactions = await fetchStatementTransactions(startDate, endDate);

      if (transactions.length === 0) {
        alert("No transactions found for the selected period");
        return;
      }

      // Create print content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Account Statement - ${account?.accountNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .account-info { margin-bottom: 20px; }
            .transaction-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .transaction-table th { background-color: #f2f2f2; padding: 12px; text-align: left; border: 1px solid #ddd; }
            .transaction-table td { padding: 10px; border: 1px solid #ddd; }
            .debit { color: #dc2626; }
            .credit { color: #059669; }
            .summary { margin-top: 30px; padding: 20px; background-color: #f9fafb; border: 1px solid #ddd; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>K2F SECURE BANK</h1>
            <h2>Account Statement</h2>
          </div>
          
          <div class="account-info">
            <p><strong>Account Number:</strong> ${account?.accountNumber}</p>
            <p><strong>Statement Period:</strong> ${formatDateDisplay(
              startDate
            )} to ${formatDateDisplay(endDate)}</p>
            <p><strong>Generated On:</strong> ${new Date().toLocaleDateString(
              "en-IN"
            )}</p>
          </div>

          <table class="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${transactions
                .map((transaction) => {
                  const date = new Date(transaction.createdAt);
                  return `
                  <tr>
                    <td>${date.toLocaleDateString("en-IN")}</td>
                    <td>${transaction.description || "Transaction"}</td>
                    <td>${
                      transaction.type === "debit" ? "Debit" : "Credit"
                    }</td>
                    <td class="${transaction.type}">
                      ${
                        transaction.type === "debit" ? "-" : "+"
                      }${formatCurrency(transaction.amount)}
                    </td>
                    <td>${formatCurrency(transaction.balanceAfter)}</td>
                    <td>${transaction.status || "success"}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>

          <div class="summary">
            <h3>Summary</h3>
            ${(() => {
              const totalDebits = transactions
                .filter((t) => t.type === "debit")
                .reduce((sum, t) => sum + t.amount, 0);

              const totalCredits = transactions
                .filter((t) => t.type === "credit")
                .reduce((sum, t) => sum + t.amount, 0);

              const netChange = totalCredits - totalDebits;
              const startingBalance = account?.balance
                ? account.balance - netChange
                : 0;

              return `
                <p><strong>Starting Balance:</strong> ${formatCurrency(
                  startingBalance
                )}</p>
                <p><strong>Total Debits:</strong> ${formatCurrency(
                  totalDebits
                )}</p>
                <p><strong>Total Credits:</strong> ${formatCurrency(
                  totalCredits
                )}</p>
                <p><strong>Net Change:</strong> ${formatCurrency(netChange)}</p>
                <p><strong>Ending Balance:</strong> ${formatCurrency(
                  account?.balance || 0
                )}</p>
              `;
            })()}
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
        </html>
      `;

      // Open print window
      const printWindow = window.open("", "_blank");
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Auto print after content loads
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (err) {
      console.error("Failed to print statement:", err);
      alert("Failed to print statement. Please try again.");
    }
  };

  const handleEmail = () => {
    alert("Email functionality would be implemented with backend integration");
    // This would require backend API to send email with attachment
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Account Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            {error ||
              "The requested account does not exist or you do not have access."}
          </p>
          <button
            onClick={() => navigate("/accounts")}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/accounts/${accountId}`)}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Download Account Statement
              </h1>
              <p className="text-gray-600">
                Generate and download account statements
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Account Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {account.accountNumber}
                </h3>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-sm text-gray-600">Savings Account</span>
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      account.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {account.status?.toUpperCase() || "ACTIVE"}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Statement Options */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Statement Options
            </h2>

            {/* Select Period */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Statement Period
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {statementPeriods.map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPeriod === period.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                          selectedPeriod === period.id
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedPeriod === period.id && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span
                        className={`font-medium ${
                          selectedPeriod === period.id
                            ? "text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {period.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            {selectedPeriod === "custom" && (
              <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-4">
                  Custom Date Range
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customDates.startDate}
                      onChange={(e) =>
                        setCustomDates((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customDates.endDate}
                      onChange={(e) =>
                        setCustomDates((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Date Range Preview */}
            <div className="mb-8">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Selected Period</p>
                  <p className="font-medium text-gray-900">
                    {formatDateDisplay(calculateDateRange().startDate)} to{" "}
                    {formatDateDisplay(calculateDateRange().endDate)}
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            {/* File Format */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select File Format
              </label>
              <div className="flex space-x-4">
                {["csv", "pdf", "excel"].map((fileFormat) => (
                  <button
                    key={fileFormat}
                    onClick={() => setFormat(fileFormat)}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                      format === fileFormat
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {fileFormat.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {format === "pdf" &&
                  "PDF format is suitable for viewing and printing"}
                {format === "csv" && "CSV format is suitable for data analysis"}
                {format === "excel" &&
                  "Excel format is suitable for spreadsheet analysis"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating Statement...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-3" />
                    Download Statement ({format.toUpperCase()})
                  </>
                )}
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-5 h-5 mr-3" />
                  Print Preview
                </button>

                <button
                  onClick={handleEmail}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Email Statement
                </button>
              </div>
            </div>
          </div>

          {/* Help Information */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              Important Information
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>
                  Statements are generated for the selected date range
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>
                  All transactions include date, description, amount, and
                  balance
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>
                  Print preview opens in a new window with optimized formatting
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm">✓</span>
                </div>
                <span>
                  For email statements, please ensure your email is verified
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadStatement;
