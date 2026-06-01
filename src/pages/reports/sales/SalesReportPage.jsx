import React, { useState } from 'react';
import './salesReport.css';

/* ═══════════════════════════════════════════════════
   Placeholder Data
═══════════════════════════════════════════════════ */

const summaryCards = [
  { id: 'orders', icon: 'bi-cup-hot-fill', value: '42', label: 'Total Orders', color: 'brown' },
  { id: 'gross', icon: 'bi-bag-check-fill', value: '₱10,033.00', label: 'Gross Sales', color: 'green' },
  { id: 'net', icon: 'bi-cash-stack', value: '₱9,038.00', label: 'Net Sales', color: 'gray' },
  { id: 'avg', icon: 'bi-receipt', value: '₱238.00', label: 'Average Order Value', color: 'yellow' },
  { id: 'vat', icon: 'bi-bank', value: '₱301.14', label: 'Est. Total VAT/Tax', color: 'blue' },
  { id: 'wastage', icon: 'bi-exclamation-triangle-fill', value: '₱1,240.00', label: 'Total Wastage Cost', color: 'red' },
];

const topSellingItems = [
  { rank: 1, category: 'Frappuccino', name: 'Chocolate Chip Frappe', revenue: 2095.00, sold: 15 },
  { rank: 2, category: 'Pastry', name: 'Chocolate Chip Cookie', revenue: 240.00, sold: 12 },
  { rank: 3, category: 'Non-Coffee', name: 'Toasted Almond', revenue: 354.00, sold: 5 },
  { rank: 4, category: 'Iced Coffee', name: 'Iced Americano', revenue: 204.00, sold: 5 },
  { rank: 5, category: 'Hot Coffee', name: 'Hot Cafe Latte', revenue: 153.00, sold: 5 },
  { rank: 6, category: 'Non-Coffee', name: 'Tangerine Morning', revenue: 200.00, sold: 4 },
];

const detailedProfitability = [
  { item: 'Chocolate Chip Frappe', category: 'Frappuccino', price: '₱139.00', cost: '₱111.00', profit: '₱28.00', margin: '20.1%', qty: 15, revenue: '₱2,085.00', quad: 'Top Performer', cls: 'row-star', badge: 'star' },
  { item: 'Toasted Almond', category: 'Non-Coffee', price: '₱70.00', cost: '₱43.20', profit: '₱26.80', margin: '38.2%', qty: 5, revenue: '₱350.00', quad: 'Top Performer', cls: 'row-star', badge: 'star' },
  { item: 'Hot Cafe Latte', category: 'Hot Coffee', price: '₱130.00', cost: '₱94.00', profit: '₱36.00', margin: '27.7%', qty: 5, revenue: '₱650.00', quad: 'Top Performer', cls: 'row-star', badge: 'star' },
  { item: 'Chocolate Chip Cookie', category: 'Pastry', price: '₱20.00', cost: '₱10.00', profit: '₱10.00', margin: '50.0%', qty: 12, revenue: '₱240.00', quad: 'Top Performer', cls: 'row-star', badge: 'star' },
  { item: 'Iced Americano', category: 'Iced Coffee', price: '₱40.00', cost: '₱9.20', profit: '₱30.80', margin: '77.0%', qty: 5, revenue: '₱200.00', quad: 'Promote More', cls: 'row-potential', badge: 'promote' },
  { item: 'Iced Spanish Latte', category: 'Iced Coffee', price: '₱119.00', cost: '₱85.00', profit: '₱34.00', margin: '28.5%', qty: 3, revenue: '₱357.00', quad: 'Improve Pricing', cls: 'row-cashcow', badge: 'pricing' },
  { item: 'Hot Americano', category: 'Hot Coffee', price: '₱95.00', cost: '₱15.00', profit: '₱80.00', margin: '84.2%', qty: 8, revenue: '₱760.00', quad: 'Top Performer', cls: 'row-star', badge: 'star' },
  { item: 'Hot White Mocha', category: 'Hot Coffee', price: '₱130.00', cost: '₱72.00', profit: '₱58.00', margin: '44.6%', qty: 6, revenue: '₱780.00', quad: 'Top Performer', cls: 'row-star', badge: 'star' },
  { item: 'Milky Cheese (12oz)', category: 'Non-Coffee', price: '₱55.00', cost: '₱35.00', profit: '₱20.00', margin: '36.3%', qty: 2, revenue: '₱110.00', quad: 'Review or Remove', cls: 'row-dog', badge: 'remove' },
  { item: 'Espresso Shot', category: 'Hot Coffee', price: '₱60.00', cost: '₱8.00', profit: '₱52.00', margin: '86.6%', qty: 1, revenue: '₱60.00', quad: 'Promote More', cls: 'row-potential', badge: 'promote' },
];

