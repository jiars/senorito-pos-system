import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import MainLayout from "../components/layout/MainLayout";

import DashboardPage from "../pages/dashboard/DashboardPage";

import InventoryPage from "../pages/inventory/InventoryPage";
import InventoryArchivePage from "../pages/inventory/archive/InventoryArchivePage";
import InventoryAuditLogPage from "../pages/inventory/audit/InventoryAuditLogPage";
import InventoryValuationReport from "../pages/reports/inventory valuation/InventoryValuationReport";

import MenuManagementPage from "../pages/menu/MenuManagementPage";
import ManageAddonsPage from "../pages/menu/addons/ManageAddonsPage";

import ExpenseTrackingPage from "../pages/expenses/ExpenseTrackingPage";
import OrdersPage from "../pages/orders/OrdersPage";
import POSPage from "../pages/pos/POSPage";
import SalesReportPage from "../pages/reports/sales/SalesReportPage";
import UserProfilePage from "../pages/profile/UserProfilePage";
import EmployeeManagementPage from "../pages/employees/EmployeeManagementPage";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public Auth Routes (Protected from logged-in users!) ── */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />

      {/* ── Default Root Redirect ── */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ── Protected Dashboard ── */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/archive" element={<InventoryArchivePage />} />
        <Route path="/inventory/audit" element={<InventoryAuditLogPage />} />
        <Route
          path="/inventory/valuation"
          element={<InventoryValuationReport />}
        />

        <Route path="/menu" element={<MenuManagementPage />} />
        <Route path="/menu/addons" element={<ManageAddonsPage />} />

        <Route path="/pos" element={<POSPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/employees" element={<EmployeeManagementPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/expenses" element={<ExpenseTrackingPage />} />
        <Route path="/reports/sales" element={<SalesReportPage />} />
      </Route>

      {/* Default redirect for unmatched paths */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
