import React, { useState, useEffect, useContext } from 'react';
import { formatCurrency } from '../../utils/currencyFormatters'

import { fetchDashboardSummary } from '../../services/dashboard/dashboardService';
import { AuthContext } from '../../context/AuthContext';

import './dashboard.css';

/* ═══════════════════════════════════════════════════
   Dashboard Page Component
═══════════════════════════════════════════════════ */

const DashboardPage = () => {
  const { profile } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
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

  /* ─── Expiry chip counts ─── */
  const expiredCount = alerts.expiryItems.filter((i) => i.status === 'expired').length;
  const expiringCount = alerts.expiryItems.filter((i) => i.status === 'expiring').length;

  /* ─── Weekly chart helpers ─── */
  const rawMaxSales = weeklySalesData.length > 0 ? Math.max(...weeklySalesData.map((d) => d.value)) : 0;
  // Calculate dynamic Y-axis labels (5 steps from 0 to max)
  const step = Math.ceil(rawMaxSales / 4 / 100) * 100 || 100; // Round to nearest 100, minimum 100
  const adjustedMax = step * 4;
  const yAxisLabels = [adjustedMax, step * 3, step * 2, step, 0];

  /* ─── Low stock bar width helper ─── */
  const stockPercent = (qty, min) => {
    if (min === 0) return 0;
    return Math.min((qty / min) * 100, 100);
  };

  /* ─── Current Week Date Range Helper ─── */
  const getWeekRangeString = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="dashboard-page">
      {/* ───── Page Title ───── */}
      <div className="layout-page-heading">
        <h2>Dashboard</h2>
        <p>Welcome back, {profile?.first_name || 'Admin'}</p>
      </div>

      {/* ═══════════════════════════════════════════════
          Top Grid — Summary Cards + Near Expiry + Low Stock
      ═══════════════════════════════════════════════ */}
      <div className="dashboard-top-grid">
        {/* Summary Cards  */}
        <div className="dashboard-summary-cards">
          <div className="dashboard-summary-card dashboard-summary-card--green">
            <div className="dashboard-summary-card-icon">
              <i className="bi bi-bag-check-fill"></i>
            </div>
            <p className="dashboard-summary-card-value">
              {isLoadingTop ? '...' : formatCurrency(metrics.totalSales)}
            </p>
            <p className="dashboard-summary-card-label">Today's Sales ({isLoadingTop ? '0' : metrics.orderCount} orders)</p>
          </div>

          <div className="dashboard-summary-card dashboard-summary-card--yellow">
            <div className="dashboard-summary-card-icon">
              <i className="bi bi-cash-stack"></i>
            </div>
            <p className="dashboard-summary-card-value">
              {isLoadingTop ? '...' : formatCurrency(metrics.totalExpenses)}
            </p>
            <p className="dashboard-summary-card-label">Today's Expenses</p>
          </div>

          <div className="dashboard-summary-card dashboard-summary-card--red">
            <div className="dashboard-summary-card-icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <p className="dashboard-summary-card-value">
              {isLoadingTop ? '...' : metrics.lowStockCount}
            </p>
            <p className="dashboard-summary-card-label">Low Stock Alerts</p>
          </div>
        </div>

        {/* Near Expiry / Expired Batches */}
        <div className="dashboard-panel dashboard-expiry-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">
              <i className="bi bi-exclamation-diamond-fill"></i>
              Near Expiry / Expired Batches
            </h3>
          </div>

          <div className="dashboard-expiry-chips">
            <span className="dashboard-chip dashboard-chip--expired">
              {expiredCount} Expired
            </span>
            <span className="dashboard-chip dashboard-chip--expiring">
              {expiringCount} Expiring
            </span>
          </div>

          <div className="dashboard-expiry-list">
            {isLoadingTop ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>Loading...</p>
            ) : alerts.expiryItems.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>No expired or expiring batches.</p>
            ) : (
              alerts.expiryItems.map((item, idx) => {
                let timeLeftText = 'Expired';
                if (item.status === 'expiring') {
                  const daysLeft = Math.ceil((new Date(item.exp) - new Date()) / (1000 * 60 * 60 * 24));
                  timeLeftText = `${daysLeft}d left`;
                }

                return (
                  <div key={idx} className="dashboard-expiry-item">
                    <div className="dashboard-expiry-item-info">
                      <p className="dashboard-expiry-item-name">{item.name}</p>
                      <p className="dashboard-expiry-item-meta">
                        Batch: {item.batch} | {item.size} | Exp: {item.exp}
                      </p>
                    </div>
                    <span
                      className={`dashboard-chip dashboard-chip--${item.status}`}
                    >
                      {timeLeftText}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="dashboard-panel dashboard-lowstock-panel">
          <div className="dashboard-panel-header dashboard-panel-header--danger">
            <h3 className="dashboard-panel-title">
              <i className="bi bi-exclamation-triangle-fill"></i>
              Low Stock Alert
            </h3>
          </div>

          <div className="dashboard-lowstock-list">
            {isLoadingTop ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>Loading...</p>
            ) : alerts.lowStockItems.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>Stock levels are good.</p>
            ) : (
              alerts.lowStockItems.map((item, idx) => (
                <div key={idx} className="dashboard-lowstock-item">
                  <div className="dashboard-lowstock-item-info">
                    <p className="dashboard-lowstock-item-name">{item.name}</p>
                    <p className="dashboard-lowstock-item-min">Min. {item.min}</p>
                  </div>
                  <div className="dashboard-lowstock-item-right">
                    <span
                      className={`dashboard-lowstock-badge dashboard-lowstock-badge--${item.level}`}
                    >
                      {item.qty} {item.unit}
                    </span>
                  </div>
                  <div className="dashboard-lowstock-bar-track">
                    <div
                      className={`dashboard-lowstock-bar-fill dashboard-lowstock-bar-fill--${item.level}`}
                      style={{ width: `${stockPercent(item.qty, item.min)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
         Weekly Sales + Top Selling
      ═══════════════════════════════════════════════ */}
      <div className="dashboard-middle-row">
        {/* Weekly Sales Bar Chart */}
        <div className="dashboard-panel dashboard-chart-panel">
          <div className="dashboard-panel-header">
            <h3 className="dashboard-panel-title">
              <i className="bi bi-bar-chart-line-fill"></i>
              Weekly Sales ({getWeekRangeString()})
            </h3>
          </div>

          <div className="dashboard-chart-area">
            {/* Y-axis labels */}
            <div className="dashboard-chart-yaxis">
              {yAxisLabels.map((val) => (
                <span key={val} className="dashboard-chart-ylabel">{val}</span>
              ))}
            </div>

            {/* Bars */}
            <div className="dashboard-chart-bars">
              {isLoadingBottom ? (
                <p style={{ textAlign: 'center', width: '100%', color: '#666' }}>Loading chart...</p>
              ) : weeklySalesData.length === 0 ? (
                <p style={{ textAlign: 'center', width: '100%', color: '#666' }}>No sales data for the past week.</p>
              ) : (
                weeklySalesData.map((d) => (
                  <div key={d.day} className="dashboard-chart-bar-group">
                    <div className="dashboard-chart-bar-wrapper">
                      <div
                        className="dashboard-chart-bar"
                        style={{ height: `${adjustedMax > 0 ? (d.value / adjustedMax) * 100 : 0}%` }}
                      >
                        <span className="dashboard-chart-bar-tooltip">
                          ₱{d.value}
                        </span>
                      </div>
                    </div>
                    <span className="dashboard-chart-xlabel">{d.day}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Selling */}
        <div className="dashboard-panel dashboard-topselling-panel">
          <div className="dashboard-panel-header dashboard-panel-header--accent">
            <h3 className="dashboard-panel-title">
              <i className="bi bi-heart-fill"></i>
              Top Selling (Last 7 Days)
            </h3>
          </div>

          <div className="dashboard-topselling-list">
            {isLoadingBottom ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>Loading top items...</p>
            ) : topSellingItems.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>No sales recorded yet.</p>
            ) : (
              topSellingItems.map((item) => (
                <div key={item.rank} className="dashboard-topselling-item">
                  <span
                    className={`dashboard-topselling-rank dashboard-topselling-rank--${item.rank}`}
                  >
                    #{item.rank}
                  </span>
                  <div className="dashboard-topselling-item-info">
                    <p className="dashboard-topselling-category">{item.category}</p>
                    <p className="dashboard-topselling-name">{item.name}</p>
                  </div>
                  <div className="dashboard-topselling-item-stats">
                    <p className="dashboard-topselling-price">
                      ₱{item.price.toFixed(2)}
                    </p>
                    <p className="dashboard-topselling-sold">{item.sold} Sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          Bottom — Recent Orders Table
      ═══════════════════════════════════════════════ */}
      <div className="dashboard-panel dashboard-orders-panel">
        <div className="dashboard-panel-header">
          <h3 className="dashboard-panel-title">
            <i className="bi bi-clock-history"></i>
            Recent Orders
          </h3>
        </div>

        <div className="dashboard-orders-table-wrapper">
          <table className="dashboard-orders-table">
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Cashier</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingBottom ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>Loading recent orders...</td></tr>
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>No recent orders found.</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.orderNo}>
                    <td className="dashboard-orders-orderno">{order.orderNo}</td>
                    <td>{order.cashier}</td>
                    <td className="dashboard-orders-total">
                      {formatCurrency(order.total)}
                    </td>
                    <td>{order.payment}</td>
                    <td>
                      <span className="dashboard-chip dashboard-chip--completed">
                        {order.status}
                      </span>
                    </td>
                    <td className="dashboard-orders-date">{order.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
