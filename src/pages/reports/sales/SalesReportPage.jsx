import { useState } from "react";
import "./salesReport.css";
import { useSalesReport } from "../../../hooks/useSalesReport";

import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import SummaryCards from "@/components/summary-cards/SummaryCards";
import StatusFeedback from "@/components/feedback/status/StatusFeedback";
import { getSalesReportStatusFeedback } from "@/utils/reports/feedback/salesReportFeedback";

import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import {
  calculateSalesSummary,
  calculateSalesAnalytics,
  calculateOrderTrends,
  calculateDetailedProfitability,
  calculateQuadrantCounts,
  calculateHourlyOverview,
  calculateHeatmapLimits,
  getQuadrantColorClass,
} from "@/utils/reports/salesReportCalculations";
import {
  filterSalesOrders,
  filterWastageRecords,
} from "@/utils/reports/salesReportFilters";
import { exportSalesReport } from "@/utils/reports/salesReportExportUtils";

// Import components
import SalesProfitabilityPanel from "./components/SalesProfitabilityPanel";
import SalesReportFilters from "./components/SalesReportFilters";
import SalesDistributionPanel from "./components/SalesDistributionPanel";
import SalesPerformancePanel from "./components/SalesPerformancePanel";
import SalesPrintLayout from "./components/SalesPrintLayout";

const categoryColors = ["#b06a58", "#C98A5B", "#6F9C8F", "#D8B45C", "#8C7BA8"];