const salesByCategory = [
  { cat: 'Frappuccino', units: 23, rev: '₱3,403.00', pct: 33.9 },
  { cat: 'Hot Coffee', units: 15, rev: '₱2,130.00', pct: 21.2 },
  { cat: 'Iced Coffee', units: 11, rev: '₱1,087.00', pct: 10.8 },
  { cat: 'Non-Coffee', units: 10, rev: '₱1,200.00', pct: 12.0 },
  { cat: 'Pastry', units: 12, rev: '₱240.00', pct: 2.4 },
];

const categoryColors = ['#2E7D32', '#EF6C00', '#0277BD', '#7B1FA2', '#00695C'];

const sourceData = [
  { label: 'In-Store', value: 10033, pct: 100, color: '#42A5F5' },
  { label: 'Grab', value: 0, pct: 0, color: '#4CAF50' },
  { label: 'FoodPanda', value: 0, pct: 0, color: '#5D4037' },
];

const hourlyData = [
  { time: '9AM', orders: 2 },
  { time: '10AM', orders: 3 },
  { time: '11AM', orders: 5 },
  { time: '12PM', orders: 6 },
  { time: '1PM', orders: 4 },
  { time: '2PM', orders: 5 },
  { time: '3PM', orders: 4 },
  { time: '4PM', orders: 6 },
  { time: '5PM', orders: 3 },
  { time: '6PM', orders: 2 },
  { time: '7PM', orders: 1 },
  { time: '8PM', orders: 1 },
];

/* ═══════════════════════════════════════════════════
   SVG Chart Helpers
═══════════════════════════════════════════════════ */

