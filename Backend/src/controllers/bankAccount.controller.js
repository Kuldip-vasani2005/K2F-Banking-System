const BankAccount = require("../models/bankAccount.model");
const Transaction = require("../models/transaction.model");
const Card = require("../models/card.model");
const bcrypt = require("bcryptjs");

exports.getMyAccounts = async (req, res) => {
  const userId = req.user.id;

  const accounts = await BankAccount.find({ userId });

  const formatted = accounts.map((acc) => ({
    _id: acc._id,
    accountNumber: acc.accountNumber,
    accountName: acc.accountName,
    accountType: acc.accountType,
    balance: acc.balance,
    ifsc: acc.ifsc,
    status: acc.status,
    minimumBalance: acc.minimumBalance,
    interestRate: acc.interestRate,
    overdraftLimit: acc.overdraftLimit,
    createdAt: acc.createdAt,
  }));

  return res.status(200).json({
    success: true,
    accounts: formatted,
    totalAccounts: formatted.length,
  });
};

exports.getAccountDetails = async (req, res) => {
  const { accountId } = req.params;
  const userId = req.user.id;

  const account = await BankAccount.findOne({ _id: accountId, userId });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Account not found",
    });
  }

  res.status(200).json({
    success: true,
    account,
  });
};

module.exports.transferMoney = async (req, res) => {
  const userId = req.user.id;
  const { fromAccountId, toAccountNumber, amount, atmPin } = req.body;

  // Validate required fields
  if (!fromAccountId || !toAccountNumber || !amount || !atmPin) {
    return res.status(400).json({
      success: false,
      message:
        "fromAccountId, toAccountNumber, amount, and atmPin are required",
    });
  }

  // Check sender account & ownership
  const fromAccount = await BankAccount.findOne({
    _id: fromAccountId,
    userId,
  });

  if (!fromAccount) {
    return res.status(404).json({
      success: false,
      message: "Source account not found or not owned by user",
    });
  }

  // ✅ Check account type restrictions
  if (fromAccount.accountType === "current") {
    // For current accounts, check minimum balance requirement
    const effectiveBalance = fromAccount.balance - fromAccount.minimumBalance;
    if (effectiveBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Current accounts require a minimum balance of ₹${fromAccount.minimumBalance.toLocaleString()}`,
        requiredMinimum: fromAccount.minimumBalance,
        availableForTransfer: effectiveBalance,
      });
    }
  } else {
    // For savings accounts, check regular balance
    if (fromAccount.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }
  }

  // Get the card linked to this account
  const card = await Card.findOne({
    accountId: fromAccountId,
    userId,
  });

  if (!card) {
    return res.status(400).json({
      success: false,
      message: "No debit card found for this account. Please get a card first.",
    });
  }

  if (!card.pinHash) {
    return res.status(400).json({
      success: false,
      message: "Card PIN not set. Please set your card PIN first.",
    });
  }

  if (card.isBlocked) {
    return res.status(400).json({
      success: false,
      message: "Your card is blocked. Please unblock it first.",
    });
  }

  // Verify ATM PIN
  const isPinValid = await bcrypt.compare(atmPin, card.pinHash);
  if (!isPinValid) {
    // Increment retry count
    card.retryCount = (card.retryCount || 0) + 1;

    // Block card after 3 wrong attempts
    if (card.retryCount >= 3) {
      card.isBlocked = true;
      await card.save();
      return res.status(400).json({
        success: false,
        message:
          "Too many wrong PIN attempts. Card has been blocked for security.",
      });
    }

    await card.save();

    const attemptsLeft = 3 - card.retryCount;
    return res.status(400).json({
      success: false,
      message: `Invalid PIN. ${attemptsLeft} attempt(s) left before card is blocked.`,
    });
  }

  // Reset retry count on successful PIN verification
  card.retryCount = 0;
  await card.save();

  // Check receiver account by accountNumber
  const toAccount = await BankAccount.findOne({
    accountNumber: toAccountNumber,
  });

  if (!toAccount) {
    return res.status(404).json({
      success: false,
      message: "Destination account not found",
    });
  }

  // transferring to same account not allowed
  if (toAccount._id.toString() === fromAccount._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "Cannot transfer to the same account",
    });
  }

  // Check minimum amount
  if (amount < 100) {
    return res.status(400).json({
      success: false,
      message: "Minimum transfer amount is ₹100",
    });
  }

  // Check daily transfer limit based on account type
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTransactions = await Transaction.find({
    fromAccount: fromAccountId,
    type: "debit",
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  const todayTotal = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const remainingAfterThis = todayTotal + amount;

  // Set different limits for account types
  const dailyLimit = fromAccount.accountType === "current" ? 200000 : 100000;
  const limitName = fromAccount.accountType === "current" ? "₹200,000" : "₹100,000";

  if (remainingAfterThis > dailyLimit) {
    const remainingToday = dailyLimit - todayTotal;
    return res.status(400).json({
      success: false,
      message: `Daily transfer limit exceeded. ${limitName} limit per day. You can transfer up to ₹${remainingToday.toLocaleString()} more today.`,
      dailyLimit: dailyLimit,
      usedToday: todayTotal,
      remainingToday: remainingToday,
    });
  }

  // Check monthly transaction limit for savings accounts
  if (fromAccount.accountType === "saving") {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthlyTransactions = await Transaction.find({
      fromAccount: fromAccountId,
      type: "debit",
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    });

    if (monthlyTransactions.length >= fromAccount.monthlyTransactionLimit) {
      return res.status(400).json({
        success: false,
        message: `Monthly transaction limit reached. Savings accounts are limited to ${fromAccount.monthlyTransactionLimit} transactions per month.`,
      });
    }
  }

  // ✅ Calculate effective balance for current accounts
  let fromBalanceAfter = fromAccount.balance;
  if (fromAccount.accountType === "current") {
    // For current accounts, we need to consider minimum balance
    fromBalanceAfter = fromAccount.balance - amount;
    // Ensure we don't go below minimum balance
    if (fromBalanceAfter < fromAccount.minimumBalance) {
      return res.status(400).json({
        success: false,
        message: `Transfer would bring balance below minimum requirement of ₹${fromAccount.minimumBalance.toLocaleString()}`,
      });
    }
  } else {
    // For savings accounts
    fromBalanceAfter = fromAccount.balance - amount;
  }

  // Deduct from sender
  fromAccount.balance = fromBalanceAfter;
  await fromAccount.save();

  // Add to receiver
  toAccount.balance += amount;
  await toAccount.save();

  // Check if both accounts belong to same user
  const isSameUser =
    fromAccount.userId.toString() === toAccount.userId.toString();

  // Create debit transaction (Sender)
  const senderDescription = isSameUser
    ? `Transfer to your ${toAccount.accountType} account ${toAccount.accountNumber.slice(-4)}`
    : `Transfer to ${toAccount.accountType} account ${toAccount.accountNumber.slice(-4)}`;

  await Transaction.create({
    fromAccount: fromAccount._id,
    toAccount: toAccount._id,
    amount,
    type: "debit",
    status: "success",
    balanceAfter: fromAccount.balance,
    description: senderDescription,
    accountType: fromAccount.accountType, // Store account type in transaction
  });

  // Create credit transaction (Receiver)
  const receiverDescription = isSameUser
    ? `Transfer from your ${fromAccount.accountType} account ${fromAccount.accountNumber.slice(-4)}`
    : `Transfer from ${fromAccount.accountType} account ${fromAccount.accountNumber.slice(-4)}`;

  await Transaction.create({
    fromAccount: fromAccount._id,
    toAccount: toAccount._id,
    amount,
    type: "credit",
    status: "success",
    balanceAfter: toAccount.balance,
    description: receiverDescription,
    accountType: toAccount.accountType, // Store account type in transaction
  });

  return res.status(200).json({
    success: true,
    message: "Transfer successful",
    transactionId: new Date().getTime(),
    fromAccount: {
      balance: fromAccount.balance,
      accountNumber: fromAccount.accountNumber,
      accountType: fromAccount.accountType,
    },
    toAccount: {
      accountNumber: toAccount.accountNumber,
      accountType: toAccount.accountType,
    },
    amount: amount,
    dailyLimitUsed: remainingAfterThis,
    dailyLimitRemaining: dailyLimit - remainingAfterThis,
  });
};

// Update getTransactions to include account type info
module.exports.getTransactions = async (req, res) => {
  const userId = req.user.id;
  const { accountId } = req.params;

  // 1️⃣ Validate ownership
  const account = await BankAccount.findOne({ _id: accountId, userId });
  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Account not found or access denied",
    });
  }

  // 2️⃣ Fetch ONLY valid transactions for this account
  const transactions = await Transaction.find({
    $or: [
      { fromAccount: accountId, type: "debit" },
      { toAccount: accountId, type: "credit" },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  // 3️⃣ Format response with account type info
  const formatted = transactions.map((tx) => ({
    _id: tx._id,
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    accountType: tx.accountType, // Include account type in response
    status: tx.status,
    createdAt: tx.createdAt,
    balanceAfter: tx.balanceAfter,
  }));

  return res.status(200).json({
    success: true,
    accountId,
    accountType: account.accountType,
    transactions: formatted,
  });
};

module.exports.getRecentTransactions = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get user's accounts
    const accounts = await BankAccount.find({ userId });

    if (!accounts || accounts.length === 0) {
      return res.status(200).json({
        success: true,
        transactions: [],
      });
    }

    const accountIds = accounts.map((acc) => acc._id);

    // Get recent transactions where user's accounts are involved
    const transactions = await Transaction.find({
      $or: [
        { fromAccount: { $in: accountIds } },
        { toAccount: { $in: accountIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Format transactions for frontend
    const formattedTransactions = [];

    for (const tx of transactions) {
      // Check if both accounts belong to the user
      const fromAccount = await BankAccount.findById(tx.fromAccount).select(
        "userId accountNumber accountType"
      );
      const toAccount = await BankAccount.findById(tx.toAccount).select(
        "userId accountNumber accountType"
      );

      const isFromUser =
        fromAccount && fromAccount.userId.toString() === userId.toString();
      const isToUser =
        toAccount && toAccount.userId.toString() === userId.toString();

      // Only include transactions where at least one side is the user
      if (isFromUser || isToUser) {
        let description = tx.description;
        let type = tx.type;

        if (isFromUser && isToUser) {
          // Internal transfer between user's own accounts
          if (fromAccount && toAccount) {
            description = `Transfer from ${fromAccount.accountType} account ${fromAccount.accountNumber.slice(
              -4
            )} to ${toAccount.accountType} account ${toAccount.accountNumber.slice(-4)}`;
          }
          type = accounts.find(
            (acc) => acc._id.toString() === tx.fromAccount?.toString()
          )
            ? "debit"
            : "credit";
        } else if (isFromUser) {
          type = "debit";
          description = tx.description || "Payment sent";
        } else if (isToUser) {
          type = "credit";
          description = tx.description || "Payment received";
        }

        formattedTransactions.push({
          _id: tx._id,
          type: type,
          amount: tx.amount,
          description: description || "Transaction",
          accountType: tx.accountType || fromAccount?.accountType || toAccount?.accountType,
          status: tx.status,
          createdAt: tx.createdAt,
          balanceAfter: tx.balanceAfter,
        });
      }
    }

    return res.status(200).json({
      success: true,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent transactions",
    });
  }
};

// Update getAccountStatement to include account type
module.exports.getAccountStatement = async (req, res) => {
  const userId = req.user.id;
  const { accountId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "startDate and endDate are required",
    });
  }

  // 1️⃣ Verify account ownership
  const account = await BankAccount.findOne({ _id: accountId, userId });
  if (!account) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  // 2️⃣ Fetch transactions within date range
  const transactions = await Transaction.find({
    $and: [
      {
        $or: [
          { fromAccount: accountId, type: "debit" },
          { toAccount: accountId, type: "credit" },
        ],
      },
      {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    ],
  })
    .sort({ createdAt: 1 })
    .lean();

  // 3️⃣ Calculate opening balance
  let openingBalance = account.balance;
  for (let i = transactions.length - 1; i >= 0; i--) {
    const tx = transactions[i];
    openingBalance =
      tx.type === "credit"
        ? openingBalance - tx.amount
        : openingBalance + tx.amount;
  }

  // 4️⃣ Format transactions with account type
  const formatted = transactions.map((tx) => ({
    date: tx.createdAt,
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    accountType: tx.accountType || account.accountType,
    status: tx.status,
    balanceAfter: tx.balanceAfter,
  }));

  return res.status(200).json({
    success: true,
    account: {
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      accountName: account.accountName,
    },
    period: { startDate, endDate },
    openingBalance,
    closingBalance: account.balance,
    transactions: formatted,
  });
};

// ✅ Add new function to get account type limits
module.exports.getAccountLimits = async (req, res) => {
  const userId = req.user.id;
  const { accountId } = req.params;

  const account = await BankAccount.findOne({
    _id: accountId,
    userId,
  });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Account not found",
    });
  }

  const limits = {
    accountType: account.accountType,
    accountName: account.accountName,
    dailyTransferLimit: account.accountType === "current" ? 200000 : 50000,
    monthlyTransactionLimit: account.monthlyTransactionLimit,
    minimumBalance: account.minimumBalance,
    overdraftLimit: account.overdraftLimit,
    interestRate: account.interestRate,
    features: account.accountType === "current" 
      ? ["Unlimited transactions", "Overdraft facility", "Free cheque book"]
      : ["Interest earnings", "Zero minimum balance", "Mobile banking"],
  };

  return res.status(200).json({
    success: true,
    limits,
  });
};