const SalesReportPage = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [datePreset, setDatePreset] = useState("All Time");
  const [filterSources, setFilterSources] = useState([]);
  const [filterCategories, setFilterCategories] = useState([]);
  const { orders, wastageRecords, categories, isLoading, error } = useSalesReport();
  const isReportUnavailable = isLoading || Boolean(error);

  // Filter the cached init data without requesting Laravel again.
  const filteredOrders = filterSalesOrders(
    orders,
    fromDate,
    toDate,
    filterSources,
    filterCategories,
  );
  const filteredWastageRecords = filterWastageRecords(
    wastageRecords,
    fromDate,
    toDate,
  );

  // Build every Report section from the same Laravel response.
  const summaryData = calculateSalesSummary(
    filteredOrders,
    filteredWastageRecords,
  );
  const analytics = calculateSalesAnalytics(filteredOrders, filterCategories);
  const trends = calculateOrderTrends(filteredOrders);
  const detailedProfitability = calculateDetailedProfitability(
    filteredOrders,
    filterCategories,
  );
  const quadCounts = calculateQuadrantCounts(detailedProfitability);
  const hourlyOverview = calculateHourlyOverview(
    trends.hourlyData,
    trends.totalHourlyOrders,
  );
  const heatmapLimits = calculateHeatmapLimits(detailedProfitability);

  const topSellingItems = analytics.topSelling.slice(0, 6);
  const categorySales = analytics.categorySales;
  const sourceData = trends.sourceData;
  const safeHourlyData = hourlyOverview.safeHourlyData;
  const maxOrders = hourlyOverview.maxOrders;
  const peakHour = hourlyOverview.peakHour;
  const totalOrders = hourlyOverview.totalOrders;
  const yAxisLabels = hourlyOverview.yAxisLabels;
  const maxQty = heatmapLimits.maxQty;
  const maxRev = heatmapLimits.maxRev;

  const salesSummaryCards = [
    {
      id: "total-orders",
      title: "Total Orders",
      value: summaryData.totalOrders,
      description: "Total orders made in this period",
    },
    {
      id: "gross-revenue",
      title: "Gross Revenue",
      value: formatCurrency(summaryData.grossSales),
      description: "Sales before deductions",
    },
    {
      id: "net-revenue",
      title: "Net Revenue",
      value: formatCurrency(summaryData.netSales),
      description: "Completed sales after deductions",
    },
    {
      id: "average-order-value",
      title: "Average Order Value",
      value: formatCurrency(summaryData.avgOrderValue),
      description: "Average value per completed order",
    },
  ];

  const printSummaryCards = salesSummaryCards.map((card, index) => {
    const printColors = ["brown", "green", "gray", "yellow"];

    return {
      ...card,
      label: card.title,
      color: printColors[index],
    };
  });

  const handleApplySalesFilters = (nextFilters) => {
    setDatePreset(nextFilters.datePreset);
    setFromDate(nextFilters.fromDate);
    setToDate(nextFilters.toDate);

    setFilterCategories(nextFilters.categories);
    setFilterSources(nextFilters.orderSources);
  };

  const handleClearSalesFilters = () => {
    setDatePreset("All Time");
    setFromDate("");
    setToDate("");
    setFilterCategories([]);
    setFilterSources([]);
  };

  const handleExport = () => {
    if (isReportUnavailable) return;
    exportSalesReport({
      summaryData,
      topSellingItems,
      sourceData,
      categorySales,
      detailedProfitability,
      hourlyData: safeHourlyData,
    });
  };

  const pageActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleExport}
        disabled={isReportUnavailable}
        className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] hover:bg-[var(--app-color-control-hover)] transition-shadow hover:shadow-brand active:shadow-brand"
      >
        <i aria-hidden="true" className="bi bi-box-arrow-up-right" />
        Export
      </Button>

      <SalesReportFilters
        datePreset={datePreset}
        fromDate={fromDate}
        toDate={toDate}
        filterCategories={filterCategories}
        filterSources={filterSources}
        categories={categories}
        onApplyFilters={handleApplySalesFilters}
        onClearFilters={handleClearSalesFilters}
      />

      <Button
        type="button"
        onClick={() => window.print()}
        disabled={isReportUnavailable}
        className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-white hover:bg-[var(--app-color-brand-hover)] transition-shadow hover:shadow-brand active:shadow-brand"
      >
        <i aria-hidden="true" className="bi bi-printer" />
        Print
      </Button>
    </>
  );

  // Failed reads must not look like a successful report with zero sales.
  if (error) {
    return (
      <PageLayout
        title="Sales"
        subtitle="View and analyze your sales performance and profitability metrics."
        actions={pageActions}
      >
        <StatusFeedback feedback={getSalesReportStatusFeedback("SALES_REPORT_LOAD_FAILED")} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Sales"
      subtitle="View and analyze your sales performance and profitability metrics."
      actions={pageActions}
      className="sales-page-shell flex flex-col gap-[var(--app-gap-section)]"
    >
      <div className="sales-page-layout sales-page">
        <section className="sales-page-summary">
          <SummaryCards
            cards={salesSummaryCards}
            isLoading={isLoading}
            gridClassName="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2 lg:grid-cols-4 px-[var(--app-space-4)]"
          />
        </section>

        <section className="sales-page-profitability">
          <SalesProfitabilityPanel
            isLoading={isLoading}
            detailedProfitability={detailedProfitability}
            quadCounts={quadCounts}
            maxQty={maxQty}
            maxRev={maxRev}
            getQuadColorClass={getQuadrantColorClass}
          />
        </section>

        <section className="sales-page-performance">
          <SalesPerformancePanel
            isLoading={isLoading}
            hourlyData={safeHourlyData}
            yAxisLabels={yAxisLabels}
            maxOrders={maxOrders}
            peakHour={peakHour}
            totalOrders={totalOrders}
            topSellingItems={topSellingItems}
          />
        </section>

        <section className="sales-page-distribution">
          <SalesDistributionPanel
            isLoading={isLoading}
            sourceData={sourceData}
            categorySales={categorySales}
            categoryColors={categoryColors}
            summaryData={summaryData}
          />
        </section>
      </div>

      {!isReportUnavailable && <SalesPrintLayout
        datePreset={datePreset}
        filterSource={filterSources.join(", ") || "All Order Sources"}
        filterCategory={filterCategories.join(", ") || "All Categories"}
        fromDate={fromDate}
        toDate={toDate}
        summaryCards={printSummaryCards}
        sourceData={sourceData}
        summaryData={summaryData}
        topSellingItems={topSellingItems}
        quadCounts={quadCounts}
        detailedProfitability={detailedProfitability}
        categorySales={categorySales}
        categoryColors={categoryColors}
        hourlyData={safeHourlyData}
        maxOrders={maxOrders}
        peakHour={peakHour}
        totalOrders={totalOrders}
      />}
    </PageLayout>
  );
};

export default SalesReportPage;
