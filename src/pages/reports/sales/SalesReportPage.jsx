import React, { useState } from 'react';
import './salesReport.css';
import { useSalesReport } from '../../../hooks/useSalesReport';
import { formatCurrency } from '../../../utils/currencyFormatters';
import {
  calculateSalesSummary,
  calculateSalesAnalytics,
  calculateOrderTrends,
  calculateDetailedProfitability,
  calculateQuadrantCounts,
  calculateHourlyOverview,
  calculateHeatmapLimits,
  getQuadrantColorClass,
} from '../../../utils/reports/salesReportCalculations';
import {
  filterSalesOrders,
  filterWastageRecords,
} from '../../../utils/reports/salesReportFilters';

// Import components
import SalesFilterBar from './components/SalesFilterBar';
import SalesSummaryCards from './components/SalesSummaryCards';
import { SalesBySourcePanel, TopSellingItemsPanel, SalesByCategoryPanels, HourlySalesPattern } from './components/SalesPerformancePanels';
import { MenuProfitabilityHeatmap, QuadrantLegend, DetailedProfitabilityTable } from './components/ProfitabilityPanels';
import SalesPrintLayout from './components/SalesPrintLayout';

const categoryColors = ['#2E7D32', '#EF6C00', '#0277BD', '#7B1FA2', '#00695C'];

const SalesReportPage = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [datePreset, setDatePreset] = useState('All Time');
  const [filterSource, setFilterSource] = useState('All Order Sources');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [profitabilitySort, setProfitabilitySort] = useState('Highest Revenue');
  const [heatmapActive, setHeatmapActive] = useState(null);

  const {
    orders,
    wastageRecords,
    categories,
  } = useSalesReport();

  // Filter the cached init data without requesting Laravel again.
  const filteredOrders = filterSalesOrders(
    orders,
    fromDate,
    toDate,
    filterSource,
    filterCategory,
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
  const analytics = calculateSalesAnalytics(filteredOrders, filterCategory);
  const trends = calculateOrderTrends(filteredOrders);
  const detailedProfitability = calculateDetailedProfitability(
    filteredOrders,
    filterCategory,
  );
  const quadCounts = calculateQuadrantCounts(detailedProfitability);
  const hourlyOverview = calculateHourlyOverview(trends.hourlyData);
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

  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    if (preset === 'All Time' || preset === 'Custom') {
      if (preset === 'All Time') {
        setFromDate('');
        setToDate('');
      }
      return;
    }

    const today = new Date();
    let start = '';
    let end = '';

    const formatDate = (d) => {
      const offset = d.getTimezoneOffset();
      d = new Date(d.getTime() - (offset*60*1000));
      return d.toISOString().split('T')[0];
    };

    if (preset === 'Today') {
      start = formatDate(today);
      end = formatDate(today);
    } else if (preset === 'This Week') {
      const first = today.getDate() - today.getDay(); 
      const firstDay = new Date(today.setDate(first));
      const lastDay = new Date(today.setDate(first + 6));
      start = formatDate(firstDay);
      end = formatDate(lastDay);
    } else if (preset === 'This Month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      start = formatDate(firstDay);
      end = formatDate(lastDay);
    } else if (preset === 'Last Month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      start = formatDate(firstDay);
      end = formatDate(lastDay);
    } else if (preset === 'This Year') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      const lastDay = new Date(today.getFullYear(), 11, 31);
      start = formatDate(firstDay);
      end = formatDate(lastDay);
    }

    setFromDate(start);
    setToDate(end);
  };

  const summaryCards = [
    { id: 'orders', icon: 'bi-cup-hot-fill', value: summaryData.totalOrders.toString(), label: 'Total Orders', color: 'brown' },
    { id: 'gross', icon: 'bi-bag-check-fill', value: formatCurrency(summaryData.grossSales), label: 'Gross Sales', color: 'green' },
    { id: 'net', icon: 'bi-cash-stack', value: formatCurrency(summaryData.netSales), label: 'Net Sales', color: 'gray' },
    { id: 'avg', icon: 'bi-receipt', value: formatCurrency(summaryData.avgOrderValue), label: 'Average Order Value', color: 'yellow' },
    { id: 'wastage', icon: 'bi-exclamation-triangle-fill', value: formatCurrency(summaryData.totalWastageCost), label: 'Total Wastage Cost', color: 'red' },
  ];

  return (
    <div className="sales-page">

      {/* ───── Page Header ───── */}
      <div className="sales-page-header">
        <div className="layout-page-heading">
          <h2>Sales Report</h2>
          <p>View and analyze your sales performance and profitability metrics.</p>
        </div>

        <div className="sales-header-actions">
          <button className="sales-btn sales-btn--primary" onClick={() => window.print()}>
            <i className="bi bi-printer"></i>
            Print
          </button>
        </div>
      </div>

      <SalesFilterBar
        datePreset={datePreset}
        handleDatePresetChange={handleDatePresetChange}
        filterSource={filterSource}
        setFilterSource={setFilterSource}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        setDatePreset={setDatePreset}
      />

      <SalesSummaryCards summaryCards={summaryCards} />

      <div className="sales-section-grid">
        <SalesBySourcePanel sourceData={sourceData} summaryData={summaryData} />
        <TopSellingItemsPanel topSellingItems={topSellingItems} />
      </div>

      <div className="sales-section-grid">
        <MenuProfitabilityHeatmap
          detailedProfitability={detailedProfitability}
          heatmapActive={heatmapActive}
          setHeatmapActive={setHeatmapActive}
          maxQty={maxQty}
          maxRev={maxRev}
          getQuadColorClass={getQuadrantColorClass}
        />
        <QuadrantLegend quadCounts={quadCounts} />
      </div>

      <DetailedProfitabilityTable
        detailedProfitability={detailedProfitability}
        profitabilitySort={profitabilitySort}
        setProfitabilitySort={setProfitabilitySort}
      />

      <SalesByCategoryPanels categorySales={categorySales} categoryColors={categoryColors} />

      <HourlySalesPattern
        hourlyData={safeHourlyData}
        yAxisLabels={yAxisLabels}
        maxOrders={maxOrders}
        peakHour={peakHour}
        totalOrders={totalOrders}
      />

      <SalesPrintLayout
        datePreset={datePreset}
        filterSource={filterSource}
        filterCategory={filterCategory}
        fromDate={fromDate}
        toDate={toDate}
        summaryCards={summaryCards}
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
      />

    </div>
  );
};

export default SalesReportPage;
