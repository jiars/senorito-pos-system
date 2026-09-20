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
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);

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
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <PageLayout
      title="Overview"
      subtitle="Here is the summary of overall data"
      className="dashboard-page-shell flex flex-col gap-4"
    >
      <div className="dashboard-overview-layout dashboard-page">
        <section className="dashboard-overview-primary">
          <SummaryCards metrics={metrics} isLoading={isLoading} />

          <WeeklySalesChart
            weeklySalesData={weeklySalesData}
            isLoading={isLoading}
          />
        </section>

        <section className="dashboard-overview-secondary">
          <ExpiryBatchesPanel alerts={alerts} isLoading={isLoading} />

          <LowStockPanel alerts={alerts} isLoading={isLoading} />
        </section>

        <section className="dashboard-overview-top-selling">
          <TopSellingPanel
            topSellingItems={topSellingItems}
            isLoading={isLoading}
          />
        </section>

        <section className="dashboard-overview-recent-orders">
          <RecentOrdersTable
            recentOrders={recentOrders}
            isLoading={isLoading}
          />
        </section>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
