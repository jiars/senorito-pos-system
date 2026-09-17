import { useState, useEffect } from "react";

import { fetchDashboardSummary } from "../../services/dashboard/dashboardService";

import PageLayout from "../../components/layout/PageLayout";

import SummaryCards from "./components/SummaryCards";
import ExpiryBatchesPanel from "./components/ExpiryBatchesPanel";
import LowStockPanel from "./components/LowStockPanel";
import WeeklySalesChart from "./components/WeeklySalesChart";
import TopSellingPanel from "./components/TopSellingPanel";
import RecentOrdersTable from "./components/RecentOrdersTable";

import "./dashboard.css";

/* ═══════════════════════════════════════════════════
   Dashboard Page Component
═══════════════════════════════════════════════════ */

const DashboardPage = () => {
  const [isLoadingTop, setIsLoadingTop] = useState(true);

  // States for Step 2
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    orderCount: 0,
    totalExpenses: 0,
    lowStockCount: 0,
  });

  const [alerts, setAlerts] = useState({
    lowStockItems: [],
    expiryItems: [],
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
    <PageLayout
      title="Overview"
      subtitle="Here is the summary of overall data"
      className="flex flex-col gap-4"
    >
      <div className="dashboard-overview-layout">
        <div className="dashboard-overview-primary">
          <SummaryCards metrics={metrics} isLoadingTop={isLoadingTop} />

          <WeeklySalesChart
            weeklySalesData={weeklySalesData}
            isLoadingBottom={isLoadingBottom}
          />
        </div>

        <div className="dashboard-overview-secondary">
          <ExpiryBatchesPanel alerts={alerts} isLoadingTop={isLoadingTop} />

          <LowStockPanel alerts={alerts} isLoadingTop={isLoadingTop} />
        </div>

        <div className="dashboard-overview-top-selling">
          <TopSellingPanel
            topSellingItems={topSellingItems}
            isLoadingBottom={isLoadingBottom}
          />
        </div>

        <div className="dashboard-overview-recent-orders">
          <RecentOrdersTable
            recentOrders={recentOrders}
            isLoadingBottom={isLoadingBottom}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
