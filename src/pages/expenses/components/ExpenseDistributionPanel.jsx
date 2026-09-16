import React from 'react';
import { formatCurrency } from '../../../utils/currencyFormatters';

const ExpenseDistributionPanel = ({ chartSegments, overallExpenses, categoryBreakdown, getCategoryColor, hoveredSegment, setHoveredSegment, radius, strokeWidth }) => {
  return (
    <div className="expense-box">
      <h3 className="expense-box-title">Expense Distribution</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem 0",
        }}
      >
        <div className="expense-chart-container">
          <div
            style={{
              position: "relative",
              width: "240px",
              height: "240px",
            }}
          >
            <svg className="expense-donut-svg" viewBox="0 0 200 200">
              {chartSegments.map((seg, idx) => (
                <circle
                  key={idx}
                  className="expense-donut-segment"
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${seg.dashArray} ${seg.gap}`}
                  strokeDashoffset={seg.dashOffset}
                  onMouseEnter={() => setHoveredSegment(idx)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{
                    opacity:
                      hoveredSegment !== null && hoveredSegment !== idx
                        ? 0.4
                        : 1,
                  }}
                />
              ))}
            </svg>
            {hoveredSegment !== null &&
              categoryBreakdown[hoveredSegment] && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    pointerEvents: "none",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "#6c757d",
                      fontWeight: 600,
                      maxWidth: "120px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {categoryBreakdown[hoveredSegment].category}
                  </span>
                  <span
                    style={{
                      fontSize: "1.5rem",
                      color: "#2C1810",
                      fontWeight: 700,
                    }}
                  >
                    {categoryBreakdown[hoveredSegment].pct}%
                  </span>
                </div>
              )}
          </div>
          <div className="expense-legend">
            {categoryBreakdown.map((cat, idx) => (
              <div
                className="expense-legend-item"
                key={idx}
                onMouseEnter={() => setHoveredSegment(idx)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="expense-legend-color"
                  style={{
                    backgroundColor: getCategoryColor(cat.category),
                  }}
                ></div>
                <span>{cat.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDistributionPanel;
