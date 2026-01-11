//atm controller

const Card = require("../models/card.model");
const Transaction = require("../models/transaction.model");
const Otp = require("../models/otp.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail.js");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

module.exports.setPin = async (req, res) => {

    const { cardNumber, pin } = req.body;

    const cardData = await Card.findOne({ cardNumber, status: "active" }).populate("userId");

    if (!cardData) {
        return res.status(404).json({
            success: false,
            message: "Card not found."
        });
    }

    //  Clear old OTPs
    await Otp.updateMany(
        { userId: cardData.userId._id, type: "set-pin-ATM", used: false },
        { used: true }
    );

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    const pinHash = await bcrypt.hash(pin, 10);

    await Otp.create({
        userId: cardData.userId._id,
        otp,
        expiresAt,
        type: "set-pin-ATM",
        used: false,
        pinHash
    });

    await sendEmail(cardData.userId.email, "Set ATM PIN", `Your OTP is ${otp}`);

    return res.status(200).json({
        success: true,
        message: "OTP sent successfully.",
        cardId: cardData._id
    });
};

module.exports.verifyOtpOfATM = async (req, res) => {
    const { cardId, otp } = req.body;

    const cardData = await Card.findOne({ _id: cardId, status: "active" });

    if (!cardData) {
        return res.status(404).json({
            success: false,
            message: "Card not found."
        });
    }

    const otpData = await Otp.findOne({
        userId: cardData.userId,
        otp,
        type: "set-pin-ATM",
        used: false
    });

    if (!otpData) {
        return res.status(400).json({
            success: false,
            message: "Invalid OTP."
        });
    }

    if (otpData.expiresAt < Date.now()) {
        otpData.used = true;
        await otpData.save();
        return res.status(400).json({ success: false, message: "OTP expired." });
    }

    // Mark OTP as used
    otpData.used = true;
    await otpData.save();

    cardData.pinHash = otpData.pinHash;
    await cardData.save();

    return res.status(200).json({
        success: true,
        message: "ATM PIN created successfully."
    });
};

module.exports.atmLogin = async (req, res) => {

    const { cardNumber, pin } = req.body;

    const cardData = await Card.findOne({ cardNumber });

    if (!cardData) {
        return res.status(404).json({
            success: false,
            message: "Card not found"
        });
    }

    if (cardData.status !== "active") {
        return res.status(400).json({
            success: false,
            message: "This card is not active"
        });
    }

    if (cardData.isBlocked) {
        return res.status(403).json({
            success: false,
            message: "Card is blocked due to wrong PIN attempts"
        });
    }

    const isMatch = await bcrypt.compare(pin, cardData.pinHash);

    if (!isMatch) {
        cardData.retryCount += 1;

        if (cardData.retryCount >= 3) {
            cardData.isBlocked = true;
        }

        await cardData.save();

        return res.status(400).json({
            success: false,
            message: "Incorrect PIN"
        });

    }

    cardData.retryCount = 0;
    await cardData.save();

    // Create ATM Session Token
    const atmToken = jwt.sign(
        { cardId: cardData._id },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
    );

    return res.status(200).json({
        success: true,
        message: "ATM Login successful",
        atmToken,
        cardId: cardData._id
    });

}

module.exports.atmWithdraw = async (req, res) => {
    const { amount, pin } = req.body;
    const cardId = req.cardId;  // from authAtm middleware

    const cardData = await Card.findById(cardId).populate("accountId");

    if (!cardData) {
        return res.status(404).json({
            success: false,
            message: "Card not found"
        });
    }

    if (cardData.status !== "active") {
        return res.status(403).json({
            success: false,
            message: "Card is not active."
        });
    }

    if (cardData.isBlocked) {
        return res.status(403).json({
            success: false,
            message: "Card is blocked due to repeated incorrect PIN attempts"
        });
    }

    // Verify PIN again
    const isMatch = await bcrypt.compare(pin, cardData.pinHash);

    if (!isMatch) {
        cardData.retryCount += 1;

        if (cardData.retryCount >= 3) {
            cardData.isBlocked = true;
        }

        await cardData.save();

        return res.status(400).json({
            success: false,
            message: "Incorrect PIN"
        });
    }

    // Reset retry attempts after successful PIN
    cardData.retryCount = 0;
    await cardData.save();

    const account = cardData.accountId;

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Linked bank account not found"
        });
    }

    if (account.balance < amount) {
        return res.status(400).json({
            success: false,
            message: "Insufficient balance"
        });
    }

    // Deduct balance
    account.balance -= amount;
    await account.save();

    // Add transaction entry
    await Transaction.create({
        fromAccount: account._id,
        toAccount: null,
        amount,
        type: "withdraw",
        status: "success",
        balanceAfter: account.balance,
        description: "ATM Withdrawal"
    });

    return res.status(200).json({
        success: true,
        message: "Cash withdrawal successful",
        remainingBalance: account.balance
    });
};

module.exports.getAtmBalance = async (req, res) => {
    const { pin } = req.body;
    const cardId = req.cardId; // From authAtm middleware

    const cardData = await Card.findById(cardId).populate("accountId");

    if (!cardData) {
        return res.status(404).json({
            success: false,
            message: "Card not found"
        });
    }

    if (cardData.status !== "active") {
        return res.status(403).json({
            success: false,
            message: "Card is not active"
        });
    }

    if (cardData.isBlocked) {
        return res.status(403).json({
            success: false,
            message: "Card is blocked due to multiple wrong PIN attempts"
        });
    }

    // Verify PIN AGAIN
    const isMatch = await bcrypt.compare(pin, cardData.pinHash);

    if (!isMatch) {
        cardData.retryCount += 1;

        if (cardData.retryCount >= 3) {
            cardData.isBlocked = true;
        }

        await cardData.save();

        return res.status(400).json({
            success: false,
            message: "Incorrect PIN"
        });
    }

    // Reset retry count
    cardData.retryCount = 0;
    await cardData.save();

    const account = cardData.accountId;

    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Associated bank account not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Balance fetched successfully",
        balance: account.balance,
        accountNumber: account.accountNumber
    });
};