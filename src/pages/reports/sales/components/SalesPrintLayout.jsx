import React from 'react';
import { DonutChart, PieChart, QuadBadge } from './SalesCharts';
import { formatCurrency } from '../../../../utils/currencyFormatters';

const SalesPrintLayout = ({
  datePreset,
  filterSource,
  filterCategory,
  fromDate,
  toDate,
  summaryCards,
  sourceData,
  summaryData,
  topSellingItems,
  quadCounts,
  detailedProfitability,
  categorySales,
  categoryColors,
  hourlyData,
  maxOrders,
  peakHour,
  totalOrders
}) => {
  return (
    <div className="sales-print-layout">
      <div className="print-sales-header-container">
        <div className="print-sales-title-row">
          <h2>Sales Performance Report</h2>
          <div className="print-sales-meta">
            <span className="print-brand">SEÑORITO CAFÉ</span>
            <span className="print-date">Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="print-period">Report Period: {datePreset}</span>
          </div>
        </div>
        
        <div className="print-sales-filters-box">
           <span><strong>Period:</strong> {datePreset}</span>
           <span><strong>Order Source:</strong> {filterSource}</span>
           <span><strong>Category:</strong> {filterCategory}</span>
           <span><strong>Date Range:</strong> {fromDate && toDate ? `${fromDate} to ${toDate}` : 'Not specified'}</span>
        </div>
      </div>

      <div className="print-sales-summary-cards">
        {summaryCards.map(card => (
          <div key={card.id} className={`print-card print-card--${card.color}`}>
             <h3>{card.value}</h3>
             <p>{card.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      <h3 className="print-section-title">SALES BY ORDER SOURCE</h3>
      <div className="print-source-section">
         <div className="print-chart-wrapper">
           <DonutChart data={sourceData} total={summaryData.netSales} />
         </div>
         <ul className="print-source-list">
            {sourceData.map(s => (
              <li key={s.label}>
                <div className="print-source-left">
                  <span className="print-source-color" style={{backgroundColor: s.color}}></span>
                  <span className="print-source-name">{s.label}</span>
                </div>
                <span className="print-source-value">{formatCurrency(s.value)} ({(summaryData.netSales > 0 ? (s.value / summaryData.netSales) * 100 : 0).toFixed(1)}%)</span>
              </li>
            ))}
         </ul>
      </div>

      <h3 className="print-section-title">TOP SELLING ITEMS</h3>
      <table className="print-sales-table">
        <tbody>
           {topSellingItems.map((item, i) => (
              <tr key={i}>
                <td className="print-rank"><span>{i+1}</span></td>
                <td>
                  <strong>{item.name}</strong><br/>
                  <small>{item.category}</small>
                </td>
                <td style={{textAlign: 'right'}}>
                  <strong>{formatCurrency(item.revenue)}</strong> <small>({item.sold} Sold)</small>
                </td>
              </tr>
           ))}
        </tbody>
      </table>

      {/* --- PAGE BREAK (CSS will handle) --- */}
      <div className="print-page-break"></div>

      <h3 className="print-section-title">MENU PROFITABILITY OVERVIEW</h3>
      <div className="print-profit-cards">
          <div className="print-profit-card p-green">
            <div className="p-icon"><i className="bi bi-star"></i></div>
            <h3>{quadCounts['Top Performer'] || 0}</h3>
            <p className="p-title">Top Performer</p>
            <p className="p-sub">High Profit • High Sales</p>
          </div>
          <div className="print-profit-card p-blue">
            <div className="p-icon"><i className="bi bi-megaphone"></i></div>
            <h3>{quadCounts['Promote More'] || 0}</h3>
            <p className="p-title">Promote More</p>
            <p className="p-sub">High Profit • Low Sales</p>
          </div>
          <div className="print-profit-card p-yellow">
            <div className="p-icon"><i className="bi bi-tag"></i></div>
            <h3>{quadCounts['Improve Pricing'] || 0}</h3>
            <p className="p-title">Improve Pricing</p>
            <p className="p-sub">Low Profit • High Sales</p>
          </div>
          <div className="print-profit-card p-red">
            <div className="p-icon"><i className="bi bi-x-circle"></i></div>
            <h3>{quadCounts['Review or Remove'] || 0}</h3>
            <p className="p-title">Review or Remove</p>
            <p className="p-sub">Low Profit • Low Sales</p>
          </div>
      </div>

      <h3 className="print-section-title">DETAILED PROFITABILITY TABLE</h3>
      <table className="print-sales-table print-profit-table">
        <thead>
          <tr>
            <th style={{textAlign: 'left'}}>ITEM</th>
            <th style={{textAlign: 'left'}}>CATEGORY</th>
            <th style={{textAlign: 'right'}}>PRICE</th>
            <th style={{textAlign: 'right'}}>EST. COST</th>
            <th style={{textAlign: 'right'}}>PROFIT/ITEM</th>
            <th style={{textAlign: 'right'}}>MARGIN %</th>
            <th style={{textAlign: 'center'}}>SOLD</th>
            <th style={{textAlign: 'right'}}>REVENUE</th>
            <th style={{textAlign: 'left'}}>QUADRANT</th>
          </tr>
        </thead>
        <tbody>
           {detailedProfitability.map((row, i) => (
             <tr key={i}>
                <td style={{fontWeight: 600}}>{row.item}</td>
                <td>{row.category}</td>
                <td style={{textAlign: 'right'}}>{formatCurrency(row.price)}</td>
                <td style={{textAlign: 'right'}}>{formatCurrency(row.cost)}</td>
                <td style={{textAlign: 'right'}}>{formatCurrency(row.profitPerItem)}</td>
                <td style={{textAlign: 'right'}}>{row.margin.toFixed(1)}%</td>
                <td style={{textAlign: 'center'}}>{row.qty}</td>
                <td style={{textAlign: 'right'}}>{formatCurrency(row.revenue)}</td>
                <td><QuadBadge quad={row.quad} badge={row.badge} /></td>
             </tr>
           ))}
        </tbody>
      </table>

      <div className="print-bottom-grid">
         <div className="print-bottom-col">
           <h3 className="print-section-title">SALES BY CATEGORY</h3>
           <div className="print-chart-wrapper">
             <PieChart data={categorySales} colors={categoryColors} />
           </div>
           <ul className="print-source-list">
              {categorySales.map((cat, idx) => (
                <li key={cat.cat}>
                  <div className="print-source-left">
                    <span className="print-source-color" style={{backgroundColor: categoryColors[idx % categoryColors.length]}}></span>
                    <span className="print-source-name">{cat.cat}</span>
                  </div>
                  <span className="print-source-value">{cat.units} units • {formatCurrency(cat.rev)} ({cat.pct.toFixed(1)}%)</span>
                </li>
              ))}
           </ul>
         </div>
         
         <div className="print-bottom-col">
           <h3 className="print-section-title">HOURLY SALES PATTERN</h3>
           <div className="print-hourly-chart">
             {hourlyData.map(d => (
               <div key={d.time} className="print-hourly-bar">
                  <div className="p-bar-fill" style={{height: `${maxOrders > 0 ? (d.orders / maxOrders) * 100 : 0}%`, backgroundColor: d.time === peakHour.time ? '#5A2D15' : '#A07156'}}></div>
                  <span className="p-bar-label">{d.time}</span>
               </div>
             ))}
           </div>
           <div className="print-insight-box">
              <i className="bi bi-lightning-fill" style={{color: '#F59E0B'}}></i>
              <span>
                <strong>Peak hours are {peakHour.time} with {peakHour.orders} orders.</strong> A total of {totalOrders} orders were recorded across this period.
              </span>
           </div>
         </div>
      </div>

      <div className="print-footer">
         Señorito Café — Point of Sale & Inventory Management System | Sales Report | Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
};

export default SalesPrintLayout;
