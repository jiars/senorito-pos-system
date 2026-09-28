import { useState } from 'react';
import { formatCurrency } from '../../../../utils/currencyFormatters';

export const DonutChart = ({ data, total }) => {
  const [hovered, setHovered] = useState(null);
  const radius = 80;
  const strokeWidth = 30;
  const circumference = 2 * Math.PI * radius;
  const segments = data
    .filter((item) => item.pct > 0)
    .reduce(
      (result, item) => {
        const dashArray = (item.pct / 100) * circumference;

        return {
          offset: result.offset + dashArray,
          segments: [
            ...result.segments,
            { ...item, dashArray, dashOffset: -result.offset },
          ],
        };
      },
      { offset: 0, segments: [] },
    ).segments;

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
            : formatCurrency(total)}
        </span>
        <span className="donut-center-label">
          {hovered !== null ? segments[hovered].label : 'Total'}
        </span>
      </div>
    </div>
  );
};

export const PieChart = ({ data, colors }) => {
  const [hovered, setHovered] = useState(null);
  const radius = 50;
  const strokeWidth = 100;
  const circumference = 2 * Math.PI * radius;
  const totalPct = data.reduce((sum, d) => sum + d.pct, 0);
  const segments = data.reduce(
    (result, item, index) => {
      const dashArray =
        totalPct > 0 ? (item.pct / totalPct) * circumference : 0;

      return {
        offset: result.offset + dashArray,
        segments: [
          ...result.segments,
          {
            ...item,
            dashArray,
            dashOffset: -result.offset,
            color: colors[index % colors.length],
          },
        ],
      };
    },
    { offset: 0, segments: [] },
  ).segments;

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
            {formatCurrency(segments[hovered].rev)} ({segments[hovered].pct.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  );
};

export const QuadBadge = ({ quad, badge }) => {
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
