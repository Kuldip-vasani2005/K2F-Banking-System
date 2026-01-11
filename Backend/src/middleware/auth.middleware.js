// Backend/src/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");

module.exports.authUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied! User not logged in."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
}

module.exports.authAdmin = (req, res, next) => {
  // Try to get token from cookies first
  const adminToken = req.cookies.adminToken;
  
  // If not in cookies, try Authorization header
  let token = adminToken;
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Admin not logged in."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const ALLOWED_ROLES = ["accountVerifier", "cashier", "cardManager", "superAdmin"];

    if (!ALLOWED_ROLES.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Invalid admin role."
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
}

module.exports.authAtm = async (req, res, next) => {
    const token = req.headers["x-atm-token"];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "ATM token missing"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.cardId = decoded.cardId;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired ATM token"
        });
    }
};