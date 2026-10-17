import { createPortal } from 'react-dom';
import { formatCurrency } from '@/utils/shared/formatters/currencyFormatters';
import { formatDate } from '@/utils/shared/formatters/dateFormatters';

import './sales-print-layout.css';

const profitabilityGroups = [
  { name: 'Top Performer', meaning: 'High Profit · High Sales' },
  { name: 'Promote More', meaning: 'High Profit · Low Sales' },
  { name: 'Improve Pricing', meaning: 'Low Profit · High Sales' },
  { name: 'Review or Remove', meaning: 'Low Profit · Low Sales' },
];

const EmptyPrintRow = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="print-sales-empty">
      No records for the selected filters.
    </td>
  </tr>
);

const SalesPrintLayout = ({
  datePreset,
  filterSource,
  filterCategory,
  fromDate,
  toDate,
  sourceData,
  summaryData,
  topSellingItems,
  quadCounts,
  detailedProfitability,
  categorySales,
  hourlyData,
  peakHour,
  totalOrders,
}) => {
  const generatedDate = formatDate(new Date());
  const categoryRevenue = categorySales.reduce((total, category) => total + category.rev, 0);
  const categoryUnits = categorySales.reduce((total, category) => total + category.units, 0);

  // Print outside the application shell, like the QR and receipt print copies.
  return createPortal(
    <div className="sales-print-layout">
      <style media="print">
        {'@page { size: letter portrait; margin: 0; }'}
      </style>
      <header className="print-sales-header-container">
        <div className="print-sales-brand-header">
          <div className="print-sales-brand-copy">
            <p className="print-sales-brand-name">SEÑORITO CAFÉ</p>
          </div>
          <div className="print-sales-brand-mark" aria-hidden="true">
            <img src="/smoke.png" alt="" width="100" height="100" />
          </div>
        </div>

        <p className="print-sales-generated">Generated: {generatedDate}</p>

        <dl className="print-sales-filters-box">
          <div>
            <dt>Period</dt>
            <dd>{datePreset}</dd>
          </div>
          <div>
            <dt>Order Source</dt>
            <dd>{filterSource}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{filterCategory}</dd>
          </div>
          <div>
            <dt>Date Range</dt>
            <dd>{fromDate && toDate ? `${formatDate(fromDate)} to ${formatDate(toDate)}` : 'Not specified'}</dd>
          </div>
        </dl>
      </header>

      <section className="print-sales-section print-sales-section--compact">
        <h3 className="print-section-title">Summary</h3>
        <table className="print-sales-table print-sales-summary-table" aria-label="Sales summary">
          <thead>
            <tr>
              <th scope="col">Total Orders</th>
              <th scope="col">Gross Sales</th>
              <th scope="col">Net Sales</th>
              <th scope="col">Avg Order Value</th>
              <th scope="col">Total Wastage Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{summaryData.totalOrders}</td>
              <td>{formatCurrency(summaryData.grossSales)}</td>
              <td>{formatCurrency(summaryData.netSales)}</td>
              <td>{formatCurrency(summaryData.avgOrderValue)}</td>
              <td>{formatCurrency(summaryData.totalWastageCost)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="print-sales-section print-sales-section--compact">
        <h3 className="print-section-title">Sales by Order Source</h3>
        <table className="print-sales-table" aria-label="Sales by order source">
          <colgroup><col /><col className="print-sales-col-amount" /><col className="print-sales-col-percent" /></colgroup>
          <thead>
            <tr>
              <th scope="col">Order Source</th>
              <th scope="col" className="print-sales-number">Revenue</th>
              <th scope="col" className="print-sales-number">% Net Sales</th>
            </tr>
          </thead>
          <tbody>
            {sourceData.length === 0 && <EmptyPrintRow colSpan={3} />}
            {sourceData.map((source) => (
              <tr key={source.label}>
                <td>{source.label}</td>
                <td className="print-sales-number">{formatCurrency(source.value)}</td>
                <td className="print-sales-number">{source.pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td className="print-sales-number">{formatCurrency(summaryData.netSales)}</td>
              <td className="print-sales-number">{summaryData.netSales > 0 ? '100.0%' : '0.0%'}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="print-sales-section print-sales-section--compact">
        <h3 className="print-section-title">Top Selling Items</h3>
        <table className="print-sales-table" aria-label="Top selling items">
          <colgroup>
            <col className="print-sales-col-rank" /><col /><col className="print-sales-col-category" />
            <col className="print-sales-col-units" /><col className="print-sales-col-amount" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Rank</th><th scope="col">Item</th><th scope="col">Category</th>
              <th scope="col" className="print-sales-number">Units Sold</th>
              <th scope="col" className="print-sales-number">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topSellingItems.length === 0 && <EmptyPrintRow colSpan={5} />}
            {topSellingItems.map((item, index) => (
              <tr key={item.id}>
                <td className="print-sales-number">{index + 1}</td>
                <td>{item.name}</td><td>{item.category}</td>
                <td className="print-sales-number">{item.sold}</td>
                <td className="print-sales-number">{formatCurrency(item.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-sales-section print-sales-section--new-page print-sales-section--compact">
        <h3 className="print-section-title">Menu Profitability Overview</h3>
        <table className="print-sales-table" aria-label="Menu profitability overview">
          <colgroup><col className="print-sales-col-quadrant" /><col /><col className="print-sales-col-count" /></colgroup>
          <thead>
            <tr>
              <th scope="col">Quadrant</th><th scope="col">Meaning</th>
              <th scope="col" className="print-sales-number">No. of Items</th>
            </tr>
          </thead>
          <tbody>
            {profitabilityGroups.map((group) => (
              <tr key={group.name}>
                <td>{group.name}</td><td>{group.meaning}</td>
                <td className="print-sales-number">{quadCounts[group.name] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-sales-section">
        <h3 className="print-section-title">Detailed Profitability Table</h3>
        <table className="print-sales-table print-sales-profit-table" aria-label="Detailed menu profitability">
          <colgroup>
            <col className="print-sales-profit-item" /><col className="print-sales-profit-category" />
            <col className="print-sales-profit-money" /><col className="print-sales-profit-money" />
            <col className="print-sales-profit-money" /><col className="print-sales-profit-margin" />
            <col className="print-sales-profit-sold" /><col className="print-sales-profit-revenue" />
            <col className="print-sales-profit-quadrant" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Item</th><th scope="col">Category</th>
              <th scope="col" className="print-sales-number">Price</th>
              <th scope="col" className="print-sales-number">Cost</th>
              <th scope="col" className="print-sales-number">Profit</th>
              <th scope="col" className="print-sales-number">Margin</th>
              <th scope="col" className="print-sales-number">Sold</th>
              <th scope="col" className="print-sales-number">Revenue</th>
              <th scope="col">Quadrant</th>
            </tr>
          </thead>
          <tbody>
            {detailedProfitability.length === 0 && <EmptyPrintRow colSpan={9} />}
            {detailedProfitability.map((row, index) => (
              <tr key={index}>
                <td>{row.item}</td><td>{row.category}</td>
                <td className="print-sales-number">{formatCurrency(row.price)}</td>
                <td className="print-sales-number">{formatCurrency(row.cost)}</td>
                <td className="print-sales-number">{formatCurrency(row.profitPerItem)}</td>
                <td className="print-sales-number">{row.margin.toFixed(1)}%</td>
                <td className="print-sales-number">{row.qty}</td>
                <td className="print-sales-number">{formatCurrency(row.revenue)}</td>
                <td>{row.quad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="print-sales-section print-sales-section--compact">
        <h3 className="print-section-title">Sales by Category</h3>
        <table className="print-sales-table" aria-label="Sales by category">
          <colgroup><col /><col className="print-sales-col-units" /><col className="print-sales-col-amount" /><col className="print-sales-col-percent" /></colgroup>
          <thead>
            <tr>
              <th scope="col">Category</th><th scope="col" className="print-sales-number">Units</th>
              <th scope="col" className="print-sales-number">Revenue</th>
              <th scope="col" className="print-sales-number">%</th>
            </tr>
          </thead>
          <tbody>
            {categorySales.length === 0 && <EmptyPrintRow colSpan={4} />}
            {categorySales.map((category) => (
              <tr key={category.cat}>
                <td>{category.cat}</td><td className="print-sales-number">{category.units}</td>
                <td className="print-sales-number">{formatCurrency(category.rev)}</td>
                <td className="print-sales-number">{category.pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th><td className="print-sales-number">{categoryUnits}</td>
              <td className="print-sales-number">{formatCurrency(categoryRevenue)}</td>
              <td className="print-sales-number">{categoryRevenue > 0 ? '100.0%' : '0.0%'}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="print-sales-section print-sales-section--compact">
        <h3 className="print-section-title">Hourly Sales</h3>
        <table className="print-sales-table" aria-label="Orders by two-hour time slot">
          <colgroup><col /><col className="print-sales-col-count" /><col className="print-sales-col-percent" /></colgroup>
          <thead>
            <tr>
              <th scope="col">Time Slot</th><th scope="col" className="print-sales-number">Orders</th>
              <th scope="col" className="print-sales-number">%</th>
            </tr>
          </thead>
          <tbody>
            {hourlyData.length === 0 && <EmptyPrintRow colSpan={3} />}
            {hourlyData.map((slot) => (
              <tr key={slot.time}>
                <td>{slot.time}</td><td className="print-sales-number">{slot.orders}</td>
                <td className="print-sales-number">{totalOrders > 0 ? ((slot.orders / totalOrders) * 100).toFixed(1) : '0.0'}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th><td className="print-sales-number">{totalOrders}</td>
              <td className="print-sales-number">{totalOrders > 0 ? '100.0%' : '0.0%'}</td>
            </tr>
          </tfoot>
        </table>
        <p className="print-sales-insight">
          {totalOrders > 0
            ? `Peak hours are ${peakHour.time} with ${peakHour.orders} orders. A total of ${totalOrders} orders were recorded across these time slots.`
            : 'No orders were recorded across these time slots for the selected period.'}
        </p>
      </section>

      <footer className="print-footer">
        Señorito Café | POS &amp; Inventory Management System | Sales Report
      </footer>
    </div>,
    document.body,
  );
};

export default SalesPrintLayout;
