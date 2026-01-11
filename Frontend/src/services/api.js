// Frontend/src/services/api.js - UPDATED with deleteApplication method
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
API.interceptors.request.use(
  (config) => {
    console.log(
      `API Request: ${config.method.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );

    // Check if it's an admin route
    if (config.url.includes("/admin/")) {
      const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

      if (adminData?.token) {
        config.headers.Authorization = `Bearer ${adminData.token}`;
      }

      if (adminData?.role) {
        config.headers["X-Admin-Role"] = adminData.role;
      }
    }

    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor with better logging
API.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const { response } = error;

    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: response?.status,
      message: response?.data?.message || error.message,
      data: response?.data,
    });

    if (response) {
      switch (response.status) {
        case 429:
          error.message = "Too many requests. Please wait.";
          break;
        case 401:
          if (error.config.url.includes("/admin/")) {
            localStorage.removeItem("adminData");
            if (window.location.pathname !== "/admin/login") {
              window.location.href = "/admin/login";
            }
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
          break;
        case 403:
          error.message = "Access denied.";
          if (error.config.url.includes("/admin/")) {
            localStorage.removeItem("adminData");
            window.location.href = "/admin/login";
          }
          break;
        case 404:
          error.message = `Endpoint not found: ${error.config.url}`;
          break;
        case 500:
          error.message = "Server error. Please try again later.";
          break;
      }
    } else {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);

// ========== AUTH APIs ==========
export const authAPI = {
  signup: (data) => API.post("/auth/signup", data),
  verifyOtp: (data) => API.post("/auth/signup/verify-otp", data),
  resendOtp: (data) => API.post("/auth/signup/resend-otp", data),
  login: (data) => API.post("/auth/login", data),
  forgotPassword: (data) => API.post("/auth/forget-password", data),
  verifyForgotPasswordOtp: (data) =>
    API.post("/auth/forget-password/verify-otp", data),
  resendForgotPasswordOtp: (data) =>
    API.post("/auth/forget-password/resend-otp", data),
};

// ========== USER APIs ==========
export const userAPI = {
  getProfile: () => API.get("/user/me"),
  updatePassword: (data) => API.post("/user/update-password", data),
  logout: () => API.post("/user/logout"),
};

// ========== APPLICATION APIs ==========
export const applicationAPI = {
  // Start application with account type
  startApplication: (data) => {
    return API.post("/user/application/start", data);
  },

  // Update personal info - using PUT
  updatePersonalInfo: (applicationId, data) => {
    return API.put(`/user/application/${applicationId}/personal-info`, data);
  },

  // Update identity info - using PUT
  updateIdentityInfo: (applicationId, data) => {
    return API.put(`/user/application/${applicationId}/identity-info`, data);
  },

  // Verify OTP
  verifyApplicationOtp: (applicationId, otp) => {
    return API.post(`/user/application/${applicationId}/verify-otp`, { otp });
  },

  // Resend OTP
  resendApplicationOtp: (applicationId) => {
    return API.post(`/user/application/${applicationId}/resend-otp`);
  },

  // Create bank account after verification
  createBankAccount: (applicationId) => {
    return API.post(`/user/application/${applicationId}/create-account`);
  },

  // Get all applications for user
  getUserApplications: () => {
    return API.get("/user/application");
  },

  // DELETE APPLICATION METHOD - ADDED THIS
  deleteApplication: (applicationId) => {
    return API.delete(`/user/application/${applicationId}`);
  },

  // Get application status
  getApplicationStatus: (applicationId) => {
    return API.get(`/user/application/${applicationId}/status`);
  },

  // Get single application details
  getApplicationById: (applicationId) => {
    return API.get(`/user/application/${applicationId}`);
  },
};

// ========== BANK ACCOUNT APIs ==========
export const bankAccountAPI = {
  getMyAccounts: () => API.get("/user/account/my-accounts"),
  getAccountDetails: (accountId) => API.get(`/user/account/${accountId}`),
  transferMoney: (data) => API.post("/user/account/transfer", data),

  getTransactions: (accountId) =>
    API.get(`/user/account/${accountId}/transactions`),

  getRecentTransactions: () => API.get("/user/account/transactions/recent"),

  // ✅ ADD THIS
  getAccountStatement: (accountId, startDate, endDate) =>
    API.get(`/user/account/${accountId}/statement`, {
      params: { startDate, endDate },
    }),
};

// ========== CARD APIs ==========
export const cardAPI = {
  requestCard: (data) => API.post("/user/card/request", data),
  getCardStatus: () => API.get("/user/card/status"),
  getMyCards: () => API.get("/user/card/my-cards"),
  sendUnblockOtp: (data) => API.post("/user/card/unblock-card", data),
  verifyUnblockOtp: (data) =>
    API.post("/user/card/unblock-card/verify-otp", data),
};

// ========== ATM APIs ==========
export const atmAPI = {
  setPin: (data) => API.post("/atm/set-pin", data),
  verifyOtp: (data) => API.post("/atm/set-pin/verify-otp", data),
  login: (data) => API.post("/atm/login", data),
  withdraw: (data) => API.post("/atm/withdraw", data),
  checkBalance: (data) => API.post("/atm/check-balance", data),
};

// ========== ADMIN APIs ==========
export const adminAPI = {
  // Auth
  login: (data) => API.post("/admin/auth/login", data),
  logout: () => API.post("/admin/auth/logout"),
  test: () => API.get("/admin/auth/test"),

  // Account Verifier
  getPendingApplications: () =>
    API.get("/admin/account-verifier/applications/pending"),
  getApplicationDetails: (applicationId) =>
    API.get(`/admin/account-verifier/applications/${applicationId}`),
  verifyIdentity: (applicationId) =>
    API.post(
      `/admin/account-verifier/applications/${applicationId}/verify-identity`
    ),
  approveApplication: (applicationId) =>
    API.post(`/admin/account-verifier/applications/${applicationId}/approve`),
  rejectApplication: (applicationId, reason) =>
    API.post(`/admin/account-verifier/applications/${applicationId}/reject`, {
      reason,
    }),

  // Card Manager
  getPendingCardRequests: () => API.get("/admin/card-manager/pending"),
  approveCardRequest: (cardRequestId) =>
    API.post(`/admin/card-manager/${cardRequestId}/approve`),
  rejectCardRequest: (cardRequestId) =>
    API.post(`/admin/card-manager/${cardRequestId}/reject`),

  // Cashier
  depositMoney: (data) => API.post("/admin/cashier/deposit", data),
  withdrawMoney: (data) => API.post("/admin/cashier/withdraw", data),

  // Super Admin
  getAllAdmins: () => API.get("/admin/super-admin/list"),
  createAdmin: (data) => API.post("/admin/super-admin/create", data),
  toggleAdminStatus: (adminId) =>
    API.put(`/admin/super-admin/toggle/${adminId}`),
};

// Default export
export default API;
