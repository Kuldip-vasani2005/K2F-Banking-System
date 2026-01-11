import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

// User Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ActiveApplications from "./pages/ActiveApplications";
import ProfileSettings from "./pages/ProfileSettings";
import Cards from "./pages/user/Cards";

// Account Pages
import AccountsDashboard from "./pages/accounts/Dashboard";
import OpenAccount from "./pages/accounts/OpenAccount";
import PersonalInfo from "./pages/accounts/PersonalInfo";
import IdentityInfo from "./pages/accounts/IdentityInfo";
import AccountDetails from "./pages/accounts/AccountDetails";
import TransactionHistory from "./pages/accounts/TransactionHistory";
import TransferMoney from "./pages/accounts/TransferMoney";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AccountVerifierDashboard from "./pages/admin/AccountVerifierDashboard";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import CardManagerDashboard from "./pages/admin/CardManagerDashboard";
import CashierDashboard from "./pages/admin/CashierDashboard";
import DownloadStatement from "./pages/accounts/DownloadStatement";

// Layout Component for Auth Pages (no navbar)
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};

// Layout Component for Admin Pages (no user navbar)
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};

// Layout Component for Protected User Pages (includes navbar)
const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes - No Navbar */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>

        {/* Admin Routes - Separate Layout without User Navbar */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            path="account-verifier"
            element={
              <ProtectedAdminRoute requiredRole="accountVerifier">
                <AccountVerifierDashboard />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="super-admin"
            element={
              <ProtectedAdminRoute requiredRole="superAdmin">
                <SuperAdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="card-manager"
            element={
              <ProtectedAdminRoute requiredRole="cardManager">
                <CardManagerDashboard />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="cashier"
            element={
              <ProtectedAdminRoute requiredRole="cashier">
                <CashierDashboard />
              </ProtectedAdminRoute>
            }
          />

          <Route index element={<Navigate to="/admin/login" replace />} />
        </Route>

        {/* Protected User Routes - Includes Navbar */}
        <Route
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/applications/active" element={<ActiveApplications />} />
          
          {/* Account Routes */}
          <Route path="/accounts" element={<AccountsDashboard />} />
          <Route path="/accounts/open" element={<OpenAccount />} />
          <Route
            path="/accounts/open/:applicationId/personal-info"
            element={<PersonalInfo />}
          />
          <Route
            path="/accounts/open/:applicationId/identity-info"
            element={<IdentityInfo />}
          />
          <Route path="/accounts/:accountId" element={<AccountDetails />} />
          <Route
            path="/accounts/:accountId/transactions"
            element={<TransactionHistory />}
          />
          <Route
            path="/accounts/:accountId/statement"
            element={<DownloadStatement />}
          />
          <Route path="/accounts/transfer" element={<TransferMoney />} />
          
          {/* Cards Route */}
          <Route path="/cards" element={<Cards />} />
        </Route>

        {/* 404 Routes */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Page not found</p>
                <div className="space-x-4">
                  <Link
                    to="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Go to Home
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;