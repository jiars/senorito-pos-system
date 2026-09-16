import React from 'react';
import { QuadBadge } from './SalesCharts';
import { formatCurrency } from '../../../../utils/currencyFormatters';

export const MenuProfitabilityHeatmap = ({ detailedProfitability, heatmapActive, setHeatmapActive, maxQty, maxRev, getQuadColorClass }) => {
  return (
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
                {formatCurrency(detailedProfitability[heatmapActive].revenue)}
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
  );
};

export const QuadrantLegend = ({ quadCounts }) => {
  return (
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
  );
};

export const DetailedProfitabilityTable = ({ detailedProfitability, profitabilitySort, setProfitabilitySort }) => {
  return (
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
                  <td>{formatCurrency(row.price)}</td>
                  <td>{formatCurrency(row.cost)}</td>
                  <td><strong>{formatCurrency(row.profitPerItem)}</strong></td>
                  <td>
                    <span className="sales-margin-chip">{row.margin.toFixed(1)}%</span>
                  </td>
                  <td>{row.qty}</td>
                  <td>{formatCurrency(row.revenue)}</td>
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
  );
};
