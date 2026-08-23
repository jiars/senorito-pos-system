import React, { useState, useEffect } from 'react';
import './salesReport.css';
import { 
  fetchSalesSummary, 
  fetchSalesAnalytics, 
  fetchDetailedProfitability, 
  fetchOrderTrends 
} from '../../../services/reports/salesReportService';

const categoryColors = ['#2E7D32', '#EF6C00', '#0277BD', '#7B1FA2', '#00695C'];

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
          {hovered !== null 
            ? `${segments[hovered].pct.toFixed(2)}%` 
            : `₱${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
    return { ...d, dashArray, dashOffset, color: colors[idx % colors.length] };
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
            ₱{segments[hovered].rev.toFixed(2)} ({segments[hovered].pct.toFixed(2)}%)
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
  const [summaryData, setSummaryData] = useState({
    totalOrders: 0,
    grossSales: 0,
    netSales: 0,
    avgOrderValue: 0,
    totalWastageCost: 0
  });
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [detailedProfitability, setDetailedProfitability] = useState([]);
  const [datePreset, setDatePreset] = useState('All Time');
  const [filterSource, setFilterSource] = useState('All Order Sources');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [profitabilitySort, setProfitabilitySort] = useState('Highest Revenue');
  const [heatmapActive, setHeatmapActive] = useState(null);

  // Quadrant Counts
  const [quadCounts, setQuadCounts] = useState({
    'Top Performer': 0,
    'Promote More': 0,
    'Improve Pricing': 0,
    'Review or Remove': 0,
  });

  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setIsLoading(true);
        const [summary, analytics, trends, profitability] = await Promise.all([
          fetchSalesSummary(fromDate, toDate, filterSource, filterCategory),
          fetchSalesAnalytics(fromDate, toDate, filterSource, filterCategory),
          fetchOrderTrends(fromDate, toDate, filterSource, filterCategory),
          fetchDetailedProfitability(fromDate, toDate, filterSource, filterCategory)
        ]);
        
        setSummaryData(summary);
        setTopSellingItems(analytics.topSelling.slice(0, 6)); // Display top 6
        setCategorySales(analytics.categorySales);
        setSourceData(trends.sourceData);
        setHourlyData(trends.hourlyData);
        setDetailedProfitability(profitability);

        // Update Quadrant Counts
        const counts = { 'Top Performer': 0, 'Promote More': 0, 'Improve Pricing': 0, 'Review or Remove': 0 };
        profitability.forEach(d => {
          if (counts[d.quad] !== undefined) counts[d.quad]++;
        });
        setQuadCounts(counts);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadReportData();
  }, [fromDate, toDate, filterSource, filterCategory]);

  const summaryCards = [
    { id: 'orders', icon: 'bi-cup-hot-fill', value: summaryData.totalOrders.toString(), label: 'Total Orders', color: 'brown' },
    { id: 'gross', icon: 'bi-bag-check-fill', value: `₱${summaryData.grossSales.toFixed(2)}`, label: 'Gross Sales', color: 'green' },
    { id: 'net', icon: 'bi-cash-stack', value: `₱${summaryData.netSales.toFixed(2)}`, label: 'Net Sales', color: 'gray' },
    { id: 'avg', icon: 'bi-receipt', value: `₱${summaryData.avgOrderValue.toFixed(2)}`, label: 'Average Order Value', color: 'yellow' },
    { id: 'wastage', icon: 'bi-exclamation-triangle-fill', value: `₱${summaryData.totalWastageCost.toFixed(2)}`, label: 'Total Wastage Cost', color: 'red' },
  ];

  const safeHourlyData = hourlyData.length > 0 ? hourlyData : [{ time: 'N/A', orders: 0 }];
  const maxOrders = Math.max(...safeHourlyData.map((d) => d.orders));
  const peakHour = safeHourlyData.reduce((prev, curr) => (curr.orders > prev.orders ? curr : prev));
  const totalOrders = safeHourlyData.reduce((sum, d) => sum + d.orders, 0);

  // Dynamic Y-Axis for Hourly Chart
  const generateYAxis = (max) => {
    if (max <= 0) return [4, 3, 2, 1, 0];
    const steps = 4;
    const stepSize = Math.ceil(max / steps) || 1;
    const maxVal = stepSize * steps;
    const arr = [];
    for (let i = maxVal; i >= 0; i -= stepSize) {
      arr.push(i);
    }
    return arr;
  };
  const yAxisLabels = generateYAxis(maxOrders);

  // Heatmap Calculations
  const maxQty = Math.max(...detailedProfitability.map(d => d.qty), 1);
  const maxRev = Math.max(...detailedProfitability.map(d => d.revenue), 1);

  const getQuadColorClass = (quad) => {
    switch (quad) {
      case 'Top Performer': return 'b-green';
      case 'Promote More': return 'b-blue';
      case 'Improve Pricing': return 'b-yellow';
      case 'Review or Remove': return 'b-red';
      default: return 'b-green';
    }
  };

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
        <select className="sales-filter-select" value={datePreset} onChange={(e) => handleDatePresetChange(e.target.value)}>
          <option value="All Time">All Time</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="Last Month">Last Month</option>
          <option value="This Year">This Year</option>
          <option value="Custom">Custom Range</option>
        </select>

        <select className="sales-filter-select" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
          <option>All Order Sources</option>
          <option>In-Store</option>
          <option>Grab</option>
          <option>FoodPanda</option>
        </select>

        <select className="sales-filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
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
            onChange={(e) => {
              setFromDate(e.target.value);
              setDatePreset('Custom');
            }}
          />
        </div>

        <div className="sales-date-group">
          <span className="sales-date-label">To</span>
          <input
            type="date"
            className="sales-filter-date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setDatePreset('Custom');
            }}
          />
        </div>

        <button 
          className="sales-reset-btn"
          onClick={() => {
            handleDatePresetChange('All Time');
            setFilterSource('All Order Sources');
            setFilterCategory('All Categories');
          }}
        >
          Reset
        </button>
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
              <DonutChart data={sourceData} total={summaryData.netSales} />
            </div>
            <div className="source-boxes">
              {sourceData.map(source => (
                <div key={source.label} className={`source-box s-${source.label.toLowerCase().replace('-', '')}`}>
                  <span className="s-val">₱{source.value.toFixed(2)}</span>
                  <span className="s-label">{source.label}</span>
                </div>
              ))}
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
            <div 
              className="scatter-plot-container"
              onClick={() => setHeatmapActive(null)}
            >
              {detailedProfitability.map((item, idx) => {
                const bottomPct = Math.min(Math.max(item.margin, 5), 95); // clamp 5-95%
                const leftPct = (item.qty / maxQty) * 90; // scale 0-90%
                const sizePx = 12 + (item.revenue / maxRev) * 24; // scale 12px to 36px
                const colorClass = getQuadColorClass(item.quad);
                return (
                  <div
                    key={idx}
                    className={`scatter-bubble ${colorClass}`}
                    style={{ 
                      bottom: `${bottomPct}%`, 
                      left: `${leftPct}%`, 
                      width: `${sizePx}px`, 
                      height: `${sizePx}px`,
                      zIndex: heatmapActive === idx ? 5 : 1,
                      border: heatmapActive === idx ? '2px solid #2C1810' : 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHeatmapActive(heatmapActive === idx ? null : idx);
                    }}
                  ></div>
                );
              })}

              {heatmapActive !== null && detailedProfitability[heatmapActive] && (
                <div style={{
                  position: 'absolute',
                  bottom: `calc(${Math.min(Math.max(detailedProfitability[heatmapActive].margin, 5), 95)}% + ${(12 + (detailedProfitability[heatmapActive].revenue / maxRev) * 24)/2 + 8}px)`,
                  left: `${(detailedProfitability[heatmapActive].qty / maxQty) * 90}%`,
                  transform: 'translateX(-50%)',
                  background: '#E8F5E9',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: '1px solid #A5D6A7',
                  zIndex: 10,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3A1A0A' }}>
                    {detailedProfitability[heatmapActive].item}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '2px' }}>
                    ₱{detailedProfitability[heatmapActive].revenue.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                    ({detailedProfitability[heatmapActive].margin.toFixed(2)}%)
                  </div>
                </div>
              )}

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
                <span className="q-number">{quadCounts['Top Performer']}</span>
                <span className="q-label">Top Performer</span>
                <span className="q-sublabel">High Profit · High Sales</span>
              </div>
              <div className="quadrant-item q-potential">
                <i className="bi bi-megaphone-fill q-icon"></i>
                <span className="q-number">{quadCounts['Promote More']}</span>
                <span className="q-label">Promote More</span>
                <span className="q-sublabel">High Profit · Low Sales</span>
              </div>
              <div className="quadrant-item q-cashcow">
                <i className="bi bi-tag-fill q-icon"></i>
                <span className="q-number">{quadCounts['Improve Pricing']}</span>
                <span className="q-label">Improve Pricing</span>
                <span className="q-sublabel">Low Profit · High Sales</span>
              </div>
              <div className="quadrant-item q-dog">
                <i className="bi bi-x-circle-fill q-icon"></i>
                <span className="q-number">{quadCounts['Review or Remove']}</span>
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
          <select className="sales-filter-select" value={profitabilitySort} onChange={(e) => setProfitabilitySort(e.target.value)}>
            <option>Highest Revenue</option>
            <option>Highest Profit</option>
            <option>Highest Margin</option>
            <option>Highest Unit Sold</option>
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
              {detailedProfitability.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#6C757D' }}>
                    No profitability data available.
                  </td>
                </tr>
              ) : (
                [...detailedProfitability]
                  .sort((a, b) => {
                    if (profitabilitySort === 'Highest Profit') return b.profitPerItem - a.profitPerItem;
                    if (profitabilitySort === 'Highest Margin') return b.margin - a.margin;
                    if (profitabilitySort === 'Highest Unit Sold') return b.qty - a.qty;
                    return b.revenue - a.revenue;
                  })
                  .map((row, idx) => (
                  <tr key={idx} className={row.cls}>
                    <td style={{ fontWeight: 600 }}>{row.item}</td>
                    <td>{row.category}</td>
                    <td>₱{row.price.toFixed(2)}</td>
                    <td>₱{row.cost.toFixed(2)}</td>
                    <td><strong>₱{row.profitPerItem.toFixed(2)}</strong></td>
                    <td>
                      <span className="sales-margin-chip">{row.margin.toFixed(1)}%</span>
                    </td>
                    <td>{row.qty}</td>
                    <td>₱{row.revenue.toFixed(2)}</td>
                    <td>
                      <QuadBadge quad={row.quad} badge={row.badge} />
                    </td>
                  </tr>
                ))
              )}
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
              <PieChart data={categorySales} colors={categoryColors} />
            </div>
            <div className="sales-chart-legend">
              {categorySales.map((cat, idx) => (
                <span key={idx} className="sales-legend-item">
                  <span className="sales-legend-dot" style={{ background: categoryColors[idx % categoryColors.length] }}></span>
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
                  <th>Contribution</th>
                </tr>
              </thead>
              <tbody>
                {categorySales.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6C757D' }}>
                      No category data available.
                    </td>
                  </tr>
                ) : (
                  categorySales.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.cat}</td>
                      <td>{row.units}</td>
                      <td>₱{row.rev.toFixed(2)}</td>
                      <td>
                        <div className="sales-progress-bar">
                          <div className="sales-progress-fill" style={{ width: `${row.pct}%`, backgroundColor: categoryColors[idx % categoryColors.length] }}></div>
                          <span className="sales-progress-text">{row.pct.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
            {yAxisLabels.map((val) => (
              <span key={val} className="sales-chart-ylabel">{val}</span>
            ))}
          </div>
          <div className="sales-chart-bars">
            {hourlyData.map((d) => (
              <div key={d.time} className="sales-chart-bar-group">
                <div className="sales-chart-bar-wrapper">
                  <div
                    className="sales-chart-bar"
                    style={{ height: `${maxOrders > 0 ? (d.orders / maxOrders) * 100 : 0}%` }}
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
            {totalOrders === 0 ? (
              <span>No orders recorded in this period. Wait for more data to see hourly trends.</span>
            ) : (
              <span>
                <strong>Peak hours are {peakHour.time}</strong> with {peakHour.orders} orders. 
                A total of <strong>{totalOrders} orders</strong> were recorded across this period. 
                {peakHour.orders >= 5 
                  ? ` Consider adding extra staff around ${peakHour.time} to reduce wait times and increase throughput.` 
                  : ' Order volume is currently manageable with existing staff levels.'}
              </span>
            )}
          </p>
        </div>
      </div>

    </div>
  );
};

export default SalesReportPage;
