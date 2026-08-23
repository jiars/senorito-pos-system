import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ComponentPreview from '../pages/ComponentPreview';

import MainLayout from '../components/layout/MainLayout';

import DashboardPage from '../pages/dashboard/DashboardPage';

import InventoryPage from '../pages/inventory/InventoryPage';
import InventoryArchivePage from '../pages/inventory/InventoryArchivePage';
import InventoryAuditLogPage from '../pages/inventory/audit/InventoryAuditLogPage';
import InventoryValuationReport from '../pages/reports/inventory valuation/InventoryValuationReport';

import MenuManagementPage from '../pages/menu/MenuManagementPage';
import ManageAddonsPage from '../pages/menu/addons/ManageAddonsPage';

import ExpenseTrackingPage from '../pages/expenses/ExpenseTrackingPage';
import OrdersPage from '../pages/orders/OrdersPage';
import POSPage from '../pages/pos/POSPage';
import SalesReportPage from '../pages/reports/sales/SalesReportPage';
import UserProfilePage from '../pages/profile/UserProfilePage';
import EmployeeManagementPage from '../pages/employees/EmployeeManagementPage';

import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';

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
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Protected Inventory Routes ── */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InventoryPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/archive"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InventoryArchivePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/audit"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InventoryAuditLogPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory/valuation"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InventoryValuationReport />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Protected Menu Routes ── */}
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MenuManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/menu/addons"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ManageAddonsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Protected POS Page ── */}
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <POSPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Protected Profile Page ── */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <UserProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Protected Employee Management Page ── */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EmployeeManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Protected Orders Page ── */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <OrdersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Protected Expenses Page ── */}
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ExpenseTrackingPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Protected Sales Report Page ── */}
      <Route
        path="/reports/sales"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SalesReportPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Component preview (temporary dev route) */}
      <Route path="/preview" element={<ComponentPreview />} />

      {/* Default redirect for unmatched paths */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
