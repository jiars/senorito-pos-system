import React from 'react';
import { DonutChart, PieChart } from './SalesCharts';
import { formatCurrency } from '../../../../utils/currencyFormatters';

export const SalesBySourcePanel = ({ sourceData, summaryData }) => {
  return (
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
              <span className="s-val">{formatCurrency(source.value)}</span>
              <span className="s-label">{source.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TopSellingItemsPanel = ({ topSellingItems }) => {
  return (
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
              <p className="sales-topselling-revenue">{formatCurrency(item.revenue)}</p>
              <p className="sales-topselling-sold">{item.sold} Sold</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SalesByCategoryPanels = ({ categorySales, categoryColors }) => {
  return (
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
                    <td>{formatCurrency(row.rev)}</td>
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
  );
};

export const HourlySalesPattern = ({ hourlyData, yAxisLabels, maxOrders, peakHour, totalOrders }) => {
  return (
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
  );
};
