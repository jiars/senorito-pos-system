import { Routes, Route, Navigate } from "react-router-dom";

import { lazy, Suspense } from "react";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import SetupPasswordPage from "../pages/auth/SetupPasswordPage";
import AuthFlowLayout from "../pages/auth/components/AuthFlowLayout";
import MainLayout from "../components/layout/MainLayout";

import DashboardPage from "../pages/dashboard/DashboardPage";

import InventoryPage from "../pages/inventory/InventoryPage";
import InventoryArchivePage from "../pages/inventory/archive/InventoryArchivePage";
import InventoryAuditLogPage from "../pages/inventory/audit/InventoryAuditLogPage";
import InventoryValuationReport from "../pages/reports/inventory valuation/InventoryValuationReport";

import MenuManagementPage from "../pages/menu/MenuManagementPage";
import ManageAddonsPage from "../pages/menu/addons/ManageAddonsPage";
import MenuArchivePage from "../pages/menu/archive/MenuArchivePage";

import ExpenseTrackingPage from "../pages/expenses/ExpenseTrackingPage";
import ExpenseArchivePage from "../pages/expenses/archive/ExpenseArchivePage";
import OrdersPage from "../pages/orders/OrdersPage";
import POSPage from "../pages/pos/POSPage";
import SalesReportPage from "../pages/reports/sales/SalesReportPage";
import UserProfilePage from "../pages/profile/UserProfilePage";
import EmployeeManagementPage from "../pages/employees/EmployeeManagementPage";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

// Load the temporary deployment page only during local development.
const DeploymentReviewPage = import.meta.env.DEV
  ? lazy(() => import("../pages/deployment-review/DeploymentReviewPage"))
  : null;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Temporary local deployment review */}
      {import.meta.env.DEV && DeploymentReviewPage && (
        <Route
          path="/deployment-review"
          element={
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center">
                  Loading deployment review...
                </div>
              }
            >
              <DeploymentReviewPage />
            </Suspense>
          }
        />
      )}

      {/* ── Public Auth Routes (Protected from logged-in users!) ── */}
      <Route
        element={
          <PublicOnlyRoute>
            <AuthFlowLayout />
          </PublicOnlyRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route
        path="/reset-password"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/setup-password"
        element={
          <PublicOnlyRoute>
            <SetupPasswordPage />
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
        <Route path="/menu/archive" element={<MenuArchivePage />} />

        <Route path="/pos" element={<POSPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/employees" element={<EmployeeManagementPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/expenses" element={<ExpenseTrackingPage />} />
        <Route path="/expenses/archive" element={<ExpenseArchivePage />} />
        <Route path="/reports/sales" element={<SalesReportPage />} />
      </Route>

      {/* Default redirect for unmatched paths */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
