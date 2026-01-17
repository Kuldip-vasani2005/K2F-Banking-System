// ====================
// Load environment variables
// ====================
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// ====================
// ✅ CORS CONFIGURATION (PRODUCTION READY)
// ====================
const allowedOrigins = [
  "http://localhost:5173",
  "https://k2-f-banking-system.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-Admin-Role",
    ],
  })
);

// ✅ Handle preflight requests
app.options("*", cors());

// ====================
// Middleware
// ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ====================
// Static files
// ====================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====================
// Database Connection
// ====================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// ====================
// Routes
// ====================
const authRoutes = require("./routes/auth.routes");
const applicationRoutes = require("./routes/application.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const accountVerifierRoutes = require("./routes/accountVerifier.routes");
const bankAccountRoutes = require("./routes/bankAccount.routes");
const cashierRoutes = require("./routes/cashier.routes");
const cardRoutes = require("./routes/card.routes");
const cardManagerRoutes = require("./routes/cardManager.routes");
const superAdminRoutes = require("./routes/superAdmin.routes");
const atmRoutes = require("./routes/atm.routes");
const profileRoutes = require("./routes/profile.routes");

// Health check
app.get("/", (req, res) => {
  res.send("✅ Banking Project Backend Running");
});

// Apply routes
app.use("/auth", authRoutes);
app.use("/user/application", applicationRoutes);
app.use("/user/account", bankAccountRoutes);
app.use("/user/card", cardRoutes);
app.use("/user/profile", profileRoutes);
app.use("/user", userRoutes);

app.use("/admin/account-verifier", accountVerifierRoutes);
app.use("/admin/cashier", cashierRoutes);
app.use("/admin/card-manager", cardManagerRoutes);
app.use("/admin/super-admin", superAdminRoutes);
app.use("/admin", adminRoutes);

app.use("/atm", atmRoutes);

// ====================
// 404 Handler
// ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ====================
// Global Error Handler (CORS SAFE)
// ====================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ====================
// Server Start
// ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
