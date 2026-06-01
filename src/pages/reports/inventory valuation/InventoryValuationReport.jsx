import React, { useState } from 'react';
import './inventoryValuation.css';

/* ═══════════════════════════════════════════════════
   Mock Data
═══════════════════════════════════════════════════ */
const MOCK_ITEMS = [
  { item: 'Coffee Beans', category: 'Ingredient', stock: 5000, unit: 'g', reorder: 2000, cost: 1.00, value: 4888.00, pct: 21.5 },
  { item: 'Milk', category: 'Ingredient', stock: 19080, unit: 'ml', reorder: 3000, cost: 0.18, value: 3434.40, pct: 15.1 },
  { item: 'Water', category: 'Ingredient', stock: 99600, unit: 'ml', reorder: 5000, cost: 0.02, value: 1992.00, pct: 8.8 },
  { item: '22oz Cup', category: 'Packaging', stock: 448, unit: 'pcs', reorder: 50, cost: 3.50, value: 1568.00, pct: 6.9 },
  { item: 'Hungarian Sausage', category: 'Ingredient', stock: 3000, unit: 'g', reorder: 800, cost: 0.50, value: 1500.00, pct: 6.6 },
  { item: '16oz Cup', category: 'Packaging', stock: 498, unit: 'pcs', reorder: 50, cost: 3.00, value: 1494.00, pct: 6.6 },
  { item: 'Tocino', category: 'Ingredient', stock: 3000.00, unit: 'g', reorder: 800, cost: 0.45, value: 1350.00, pct: 5.9 },
  { item: 'Cookie', category: 'Ingredient', stock: 50.00, unit: 'pcs', reorder: 10, cost: 20.00, value: 1000.00, pct: 4.4 },
  { item: 'Brownie', category: 'Ingredient', stock: 21, unit: 'pcs', reorder: 10, cost: 25.00, value: 1000.00, pct: 4.4 },
  { item: 'Rice', category: 'Ingredient', stock: 10000.00, unit: 'g', reorder: 2000, cost: 0.06, value: 600.00, pct: 2.6 },
  { item: '12oz Hot Cup', category: 'Packaging', stock: 198.00, unit: 'pcs', reorder: 50, cost: 3.00, value: 594.00, pct: 2.6 },
  { item: 'Food Container', category: 'Packaging', stock: 200.00, unit: 'pcs', reorder: 50, cost: 2.50, value: 500.00, pct: 2.2 },
  { item: 'Cooking Oil', category: 'Ingredient', stock: 5000.00, unit: 'ml', reorder: 500, cost: 0.07, value: 350.00, pct: 1.5 },
  { item: 'Chocolate Chips', category: 'Ingredient', stock: 1000.00, unit: 'g', reorder: 200, cost: 0.35, value: 350.00, pct: 1.5 },
  { item: 'Oreo Crumbs', category: 'Ingredient', stock: 1000.00, unit: 'g', reorder: 300, cost: 0.30, value: 300.00, pct: 1.3 },
  { item: 'Straw', category: 'Packaging', stock: 1496.00, unit: 'pcs', reorder: 100, cost: 0.20, value: 299.20, pct: 1.3 },
  { item: 'Cocoa Powder', category: 'Ingredient', stock: 1000.00, unit: 'g', reorder: 200, cost: 0.25, value: 250.00, pct: 1.1 },
  { item: 'Frappe Base', category: 'Ingredient', stock: 2000.00, unit: 'ml', reorder: 1000, cost: 0.12, value: 240.00, pct: 1.1 },
  { item: 'Garlic', category: 'Ingredient', stock: 1000.00, unit: 'g', reorder: 100, cost: 0.20, value: 200.00, pct: 0.9 },
  { item: 'Spoon and Fork Set', category: 'Packaging', stock: 300.00, unit: 'pcs', reorder: 50, cost: 0.67, value: 200.00, pct: 0.9 },
  { item: 'Sugar Syrup', category: 'Ingredient', stock: 1943.00, unit: 'ml', reorder: 1000, cost: 0.08, value: 155.44, pct: 0.7 },
  { item: 'Whipping Cream', category: 'Ingredient', stock: 1000.00, unit: 'ml', reorder: 500, cost: 0.15, value: 150.00, pct: 0.7 },
  { item: 'White Chocolate Sauce', category: 'Ingredient', stock: 1000.00, unit: 'ml', reorder: 800, cost: 0.11, value: 110.00, pct: 0.5 },
  { item: 'Chocolate Sauce', category: 'Ingredient', stock: 1000.00, unit: 'ml', reorder: 800, cost: 0.10, value: 100.00, pct: 0.4 },
  { item: 'Ice', category: 'Ingredient', stock: 9440.00, unit: 'g', reorder: 5000, cost: 0.01, value: 94.40, pct: 0.4 },
];

const CAT_SUMMARY = [
  { category: 'Ingredient', value: 18064.24, pct: 79.5 },
  { category: 'Packaging', value: 4655.20, pct: 20.5 },
];

const InventoryValuationReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('Sort: Highest Value First');
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // SVG Chart Calculation
  const radius = 60;
  const strokeWidth = 30;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const colors = {
    'Ingredient': '#5A2D15',
    'Packaging': '#A07156'
  };

  const chartSegments = CAT_SUMMARY.map((d, i) => {
    const dashArray = (d.pct / 100) * circumference;
    const dashOffset = -offset;
    offset += dashArray;
    return { ...d, dashArray, dashOffset, color: colors[d.category] || '#ccc' };
  });

  return (
    <div className="val-page">
      {/* ─── Header ─── */}
      <div className="val-header">
        <div className="layout-page-heading" style={{ marginBottom: 0 }}>
          <h2>Inventory Valuation Report</h2>
          <p>Current as of Mar 15, 2026, 6:00 PM</p>
        </div>
        <div className="val-actions">
          <button className="val-btn val-btn-outline">
            <i className="bi bi-download"></i> Export CSV
          </button>
          <button className="val-btn val-btn-primary">
            <i className="bi bi-printer"></i> Print
          </button>
        </div>
      </div>

      {/* ─── Alert ─── */}
      <div className="val-alert">
        <i className="bi bi-info-circle"></i>
        <span><strong>Valuation Basis:</strong> Current stock x recorded unit cost (per item's stock unit)</span>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="val-summary-cards">
        <div className="val-summary-card val-card--brown">
          <div className="val-summary-card-icon">
            <i className="bi bi-currency-dollar"></i>
          </div>
          <p className="val-card-value">₱22,719.44</p>
          <p className="val-card-label">Total Inventory Value</p>
        </div>
        <div className="val-summary-card val-card--blue">
          <div className="val-summary-card-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <p className="val-card-value">25</p>
          <p className="val-card-label">Items</p>
        </div>
        <div className="val-summary-card val-card--green">
          <div className="val-summary-card-icon">
            <i className="bi bi-tags"></i>
          </div>
          <p className="val-card-value">2</p>
          <p className="val-card-label">Categories</p>
        </div>
      </div>

      {/* ─── Top Grid (Chart + Summary Table) ─── */}
      <div className="val-top-grid">

        {/* Chart Panel */}
        <div className="val-panel">
          <div className="val-panel-header">
            <i className="bi bi-pie-chart"></i> Value By Category
          </div>
          <div className="val-panel-body val-chart-container">
            <div style={{ position: 'relative' }}>
              <svg className="val-donut-svg" viewBox="0 0 160 160">
                {chartSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    className="val-donut-segment"
                    cx="80" cy="80" r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${seg.dashArray} ${circumference - seg.dashArray}`}
                    strokeDashoffset={seg.dashOffset}
                    onMouseEnter={() => setHoveredSegment(idx)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    style={{ opacity: hoveredSegment !== null && hoveredSegment !== idx ? 0.4 : 1 }}
                  />
                ))}
              </svg>
            </div>
            <div className="val-legend">
              {CAT_SUMMARY.map(cat => (
                <div className="val-legend-item" key={cat.category}>
                  <div className="val-legend-color" style={{ backgroundColor: colors[cat.category] }}></div>
                  <span>{cat.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Table Panel */}
        <div className="val-panel">
          <div className="val-panel-header">
            <i className="bi bi-list-task"></i> Category Summary
          </div>
          <div className="val-panel-body" style={{ padding: '0' }}>
            <table className="val-cat-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Value</th>
                  <th>% Of Total</th>
                </tr>
              </thead>
              <tbody>
                {CAT_SUMMARY.map((cat, i) => (
                  <tr key={i}>
                    <td>{cat.category}</td>
                    <td>₱{cat.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>{cat.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="val-filter-bar">
        <div className="val-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="val-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>Ingredient</option>
          <option>Packaging</option>
        </select>

        <select
          className="val-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option>Sort: Highest Value First</option>
          <option>Sort: Lowest Value First</option>
          <option>Sort: A-Z</option>
        </select>

        <button className="val-reset-btn">Reset</button>
      </div>

      {/* ─── Main Table Panel ─── */}
      <div className="val-panel">
        <div className="val-table-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-table"></i> All Items
          </div>
          <div className="val-table-summary-info">
            Showing 25 items | Filtered total: <strong>₱22,719.44</strong>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="val-main-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Reorder</th>
                <th>Cost/Unit</th>
                <th>Total Value</th>
                <th>% Of Total</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ITEMS.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.item}</td>
                  <td>{item.category}</td>
                  <td>{item.stock}</td>
                  <td>{item.unit}</td>
                  <td>{item.reorder}</td>
                  <td>₱{item.cost.toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>₱{item.value.toFixed(2)}</td>
                  <td>{item.pct}%</td>
                </tr>
              ))}
              <tr className="val-main-table-grand">
                <td colSpan="6">GRAND TOTAL</td>
                <td>₱22,719.44</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default InventoryValuationReport;
