import { useState, useEffect } from "react";

import { fetchDashboardSummary } from "../../services/dashboard/dashboardService";

import PageLayout from "../../components/layout/PageLayout";
import StatusFeedback from "@/components/feedback/status/StatusFeedback";
import { Button } from "@/components/ui/button";
import {
  getDashboardErrorCode,
  getDashboardStatusFeedback,
} from "@/utils/dashboard/feedback/dashboardFeedback";

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
  const [errorCode, setErrorCode] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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

  const [weeklySalesData, setWeeklySalesData] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorCode(null);

        const data = await fetchDashboardSummary();
        if (!isActive) return;

        setMetrics(data.metrics);
        setAlerts(data.alerts);
        setWeeklySalesData(data.weeklySales);
        setTopSellingItems(data.topItems);
        setRecentOrders(data.recentOrders);
      } catch (error) {
        if (isActive) setErrorCode(getDashboardErrorCode(error));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadDashboard();

    // Ignore a completed request after leaving the page or starting another load.
    return () => {
      isActive = false;
    };
  }, [retryCount]);

  const handleRetry = () => {
    if (isLoading) return;
    setIsLoading(true);
    setRetryCount((count) => count + 1);
  };

  let feedback = null;
  if (!isLoading && errorCode) {
    feedback = getDashboardStatusFeedback(errorCode);
  }

  return (
    <PageLayout
      title="Overview"
      subtitle="Here is the summary of overall data"
      className="dashboard-page-shell flex flex-col gap-4"
    >
      {feedback && (
        <div className="flex min-w-0 flex-col gap-[var(--app-gap-related)]">
          <StatusFeedback feedback={feedback} />
          {feedback.canRetry && (
            <Button
              type="button"
              onClick={handleRetry}
              disabled={isLoading}
              className="min-h-[var(--app-touch-target-min)] self-start px-[var(--app-space-4)]"
            >
              <i className="bi bi-arrow-clockwise" aria-hidden="true" />
              Retry
            </Button>
          )}
        </div>
      )}

      {!feedback && (
        <div className="dashboard-overview-layout dashboard-page" aria-busy={isLoading}>
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
      )}
    </PageLayout>
  );
};

export default DashboardPage;
