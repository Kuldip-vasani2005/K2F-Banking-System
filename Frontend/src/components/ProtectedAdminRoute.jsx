// Frontend/src/components/ProtectedAdminRoute.jsx (Tailwind)
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const ProtectedAdminRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const adminData = JSON.parse(sessionStorage.getItem("adminData") || "{}");

  // Check if admin is logged in
  if (!adminData.token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && adminData.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md text-center">
          <div className="mx-auto h-12 w-12 text-red-500 mb-4">
            <ShieldAlert className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Required role:{" "}
            {requiredRole}
          </p>
          <a
            href="/admin/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedAdminRoute;
