import { useState } from 'react';
import {
  createValuationChartSegments,
  getValuationCategoryColor,
} from '../../../../utils/inventory/inventoryValuationUtils';

const RADIUS = 80;
const STROKE_WIDTH = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatCurrency = (value) => {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const InventoryValuationOverview = ({ categorySummary, totalValuation }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const chartSegments = createValuationChartSegments(
    categorySummary,
    totalValuation,
    CIRCUMFERENCE,
  );

  return (
    <div className="val-top-grid">
      <div className="val-panel">
        <div className="val-panel-header">
          <i className="bi bi-pie-chart"></i> Value By Category
        </div>
        <div className="val-panel-body val-chart-container">
          <div style={{ position: 'relative', width: '240px', height: '240px' }}>
            <svg className="val-donut-svg" viewBox="0 0 200 200">
              {chartSegments.map((segment, index) => (
                <circle
                  key={segment.category}
                  className="val-donut-segment"
                  cx="100"
                  cy="100"
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={`${segment.dashArray} ${segment.gap}`}
                  strokeDashoffset={segment.dashOffset}
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{
                    opacity:
                      hoveredSegment !== null && hoveredSegment !== index
                        ? 0.4
                        : 1,
                  }}
                />
              ))}
            </svg>

            {hoveredSegment !== null && categorySummary[hoveredSegment] && (
              <div className="val-chart-hover">
                <span className="val-chart-hover-name">
                  {categorySummary[hoveredSegment].category}
                </span>
                <span className="val-chart-hover-percent">
                  {categorySummary[hoveredSegment].pct}%
                </span>
              </div>
            )}
          </div>

          <div className="val-legend">
            {categorySummary.map((category, index) => (
              <div
                className="val-legend-item"
                key={category.category}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div
                  className="val-legend-color"
                  style={{
                    backgroundColor: getValuationCategoryColor(
                      category.category,
                      index,
                    ),
                  }}
                ></div>
                <span>{category.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="val-panel">
        <div className="val-panel-header">
          <i className="bi bi-list-task"></i> Category Summary
        </div>
        <div className="val-panel-body val-category-table-body">
          <table className="val-cat-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Value</th>
                <th>% Of Total</th>
              </tr>
            </thead>
            <tbody>
              {categorySummary.length === 0 ? (
                <tr>
                  <td colSpan="3" className="val-empty-cell">No data</td>
                </tr>
              ) : (
                categorySummary.map((category) => (
                  <tr key={category.category}>
                    <td>{category.category}</td>
                    <td>₱{formatCurrency(category.value)}</td>
                    <td>{category.pct}%</td>
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

export default InventoryValuationOverview;
