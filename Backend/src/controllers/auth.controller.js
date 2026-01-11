//login, signup, otp related controllers
const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail.js");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

module.exports.signup = async (req, res) => {

  const { fullName, email, mobile, password } = req.body;

  // check email
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: "Email already exists"
    });
  }

  // check mobile
  const existingMobile = await User.findOne({ mobile });
  if (existingMobile) {
    return res.status(400).json({
      success: false,
      message: "Mobile already exists"
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    mobile,
    passwordHash: hash
  });

  const otp = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  await Otp.create({
    userId: user._id,
    otp,
    type: "signup",
    expiresAt
  });

  await sendEmail(email, "Verify your account", `Your OTP is ${otp}`);

  return res.status(200).json({
    success: true,
    message: "Signup successful",
    userId: user._id
  });

};

module.exports.verifyOtp = async (req, res) => {
  
  const { otp, userId } = req.body;

  // Find active signup OTP
  const otpData = await Otp.findOne({
    userId,
    type: "signup",
    used: false
  });

  if (!otpData) {
    return res.status(400).json({ message: "No active OTP found" });
  }

  if (otpData.expiresAt < Date.now()) {
    return res.status(400).json({
      success: false,
      message: "OTP expired"
    });
  }

  if (otpData.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  otpData.used = true;
  await otpData.save();

  await User.findByIdAndUpdate(userId, {
    isVerify: true,
    verifiedAt: Date.now()
  });

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    userId
  });
};

module.exports.resendOtp = async (req, res) => {

  const { userId } = req.body;

  const userData = await User.findById(userId);

  // check user is exist or not
  if (!userData) {
    return res.status(404).json({ success: false, message: "user not found" });
  }
  // check if user is already verify
  if (userData.isVerify) {
    return res.status(400).json({ success: false, message: "User is already verified" });
  }

  const oldOtps = await Otp.find({
    userId,
    type: "signup",
    used: false
  });

  for (const otpDoc of oldOtps) {
    otpDoc.used = true;
    await otpDoc.save();
  }

  // create new otp
  const otp = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  await Otp.create({
    userId,
    otp,
    type: "signup",
    expiresAt
  });

  await sendEmail(userData.email, "Verify your account", `Your OTP is ${otp}`);

  res.status(200).json({ success: true, message: "OTP resend succussfully" });

};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  const userData = await User.findOne({ email });

  if (!userData) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  if (!userData.isVerify) {
    return res.status(400).json({
      success: false,
      message: "you are not verify by otp."
    });
  }

  const valid = await bcrypt.compare(password, userData.passwordHash);
  if (!valid) {
    return res.status(400).json({
      success: false,
      message: "Invalid password"
    });
  }

  const token = jwt.sign(
    { id: userData._id, email: userData.email, fullName: userData.fullName },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000
  });


  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: { id: userData._id, email: userData.email, fullName: userData.fullName }
  });

};

module.exports.sendForgotPasswordOtp = async (req, res) => {

  const { email } = req.body;

  const userData = await User.findOne({ email });

  if (!userData) {
    return res.status(404).json({
      success: false,
      message: "user not found."
    });
  }

  const userId = userData._id;

  const oldOtpData = await Otp.find({
    userId,
    type: "forget-password",
    used: false
  });

  // Mark all old OTPs as used
  for (const otpData of oldOtpData) {
    otpData.used = true;
    await otpData.save();
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Save new OTP
  await Otp.create({
    userId,
    otp,
    type: "forget-password",
    expiresAt
  });

  await sendEmail(email, "Verify Forget Password OTP", `Your OTP is ${otp}`);

  res.status(200).json({
    success: true,
    message: "OTP sent successfully.",
    userId: userId
  });

};

module.exports.verifyForgetPasswordOtp = async (req, res) => {

  const { userId, otp, newPassword } = req.body;

  const userData = await User.findById(userId);

  if (!userData) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  const otpData = await Otp.findOne({
    userId,
    type: "forget-password",
    used: false
  });

  if (!otpData) {
    return res.status(400).json({
      success: false,
      message: "No active OTP found."
    });
  }

  // Check expiration
  if (otpData.expiresAt < Date.now()) {
    otpData.used = true;
    await otpData.save();

    return res.status(400).json({
      success: false,
      message: "OTP expired. Please request a new one."
    });
  }

  // Check OTP match
  if (otpData.otp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP."
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  userData.passwordHash = hashedPassword;
  await userData.save();

  otpData.used = true;
  await otpData.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully."
  });

};

module.exports.resendForgetPasswordOtp = async (req, res) => {

  const { userId } = req.body;

  const userData = await User.findById(userId);

  if (!userData) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  const oldOtps = await Otp.find({
    userId,
    type: "forget-password",
    used: false
  });

  for (const otpData of oldOtps) {
    otpData.used = true;
    await otpData.save();
  }

  // Generate new OTP
  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Save new OTP
  await Otp.create({
    userId,
    otp,
    type: "forget-password",
    expiresAt
  });

  // FIX: Use userData.email instead of undefined 'email' variable
  await sendEmail(userData.email, "Verify Forget Password OTP", `Your OTP is ${otp}`);

  return res.status(200).json({
    success: true,
    message: "OTP resent successfully.",
    userId
  });

}