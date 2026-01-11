const BankAccount = require("../models/bankAccount.model");
const Transaction = require("../models/transaction.model");
// const bcrypt = require("bcryptjs");
// const Card = require("../models/card.model");

module.exports.depositMoney = async (req, res) => {
  const { accountNumber, amount } = req.body;

  const account = await BankAccount.findOne({ accountNumber });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Account not found.",
    });
  }

  account.balance += amount;
  await account.save();

  await Transaction.create({
    fromAccount: null,
    toAccount: account._id,
    amount,
    type: "credit",
    status: "success",
    balanceAfter: account.balance,
    description: "Cash deposit by cashier",
  });

  return res.status(200).json({
    success: true,
    message: "Amount deposited successfully",
    newBalance: account.balance,
  });
};

module.exports.withdrawMoney = async (req, res) => {
  try {
    const { accountNumber, amount } = req.body;

    // ✅ Basic validation
    if (!accountNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: "Account number and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    // ✅ Find account
    const account = await BankAccount.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // ✅ Balance check
    if (account.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // ✅ Deduct balance
    account.balance -= amount;
    await account.save();

    // ✅ Create transaction
    await Transaction.create({
      fromAccount: account._id,
      toAccount: null,
      amount,
      type: "debit",
      status: "success",
      balanceAfter: account.balance,
      description: "Cash withdrawal by cashier",
    });

    return res.status(200).json({
      success: true,
      message: "Cash withdrawal successful",
      newBalance: account.balance,
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.getCashierStats = async (req, res) => {
  // Start of today (00:00)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Fetch today's transactions
  const transactions = await Transaction.find({
    createdAt: { $gte: startOfDay },
    type: { $in: ["credit", "debit"] }
  });

  // Total amount handled today
  const todayTransactions = transactions.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );

  // Unique customers served today
  const customersServed = new Set(
    transactions
      .map(txn => txn.fromAccount || txn.toAccount)
      .filter(Boolean)
      .map(id => id.toString())
  ).size;

  // Pending transactions (if you ever use pending state)
  const pendingTransactions = await Transaction.countDocuments({
    status: "pending"
  });

  // Cash balance (demo logic – replace with vault model later)
  const cashBalance = 500000;

  res.status(200).json({
    success: true,
    stats: {
      todayTransactions,
      customersServed,
      pendingTransactions,
      cashBalance
    }
  });
};


/**
 * GET /admin/cashier/transactions/recent
 */
exports.getRecentTransactions = async (req, res) => {
  const transactions = await Transaction.find({
    type: { $in: ["credit", "debit"] }
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("fromAccount", "accountNumber")
    .populate("toAccount", "accountNumber");

  // Normalize account number for frontend
  const formatted = transactions.map(txn => ({
    _id: txn._id,
    type: txn.type,
    amount: txn.amount,
    status: txn.status,
    createdAt: txn.createdAt,
    accountNumber:
      txn.toAccount?.accountNumber ||
      txn.fromAccount?.accountNumber ||
      "N/A"
  }));

  res.status(200).json({
    success: true,
    transactions: formatted
  });
};