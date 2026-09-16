import React, { useState, useEffect, useContext } from 'react';

import { fetchDashboardSummary } from '../../services/dashboard/dashboardService';
import { AuthContext } from '../../context/AuthContext';

import SummaryCards from './components/SummaryCards';
import ExpiryBatchesPanel from './components/ExpiryBatchesPanel';
import LowStockPanel from './components/LowStockPanel';
import WeeklySalesChart from './components/WeeklySalesChart';
import TopSellingPanel from './components/TopSellingPanel';
import RecentOrdersTable from './components/RecentOrdersTable';

import './dashboard.css';

/* ═══════════════════════════════════════════════════
   Dashboard Page Component
═══════════════════════════════════════════════════ */

const DashboardPage = () => {
  const { profile } = useContext(AuthContext);
  const [isLoadingTop, setIsLoadingTop] = useState(true);

  // States for Step 2
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    orderCount: 0,
    totalExpenses: 0,
    lowStockCount: 0
  });

  const [alerts, setAlerts] = useState({
    lowStockItems: [],
    expiryItems: []
  });

  // States for Step 3
  const [weeklySalesData, setWeeklySalesData] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoadingBottom, setIsLoadingBottom] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoadingTop(true);
        setIsLoadingBottom(true);

        // Exactly ONE network request!
        const data = await fetchDashboardSummary();

        setMetrics(data.metrics);
        setAlerts(data.alerts);
        setWeeklySalesData(data.weeklySales);
        setTopSellingItems(data.topItems);
        setRecentOrders(data.recentOrders);

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoadingTop(false);
        setIsLoadingBottom(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      {/* ───── Page Title ───── */}
      <div className="layout-page-heading">
        <h2>Dashboard</h2>
        <p>Welcome back, {profile?.first_name || 'Owner'}</p>
      </div>

      {/* ═══════════════════════════════════════════════
          Top Grid — Summary Cards + Near Expiry + Low Stock
      ═══════════════════════════════════════════════ */}
      <div className="dashboard-top-grid">
        <SummaryCards metrics={metrics} isLoadingTop={isLoadingTop} />
        <ExpiryBatchesPanel alerts={alerts} isLoadingTop={isLoadingTop} />
        <LowStockPanel alerts={alerts} isLoadingTop={isLoadingTop} />
      </div>

      {/* ═══════════════════════════════════════════════
         Weekly Sales + Top Selling
      ═══════════════════════════════════════════════ */}
      <div className="dashboard-middle-row">
        <WeeklySalesChart weeklySalesData={weeklySalesData} isLoadingBottom={isLoadingBottom} />
        <TopSellingPanel topSellingItems={topSellingItems} isLoadingBottom={isLoadingBottom} />
      </div>

      {/* ═══════════════════════════════════════════════
          Bottom — Recent Orders Table
      ═══════════════════════════════════════════════ */}
      <RecentOrdersTable recentOrders={recentOrders} isLoadingBottom={isLoadingBottom} />
    </div>
  );
};

export default DashboardPage;
