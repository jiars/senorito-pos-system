import React from 'react';
import { formatCurrency } from '../../../utils/currencyFormatters';

const WeeklySalesChart = ({ weeklySalesData, isLoadingBottom }) => {
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

  const rawMaxSales = weeklySalesData.length > 0 ? Math.max(...weeklySalesData.map((d) => d.value)) : 0;
  const step = Math.ceil(rawMaxSales / 4 / 100) * 100 || 100;
  const adjustedMax = step * 4;
  const yAxisLabels = [adjustedMax, step * 3, step * 2, step, 0];

  return (
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
            <span key={val} className="dashboard-chart-ylabel">{formatCurrency(val)}</span>
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
                      {formatCurrency(d.value)}
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
  );
};

export default WeeklySalesChart;
