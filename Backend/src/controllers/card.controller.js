const CardRequest = require("../models/cardRequest.model");
const BankAccount = require("../models/bankAccount.model");
const Card = require("../models/card.model");
const Otp = require("../models/otp.model");
const { sendEmail } = require("../utils/sendEmail");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

module.exports.requestCard = async (req, res) => {
  const userId = req.user.id;
  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({
      success: false,
      message: "accountId is required",
    });
  }

  // Check if the account belongs to the user
  const account = await BankAccount.findOne({
    _id: accountId,
    userId,
  });

  if (!account) {
    return res.status(404).json({
      success: false,
      message: "Account not found or does not belong to you",
    });
  }

  // multiple pending requests
  const existingRequest = await CardRequest.findOne({
    accountId,
    status: "pending",
  });

  if (existingRequest) {
    return res.status(400).json({
      success: false,
      message: "You already have a pending card request for this account",
    });
  }

  // multiple approved cards on same account
  const approvedCard = await CardRequest.findOne({
    accountId,
    status: "approved",
  });

  if (approvedCard) {
    return res.status(400).json({
      success: false,
      message: "You already have a card for this account",
    });
  }

  // Create new card request
  const cardReq = await CardRequest.create({
    userId,
    accountId,
  });

  return res.status(200).json({
    success: true,
    message: "Card request submitted successfully",
    requestId: cardReq._id,
  });
};

module.exports.getCardStatus = async (req, res) => {
  const userId = req.user.id;

  const requests = await CardRequest.find({ userId }).populate(
    "accountId",
    "accountNumber balance"
  );

  return res.status(200).json({
    success: true,
    requests,
  });
};

module.exports.getMyCards = async (req, res) => {
  const userId = req.user.id;

  // Find all cards for this user
  const cards = await Card.find({ userId }).populate(
    "accountId",
    "accountNumber balance"
  );

  // Mask card number for security
  const allCards = cards.map((card) => {
    return {
      cardId: card._id,
      accountId: card.accountId._id, // ✅ ADD THIS
      accountNumber: card.accountId.accountNumber,
      cardNumber: card.cardNumber,
      expiry: card.expiry,
      status: card.status,
      isBlocked: card.isBlocked,
      pinSet: card.pinSet,
      createdAt: card.createdAt,
    };
  });

  return res.status(200).json({
    success: true,
    cards: allCards,
  });
};

module.exports.sendUnblockOtp = async (req, res) => {
  const userId = req.user.id;
  const { cardId } = req.body;

  const card = await Card.findOne({ _id: cardId, userId });

  if (!card) {
    return res.status(404).json({ success: false, message: "Card not found" });
  }

  if (!card.isBlocked) {
    return res
      .status(400)
      .json({ success: false, message: "Card is not blocked" });
  }

  // Clear old OTPs
  await Otp.updateMany(
    { userId, type: "unblock-card", used: false },
    { used: true }
  );

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  await Otp.create({
    userId,
    otp,
    type: "unblock-card",
    expiresAt,
    used: false,
    cardId,
  });

  await sendEmail(req.user.email, "Unblock ATM Card", `Your OTP is ${otp}`);

  return res.status(200).json({
    success: true,
    message: "OTP sent successfully",
  });
};

module.exports.verifyUnblockOtp = async (req, res) => {
  const userId = req.user.id;
  const { cardId, otp } = req.body;

  const card = await Card.findOne({ _id: cardId, userId });

  if (!card) {
    return res.status(404).json({ success: false, message: "Card not found" });
  }

  const otpData = await Otp.findOne({
    userId,
    cardId,
    otp,
    type: "unblock-card",
    used: false,
  });

  if (!otpData) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  if (otpData.expiresAt < Date.now()) {
    otpData.used = true;
    await otpData.save();
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  // Mark OTP used
  otpData.used = true;
  await otpData.save();

  // Unblock the card
  card.isBlocked = false;
  card.retryCount = 0;
  await card.save();

  return res.status(200).json({
    success: true,
    message: "Card unblocked successfully",
  });
};
module.exports.blockCard = async (req, res) => {
  const userId = req.user.id;
  const { cardId, reason } = req.body;

  const card = await Card.findOne({ _id: cardId, userId });

  if (!card) {
    return res.status(404).json({ success: false, message: "Card not found" });
  }

  if (card.isBlocked) {
    return res
      .status(400)
      .json({ success: false, message: "Card is already blocked" });
  }

  // Block the card
  card.isBlocked = true;
  card.status = "blocked";
  card.blockType = reason === "Lost/Stolen" ? "permanent" : "temporary";
  card.blockReason = reason;
  card.retryCount = 0;

  await card.save();

  return res.status(200).json({
    success: true,
    message: `Card ${
      card.blockType === "permanent" ? "permanently" : "temporarily"
    } blocked successfully`,
  });
};
