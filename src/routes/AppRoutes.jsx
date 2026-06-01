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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Main Authenticated Layout */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
      />

      <Route
        path="/inventory"
        element={
          <MainLayout>
            <InventoryPage />
          </MainLayout>
        }
      />

      <Route
        path="/inventory/archive"
        element={
          <MainLayout>
            <InventoryArchivePage />
          </MainLayout>
        }
      />

      <Route
        path="/inventory/audit"
        element={
          <MainLayout>
            <InventoryAuditLogPage />
          </MainLayout>
        }
      />

      <Route
        path="/inventory/valuation"
        element={
          <MainLayout>
            <InventoryValuationReport />
          </MainLayout>
        }
      />

      <Route
        path="/expenses"
        element={
          <MainLayout>
            <ExpenseTrackingPage />
          </MainLayout>
        }
      />

      <Route
        path="/reports/sales"
        element={
          <MainLayout>
            <SalesReportPage />
          </MainLayout>
        }
      />

      <Route
        path="/menu"
        element={
          <MainLayout>
            <MenuManagementPage />
          </MainLayout>
        }
      />

      <Route
        path="/menu/addons"
        element={
          <MainLayout>
            <ManageAddonsPage />
          </MainLayout>
        }
      />

      {/* POS Page */}
      <Route
        path="/pos"
        element={
          <MainLayout>
            <POSPage />
          </MainLayout>
        }
      />

      {/* User Profile Page */}
      <Route
        path="/profile"
        element={
          <MainLayout>
            <UserProfilePage />
          </MainLayout>
        }
      />

      {/* Orders Page */}
      <Route
        path="/orders"
        element={
          <MainLayout>
            <OrdersPage />
          </MainLayout>
        }
      />

      {/* Component preview (temporary dev route) */}
      <Route path="/preview" element={<ComponentPreview />} />

      {/* Default redirect for unmatched paths */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