const DonutChart = ({ data, total }) => {
  const [hovered, setHovered] = useState(null);
  const radius = 80;
  const strokeWidth = 30;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = data.filter(d => d.pct > 0).map((d) => {
    const dashArray = (d.pct / 100) * circumference;
    const dashOffset = -offset;
    offset += dashArray;
    return { ...d, dashArray, dashOffset };
  });

  return (
    <div className="donut-chart-container">
      <svg className="donut-chart-svg" viewBox="0 0 200 200">
        {segments.map((seg, idx) => (
          <circle
            key={idx}
            className="donut-segment"
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dashArray} ${circumference - seg.dashArray}`}
            strokeDashoffset={seg.dashOffset}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered !== null && hovered !== idx ? 0.5 : 1 }}
          />
        ))}
      </svg>
      <div className="donut-center-text">
        <span className="donut-center-value">
          {hovered !== null ? `${segments[hovered].pct}%` : `₱${total.toLocaleString()}`}
        </span>
        <span className="donut-center-label">
          {hovered !== null ? segments[hovered].label : 'Total'}
        </span>
      </div>
    </div>
  );
};

const PieChart = ({ data, colors }) => {
  const [hovered, setHovered] = useState(null);
  const radius = 50;
  const strokeWidth = 100;
  const circumference = 2 * Math.PI * radius;
  const totalPct = data.reduce((sum, d) => sum + d.pct, 0);
  let offset = 0;

  const segments = data.map((d, idx) => {
    const dashArray = (d.pct / totalPct) * circumference;
    const dashOffset = -offset;
    offset += dashArray;
    return { ...d, dashArray, dashOffset, color: colors[idx] };
  });

  return (
    <div className="pie-chart-container">
      <svg className="pie-chart-svg" viewBox="0 0 100 100">
        {segments.map((seg, idx) => (
          <circle
            key={idx}
            className="pie-segment"
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dashArray} ${circumference - seg.dashArray}`}
            strokeDashoffset={seg.dashOffset}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered !== null && hovered !== idx ? 0.5 : 1 }}
          />
        ))}
      </svg>
      {hovered !== null && (
        <div className="donut-center-text" style={{ background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <span className="donut-center-value" style={{ fontSize: '0.8rem' }}>
            {segments[hovered].cat}
          </span>
          <span className="donut-center-label">
            {segments[hovered].rev} ({segments[hovered].pct.toFixed(1)}%)
          </span>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   Quadrant Badge Component
═══════════════════════════════════════════════════ */
const QuadBadge = ({ quad, badge }) => {
  const icons = {
    star: 'bi-star-fill',
    promote: 'bi-megaphone-fill',
    pricing: 'bi-tag-fill',
    remove: 'bi-x-circle-fill',
  };
  return (
    <span className={`quad-badge quad-badge--${badge}`}>
      <i className={`bi ${icons[badge]}`}></i>
      {quad}
    </span>
  );
};

/* ═══════════════════════════════════════════════════
   Sales Report Page Component
═══════════════════════════════════════════════════ */

const SalesReportPage = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const maxOrders = Math.max(...hourlyData.map((d) => d.orders));
  const peakHour = hourlyData.reduce((prev, curr) => (curr.orders > prev.orders ? curr : prev));
  const totalOrders = hourlyData.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="sales-page">

      {/* ───── Page Header ───── */}
      <div className="sales-page-header">
        <div className="layout-page-heading">
          <h2>Sales Report</h2>
          <p>View and analyze your sales performance and profitability metrics.</p>
        </div>

        <div className="sales-header-actions">
          <button className="sales-btn sales-btn--primary">
            <i className="bi bi-printer"></i>
            Print
          </button>
        </div>
      </div>

      {/* ───── Filter Bar ───── */}
      <div className="sales-filter-bar">
        <select className="sales-filter-select" defaultValue="Today">
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="Last Month">Last Month</option>
          <option value="This Year">This Year</option>
        </select>

        <select className="sales-filter-select">
          <option>All Order Sources</option>
          <option>In-Store</option>
          <option>Grab</option>
          <option>FoodPanda</option>
        </select>

        <select className="sales-filter-select">
          <option>All Categories</option>
          <option>Hot Coffee</option>
          <option>Iced Coffee</option>
          <option>Frappuccino</option>
          <option>Non-Coffee</option>
          <option>Pastry</option>
        </select>

        <div className="sales-date-group">
          <span className="sales-date-label">From</span>
          <input
            type="date"
            className="sales-filter-date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="sales-date-group">
          <span className="sales-date-label">To</span>
          <input
            type="date"
            className="sales-filter-date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <select className="sales-filter-select" defaultValue="pct3">
          <option value="pct3">Percentage Tax (3%)</option>
          <option value="income8">Income Tax (8%)</option>
          <option value="none">No Tax Computation</option>
        </select>

        <button className="sales-reset-btn">Reset</button>
      </div>

      {/* ───── Summary Cards ───── */}
      <div className="sales-summary-cards">
        {summaryCards.map((card) => (
          <div
            key={card.id}
            className={`sales-summary-card sales-card--${card.color}`}
          >
            <div className="sales-summary-card-icon">
              <i className={`bi ${card.icon}`}></i>
            </div>
            <p className="sales-summary-card-value">{card.value}</p>
            <p className="sales-summary-card-label">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
          Row 1 — Sales by Order Source + Top Selling Items
      ═══════════════════════════════════════════════ */}
      <div className="sales-section-grid">
        {/* Sales by Order Source */}
        <div className="sales-panel">
          <div className="sales-panel-header">
            <h3 className="sales-panel-title">
              <i className="bi bi-diagram-3-fill"></i>
              Sales by Order Source
            </h3>
          </div>
          <div className="sales-panel-body">
            <div className="sales-chart-wrapper">
              <DonutChart data={sourceData} total={10033} />
            </div>
            <div className="source-boxes">
              <div className="source-box s-instore">
                <span className="s-val">₱10,033.00</span>
                <span className="s-label">In-Store</span>
              </div>
              <div className="source-box s-grab">
                <span className="s-val">₱0.00</span>
                <span className="s-label">Grab</span>
              </div>
              <div className="source-box s-foodpanda">
                <span className="s-val">₱0.00</span>
                <span className="s-label">FoodPanda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Items — dashboard style */}
        <div className="sales-panel">
          <div className="sales-panel-header sales-panel-header--accent">
            <h3 className="sales-panel-title">
              <i className="bi bi-heart-fill"></i>
              Top Selling Items
            </h3>
          </div>
          <div className="sales-topselling-list">
            {topSellingItems.map((item) => (
              <div key={item.rank} className="sales-topselling-item">
                <span className={`sales-topselling-rank sales-topselling-rank--${item.rank}`}>
                  #{item.rank}
                </span>
                <div className="sales-topselling-item-info">
                  <p className="sales-topselling-category">{item.category}</p>
                  <p className="sales-topselling-name">{item.name}</p>
                </div>
                <div className="sales-topselling-item-stats">
                  <p className="sales-topselling-revenue">₱{item.revenue.toFixed(2)}</p>
                  <p className="sales-topselling-sold">{item.sold} Sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          Row 2 — Menu Profitability Heatmap + Quadrant Legend
      ═══════════════════════════════════════════════ */}
      <div className="sales-section-grid">
        <div className="sales-panel">
          <div className="sales-panel-header">
            <h3 className="sales-panel-title">
              <i className="bi bi-grid-3x3-gap-fill"></i>
              Menu Profitability Heatmap
            </h3>
          </div>
          <div className="sales-panel-body">
            <div className="scatter-plot-container">
              {/* Stars — high margin, high volume */}
              <div className="scatter-bubble b-green" style={{ bottom: '75%', left: '70%', width: '32px', height: '32px' }} title="Choc Chip Frappe (15 sold, 20.1%)"></div>
              <div className="scatter-bubble b-green" style={{ bottom: '65%', left: '45%', width: '20px', height: '20px' }} title="Toasted Almond (5 sold, 38.2%)"></div>
              <div className="scatter-bubble b-green" style={{ bottom: '55%', left: '42%', width: '20px', height: '20px' }} title="Hot Cafe Latte (5 sold, 27.7%)"></div>
              <div className="scatter-bubble b-green" style={{ bottom: '78%', left: '60%', width: '26px', height: '26px' }} title="Choc Chip Cookie (12 sold, 50%)"></div>
              {/* Promote More — high margin, low volume */}
              <div className="scatter-bubble b-blue" style={{ bottom: '88%', left: '25%', width: '18px', height: '18px' }} title="Iced Americano (5 sold, 77%)"></div>
              <div className="scatter-bubble b-blue" style={{ bottom: '92%', left: '10%', width: '12px', height: '12px' }} title="Espresso Shot (1 sold, 86.6%)"></div>
              {/* Improve Pricing — low margin, high volume */}
              <div className="scatter-bubble b-yellow" style={{ bottom: '30%', left: '28%', width: '16px', height: '16px' }} title="Iced Spanish Latte (3 sold, 28.5%)"></div>
              {/* Review or Remove — low margin, low volume */}
              <div className="scatter-bubble b-red" style={{ bottom: '35%', left: '15%', width: '14px', height: '14px' }} title="Milky Cheese (2 sold, 36.3%)"></div>
              <span className="scatter-axis-label" style={{ bottom: '-22px', left: '50%', transform: 'translateX(-50%)' }}>Sales Volume (Qty) →</span>
              <span className="scatter-axis-label" style={{ top: '50%', left: '-35px', transform: 'translateY(-50%) rotate(-90deg)' }}>← Margin %</span>
            </div>
            <div className="sales-chart-legend">
              <span className="sales-legend-item"><span className="sales-legend-dot" style={{ background: '#4CAF50' }}></span> Top Performer</span>
              <span className="sales-legend-item"><span className="sales-legend-dot" style={{ background: '#FFC107' }}></span> Improve Pricing</span>
              <span className="sales-legend-item"><span className="sales-legend-dot" style={{ background: '#03A9F4' }}></span> Promote More</span>
              <span className="sales-legend-item"><span className="sales-legend-dot" style={{ background: '#F44336' }}></span> Review or Remove</span>
            </div>
          </div>
        </div>

        <div className="sales-panel">
          <div className="sales-panel-header">
            <h3 className="sales-panel-title">
              <i className="bi bi-pie-chart-fill"></i>
              Quadrant Legend
            </h3>
          </div>
          <div className="sales-panel-body">
            <div className="quadrant-grid">
              <div className="quadrant-item q-star">
                <i className="bi bi-star-fill q-icon"></i>
                <span className="q-number">6</span>
                <span className="q-label">Top Performer</span>
                <span className="q-sublabel">High Profit · High Sales</span>
              </div>
              <div className="quadrant-item q-potential">
                <i className="bi bi-megaphone-fill q-icon"></i>
                <span className="q-number">2</span>
                <span className="q-label">Promote More</span>
                <span className="q-sublabel">High Profit · Low Sales</span>
              </div>
              <div className="quadrant-item q-cashcow">
                <i className="bi bi-tag-fill q-icon"></i>
                <span className="q-number">6</span>
                <span className="q-label">Improve Pricing</span>
                <span className="q-sublabel">Low Profit · High Sales</span>
              </div>
              <div className="quadrant-item q-dog">
                <i className="bi bi-x-circle-fill q-icon"></i>
                <span className="q-number">2</span>
                <span className="q-label">Review or Remove</span>
                <span className="q-sublabel">Low Profit · Low Sales</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          Row 3 — Detailed Profitability Table
      ═══════════════════════════════════════════════ */}
      <div className="sales-table-container">
        <div className="sales-table-header">
          <h3 className="sales-table-header-title">Detailed Profitability Table</h3>
          <select className="sales-filter-select">
            <option>Sort by: Highest Revenue</option>
            <option>Sort by: Highest Profit</option>
            <option>Sort by: Highest Margin</option>
            <option>Sort by: Highest Unit Sold</option>
          </select>
        </div>
        <div className="sales-table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Est. Cost</th>
                <th>Profit/Item</th>
                <th>Margin %</th>
                <th>Unit Sold</th>
                <th>Revenue</th>
                <th>Quadrant</th>
              </tr>
            </thead>
            <tbody>
              {detailedProfitability.map((row, idx) => (
                <tr key={idx} className={row.cls}>
                  <td style={{ fontWeight: 600 }}>{row.item}</td>
                  <td>{row.category}</td>
                  <td>{row.price}</td>
                  <td>{row.cost}</td>
                  <td>{row.profit}</td>
                  <td>{row.margin}</td>
                  <td>{row.qty}</td>
                  <td style={{ fontWeight: 600 }}>{row.revenue}</td>
                  <td><QuadBadge quad={row.quad} badge={row.badge} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          Row 4 — Sales by Category Chart + Details Table
      ═══════════════════════════════════════════════ */}
      <div className="sales-section-grid">
        <div className="sales-panel">
          <div className="sales-panel-header">
            <h3 className="sales-panel-title">
              <i className="bi bi-pie-chart-fill"></i>
              Sales by Category
            </h3>
          </div>
          <div className="sales-panel-body">
            <div className="sales-chart-wrapper">
              <PieChart data={salesByCategory} colors={categoryColors} />
            </div>
            <div className="sales-chart-legend">
              {salesByCategory.map((cat, idx) => (
                <span key={idx} className="sales-legend-item">
                  <span className="sales-legend-dot" style={{ background: categoryColors[idx] }}></span>
                  {cat.cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="sales-panel">
          <div className="sales-panel-header sales-panel-header--accent">
            <h3 className="sales-panel-title">
              <i className="bi bi-bar-chart-fill"></i>
              Sales by Category
            </h3>
          </div>
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Units</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesByCategory.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{row.cat}</td>
                    <td>{row.units}</td>
                    <td>{row.rev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          Row 5 — Hourly Sales Pattern (Bar Chart) + Insight
      ═══════════════════════════════════════════════ */}
      <div className="sales-panel">
        <div className="sales-panel-header">
          <h3 className="sales-panel-title">
            <i className="bi bi-bar-chart-line-fill"></i>
            Hourly Sales Pattern
          </h3>
        </div>
        <div className="sales-chart-area">
          <div className="sales-chart-yaxis">
            {[7, 6, 5, 4, 3, 2, 1, 0].map((val) => (
              <span key={val} className="sales-chart-ylabel">{val}</span>
            ))}
          </div>
          <div className="sales-chart-bars">
            {hourlyData.map((d) => (
              <div key={d.time} className="sales-chart-bar-group">
                <div className="sales-chart-bar-wrapper">
                  <div
                    className="sales-chart-bar"
                    style={{ height: `${(d.orders / maxOrders) * 100}%` }}
                  >
                    <span className="sales-chart-bar-tooltip">
                      {d.orders} orders
                    </span>
                  </div>
                </div>
                <span className="sales-chart-xlabel">{d.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="sales-insight-box">
          <div className="sales-insight-icon">
            <i className="bi bi-lightbulb-fill"></i>
          </div>
          <p className="sales-insight-text">
            <strong>Peak hours are {peakHour.time}</strong> with {peakHour.orders} orders. 
            A total of <strong>{totalOrders} orders</strong> were recorded across the day. 
            Consider adding extra staff during peak hours (12PM & 4PM) to reduce wait times and increase throughput.
          </p>
        </div>
      </div>

    </div>
  );
};

export default SalesReportPage;
