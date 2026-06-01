import React, { useState } from 'react';
import './dashboard.css';

/* ═══════════════════════════════════════════════════
   Placeholder Data 
═══════════════════════════════════════════════════ */

const summaryCards = [
  {
    id: 'sales',
    icon: 'bi-bag-check-fill',
    value: '₱2,970.00',
    label: "Today's Sales (21 orders)",
    color: 'green',
  },
  {
    id: 'expenses',
    icon: 'bi-cash-stack',
    value: '₱0.00',
    label: "Today's Expenses",
    color: 'yellow',
  },
  {
    id: 'lowstock',
    icon: 'bi-exclamation-triangle-fill',
    value: '2',
    label: 'Low Stock Alerts',
    color: 'red',
  },
];

const lowStockItems = [
  { name: 'Food Container', min: 20, qty: 0, unit: 'pc', level: 'critical' },
  { name: 'Cookie', min: 20, qty: 8, unit: 'pcs', level: 'warning' },
  { name: 'Paper Cup (16oz)', min: 50, qty: 12, unit: 'pcs', level: 'warning' },
  { name: 'Plastic Lid', min: 30, qty: 5, unit: 'pcs', level: 'critical' },
  { name: 'Straw', min: 100, qty: 18, unit: 'pcs', level: 'warning' },
];

const expiryItems = [
  { name: 'Whipping Cream', batch: '#8', size: '1000 ml', exp: 'Mar 01, 2026', status: 'expired' },
  { name: 'Garlic', batch: '#18', size: '1000 ml', exp: 'Mar 03, 2026', status: 'expired' },
  { name: 'Frappe Base', batch: '#9', size: '2000 ml', exp: 'Mar 04, 2026', status: 'expired' },
  { name: 'Tocino', batch: '#15', size: '3000 ml', exp: 'Mar 04, 2026', status: 'expired' },
  { name: 'Cookie', batch: '#11', size: '25 pcs', exp: 'Mar 06, 2026', status: 'expiring' },
  { name: 'Milk', batch: '#21', size: '1000 ml', exp: 'Mar 07, 2026', status: 'expiring' },
  { name: 'Butter', batch: '#5', size: '500 g', exp: 'Mar 08, 2026', status: 'expiring' },
  { name: 'Cheese Slice', batch: '#14', size: '200 g', exp: 'Mar 09, 2026', status: 'expiring' },
];

const weeklySalesData = [
  { day: '02-01', value: 780 },
  { day: '02-02', value: 650 },
  { day: '02-03', value: 920 },
  { day: '02-04', value: 840 },
  { day: '02-05', value: 760 },
  { day: '02-06', value: 880 },
  { day: '02-07', value: 700 },
];

const topSellingItems = [
  { rank: 1, category: 'Hot Coffee', name: 'Hot Americano', price: 954.00, sold: 8 },
  { rank: 2, category: 'Hot Coffee', name: 'Hot White Mocha', price: 754.00, sold: 6 },
  { rank: 3, category: 'Frappuccino', name: 'Milky Choco', price: 645.00, sold: 6 },
  { rank: 4, category: 'Frappuccino', name: 'Oreo Frappe', price: 477.00, sold: 3 },
  { rank: 5, category: 'Iced Coffee', name: 'Iced Latte', price: 390.00, sold: 4 },
  { rank: 6, category: 'Non-Coffee', name: 'Mango Shake', price: 320.00, sold: 3 },
];

const recentOrders = [
  { orderNo: 'SC-260302-01', cashier: 'Kimberly Legaspi', total: 258.00, payment: 'Cash', status: 'Completed', date: '2026-03-02 11:14:02' },
  { orderNo: 'SC-260301-20', cashier: 'Kimberly Legaspi', total: 350.00, payment: 'Platform', status: 'Completed', date: '2026-03-01 18:13:50' },
  { orderNo: 'SC-260301-19', cashier: 'Kimberly Legaspi', total: 870.00, payment: 'Platform', status: 'Completed', date: '2026-03-01 17:45:08' },
  { orderNo: 'SC-260301-18', cashier: 'Kimberly Legaspi', total: 159.00, payment: 'GCash', status: 'Completed', date: '2026-03-01 17:12:01' },
  { orderNo: 'SC-260301-17', cashier: 'Kimberly Legaspi', total: 320.00, payment: 'Card', status: 'Completed', date: '2026-03-01 16:30:30' },
  { orderNo: 'SC-260301-16', cashier: 'Kimberly Legaspi', total: 445.00, payment: 'Cash', status: 'Completed', date: '2026-03-01 15:22:10' },
  { orderNo: 'SC-260301-15', cashier: 'Kimberly Legaspi', total: 198.00, payment: 'GCash', status: 'Completed', date: '2026-03-01 14:50:33' },
  { orderNo: 'SC-260301-14', cashier: 'Kimberly Legaspi', total: 520.00, payment: 'Cash', status: 'Completed', date: '2026-03-01 13:18:45' },
  { orderNo: 'SC-260301-13', cashier: 'Kimberly Legaspi', total: 310.00, payment: 'Platform', status: 'Completed', date: '2026-03-01 12:05:20' },
  { orderNo: 'SC-260301-12', cashier: 'Kimberly Legaspi', total: 275.00, payment: 'Cash', status: 'Completed', date: '2026-03-01 11:42:15' },
  { orderNo: 'SC-260301-11', cashier: 'Kimberly Legaspi', total: 690.00, payment: 'Card', status: 'Completed', date: '2026-03-01 10:30:55' },
  { orderNo: 'SC-260301-10', cashier: 'Kimberly Legaspi', total: 185.00, payment: 'GCash', status: 'Completed', date: '2026-03-01 09:15:40' },
  { orderNo: 'SC-260301-09', cashier: 'Kimberly Legaspi', total: 410.00, payment: 'Cash', status: 'Completed', date: '2026-02-28 17:50:22' },
  { orderNo: 'SC-260301-08', cashier: 'Kimberly Legaspi', total: 330.00, payment: 'Platform', status: 'Completed', date: '2026-02-28 16:35:10' },
  { orderNo: 'SC-260301-07', cashier: 'Kimberly Legaspi', total: 560.00, payment: 'Cash', status: 'Completed', date: '2026-02-28 15:20:05' },
];

