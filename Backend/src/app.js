// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// ====================
// CORS Configuration (MUST BE FIRST)
// ====================
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "x-admin-role" // ✅ REQUIRED
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

app.use(cors(corsOptions));

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options("*", cors(corsOptions));

// ====================
// Database Connection
// ====================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

// ====================
// Middleware
// ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Add headers for CORS (additional safety)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====================
// Routes
// ====================
// Import routes
const authRoutes = require("./routes/auth.routes.js");
const applicationRoutes = require("./routes/application.routes.js");
const userRoutes = require("./routes/user.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const accountVerifierRoutes = require("./routes/accountVerifier.routes.js");
const bankAccountRoutes = require("./routes/bankAccount.routes.js");
const cashierRoutes = require("./routes/cashier.routes.js");
const cardRoutes = require("./routes/card.routes.js");
const cardManagerRoutes = require("./routes/cardManager.routes");
const superAdminRoutes = require("./routes/superAdmin.routes");
const atmRoutes = require("./routes/atm.routes");
const profileRoutes = require("./routes/profile.routes");

// Apply routes
app.get("/", (req, res) => {
  res.send("Banking Project Backend Running");
});

app.use("/auth", authRoutes);
app.use("/user/application", applicationRoutes);
app.use("/user/account", bankAccountRoutes);
app.use("/user/card", cardRoutes);
app.use("/user", userRoutes);
app.use("/admin/account-verifier", accountVerifierRoutes);
app.use("/admin/cashier", cashierRoutes);
app.use("/admin/card-manager", cardManagerRoutes);
app.use("/admin/super-admin", superAdminRoutes);
app.use("/admin", adminRoutes);
app.use("/atm", atmRoutes);
app.use("/user/profile", profileRoutes);

// ====================
// Error Handlers
// ====================
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  // Ensure CORS headers even on errors
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));