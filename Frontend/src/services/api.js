// Frontend/src/services/api.js
import axios from "axios";

/**
 * Base API instance
 * Uses environment variable for production & local both
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ PRODUCTION SAFE
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ============================
   REQUEST INTERCEPTOR
============================ */
API.interceptors.request.use(
  (config) => {
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );

    // Admin auth handling
    if (config.url?.includes("/admin/")) {
      const adminData = JSON.parse(sessionStorage.getItem("adminData") || "{}");

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

/* ============================
   RESPONSE INTERCEPTOR
============================ */
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
          if (error.config?.url?.includes("/admin/")) {
            sessionStorage.removeItem("adminData");
            if (window.location.pathname !== "/admin/login") {
              window.location.href = "/admin/login";
            }
          } else {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
          break;

        case 403:
          error.message = "Access denied.";
          if (error.config?.url?.includes("/admin/")) {
            sessionStorage.removeItem("adminData");
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

/* ============================
   AUTH APIs
============================ */
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

/* ============================
   USER APIs
============================ */
export const userAPI = {
  getProfile: () => API.get("/user/me"),
  updatePassword: (data) => API.post("/user/update-password", data),
  logout: () => API.post("/user/logout"),
};

/* ============================
   APPLICATION APIs
============================ */
export const applicationAPI = {
  startApplication: (data) => API.post("/user/application/start", data),

  updatePersonalInfo: (id, data) =>
    API.put(`/user/application/${id}/personal-info`, data),

  updateIdentityInfo: (id, data) =>
    API.put(`/user/application/${id}/identity-info`, data),

  verifyApplicationOtp: (id, otp) =>
    API.post(`/user/application/${id}/verify-otp`, { otp }),

  resendApplicationOtp: (id) =>
    API.post(`/user/application/${id}/resend-otp`),

  createBankAccount: (id) =>
    API.post(`/user/application/${id}/create-account`),

  getUserApplications: () => API.get("/user/application"),

  getApplicationStatus: (id) =>
    API.get(`/user/application/${id}/status`),

  getApplicationById: (id) =>
    API.get(`/user/application/${id}`),

  deleteApplication: (id) =>
    API.delete(`/user/application/${id}`),
};

/* ============================
   BANK ACCOUNT APIs
============================ */
export const bankAccountAPI = {
  getMyAccounts: () => API.get("/user/account/my-accounts"),
  getAccountDetails: (id) => API.get(`/user/account/${id}`),
  transferMoney: (data) => API.post("/user/account/transfer", data),

  getTransactions: (id) =>
    API.get(`/user/account/${id}/transactions`),

  getRecentTransactions: () =>
    API.get("/user/account/transactions/recent"),

  getAccountStatement: (id, startDate, endDate) =>
    API.get(`/user/account/${id}/statement`, {
      params: { startDate, endDate },
    }),
};

/* ============================
   CARD APIs
============================ */
export const cardAPI = {
  requestCard: (data) => API.post("/user/card/request", data),
  getCardStatus: () => API.get("/user/card/status"),
  getMyCards: () => API.get("/user/card/my-cards"),
  sendUnblockOtp: (data) => API.post("/user/card/unblock-card", data),
  verifyUnblockOtp: (data) =>
    API.post("/user/card/unblock-card/verify-otp", data),
};

/* ============================
   ATM APIs
============================ */
export const atmAPI = {
  setPin: (data) => API.post("/atm/set-pin", data),
  verifyOtp: (data) => API.post("/atm/set-pin/verify-otp", data),
  login: (data) => API.post("/atm/login", data),
  withdraw: (data) => API.post("/atm/withdraw", data),
  checkBalance: (data) => API.post("/atm/check-balance", data),
};

/* ============================
   ADMIN APIs
============================ */
export const adminAPI = {
  login: (data) => API.post("/admin/auth/login", data),
  logout: () => API.post("/admin/auth/logout"),
  test: () => API.get("/admin/auth/test"),

  // Account Verifier
  getPendingApplications: () =>
    API.get("/admin/account-verifier/applications/pending"),

  getApplicationDetails: (id) =>
    API.get(`/admin/account-verifier/applications/${id}`),

  verifyIdentity: (id) =>
    API.post(`/admin/account-verifier/applications/${id}/verify-identity`),

  approveApplication: (id) =>
    API.post(`/admin/account-verifier/applications/${id}/approve`),

  rejectApplication: (id, reason) =>
    API.post(
      `/admin/account-verifier/applications/${id}/reject`,
      { reason }
    ),

  // Card Manager
  getPendingCardRequests: () =>
    API.get("/admin/card-manager/pending"),

  approveCardRequest: (id) =>
    API.post(`/admin/card-manager/${id}/approve`),

  rejectCardRequest: (id) =>
    API.post(`/admin/card-manager/${id}/reject`),

  // Cashier
  depositMoney: (data) => API.post("/admin/cashier/deposit", data),
  withdrawMoney: (data) => API.post("/admin/cashier/withdraw", data),

  // Super Admin
  getAllAdmins: () => API.get("/admin/super-admin/list"),
  createAdmin: (data) => API.post("/admin/super-admin/create", data),
  toggleAdminStatus: (id) =>
    API.put(`/admin/super-admin/toggle/${id}`),
};

/* ============================
   DEFAULT EXPORT
============================ */
export default API;