const ROWS_PER_PAGE = 5;

/* ═══════════════════════════════════════════════════
   Dashboard Page Component
═══════════════════════════════════════════════════ */

const DashboardPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  /* ─── Expiry chip counts ─── */
  const expiredCount = expiryItems.filter((i) => i.status === 'expired').length;
  const expiringCount = expiryItems.filter((i) => i.status === 'expiring').length;

  /* ─── Weekly chart helpers ─── */
  const maxSales = Math.max(...weeklySalesData.map((d) => d.value));

  /* ─── Pagination ─── */
  const totalPages = Math.ceil(recentOrders.length / ROWS_PER_PAGE);
  const paginatedOrders = recentOrders.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  /* ─── Low stock bar width helper ─── */
  const stockPercent = (qty, min) => {
    if (min === 0) return 0;
    return Math.min((qty / min) * 100, 100);
  };

  return (
    <div className="dashboard-page">
      {/* ───── Page Title ───── */}
      <div className="layout-page-heading">
        <h2>Dashboard</h2>
        <p>Welcome back, Kate</p>
      </div>

      {/* ═══════════════════════════════════════════════
          Top Grid — Summary Cards + Near Expiry + Low Stock
      ═══════════════════════════════════════════════ */}
      <div className="dashboard-top-grid">
        {/* Summary Cards  */}
        <div className="dashboard-summary-cards">
          {summaryCards.map((card) => (
            <div
              key={card.id}
              className={`dashboard-summary-card dashboard-summary-card--${card.color}`}
            >
              <div className="dashboard-summary-card-icon">
                <i className={`bi ${card.icon}`}></i>
              </div>
              <p className="dashboard-summary-card-value">{card.value}</p>
              <p className="dashboard-summary-card-label">{card.label}</p>
            </div>
          ))}
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
            {expiryItems.map((item, idx) => (
              <div key={idx} className="dashboard-expiry-item">
                <div className="dashboard-expiry-item-info">
                  <p className="dashboard-expiry-item-name">{item.name}</p>
                  <p className="dashboard-expiry-item-meta">
                    Batch {item.batch} | {item.size} | Exp: {item.exp}
                  </p>
                </div>
                <span
                  className={`dashboard-chip dashboard-chip--${item.status}`}
                >
                  {item.status === 'expired' ? 'Expired' : '1d left'}
                </span>
              </div>
            ))}
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
            {lowStockItems.map((item, idx) => (
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
            ))}
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
              Weekly Sales
            </h3>
          </div>

          <div className="dashboard-chart-area">
            {/* Y-axis labels */}
            <div className="dashboard-chart-yaxis">
              {[900, 750, 600, 450, 300, 150, 0].map((val) => (
                <span key={val} className="dashboard-chart-ylabel">{val}</span>
              ))}
            </div>

            {/* Bars */}
            <div className="dashboard-chart-bars">
              {weeklySalesData.map((d) => (
                <div key={d.day} className="dashboard-chart-bar-group">
                  <div className="dashboard-chart-bar-wrapper">
                    <div
                      className="dashboard-chart-bar"
                      style={{ height: `${(d.value / maxSales) * 100}%` }}
                    >
                      <span className="dashboard-chart-bar-tooltip">
                        ₱{d.value}
                      </span>
                    </div>
                  </div>
                  <span className="dashboard-chart-xlabel">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Today */}
        <div className="dashboard-panel dashboard-topselling-panel">
          <div className="dashboard-panel-header dashboard-panel-header--accent">
            <h3 className="dashboard-panel-title">
              <i className="bi bi-heart-fill"></i>
              Top Selling Today
            </h3>
          </div>

          <div className="dashboard-topselling-list">
            {topSellingItems.map((item) => (
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
            ))}
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
              {paginatedOrders.map((order) => (
                <tr key={order.orderNo}>
                  <td className="dashboard-orders-orderno">{order.orderNo}</td>
                  <td>{order.cashier}</td>
                  <td className="dashboard-orders-total">
                    ₱{order.total.toFixed(2)}
                  </td>
                  <td>{order.payment}</td>
                  <td>
                    <span className="dashboard-chip dashboard-chip--completed">
                      {order.status}
                    </span>
                  </td>
                  <td className="dashboard-orders-date">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="dashboard-pagination">
          <span className="dashboard-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <div className="dashboard-pagination-controls">
            <button
              className="dashboard-pagination-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`dashboard-pagination-btn ${page === currentPage ? 'dashboard-pagination-btn--active' : ''
                  }`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="dashboard-pagination-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
