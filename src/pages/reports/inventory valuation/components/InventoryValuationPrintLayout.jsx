import { createPortal } from "react-dom";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { formatDate } from "@/utils/shared/formatters/dateFormatters";

import "./inventory-valuation-print-layout.css";

const InventoryValuationPrintLayout = ({
  items,
  categorySummary,
  searchTerm,
  category,
  sort,
  filteredTotal,
}) => {
  const generatedDate = formatDate(new Date());

  return createPortal(
    <div className="val-print-layout">
      <style media="print">
        {"@page { size: letter portrait; margin: 0; }"}
      </style>

      <header className="print-val-header-container">
        <div className="print-val-brand-header">
          <p className="print-val-brand-name">Señorito Café</p>
          <img src="/smoke.png" alt="" width="100" height="100" aria-hidden="true" />
        </div>
        <p className="print-val-generated">Generated: {generatedDate}</p>
        <dl className="print-val-filters-box">
          <div><dt>Search</dt><dd>{searchTerm || "None"}</dd></div>
          <div><dt>Category</dt><dd>{category}</dd></div>
          <div><dt>Sort By</dt><dd>{sort.replace("Sort: ", "")}</dd></div>
        </dl>
      </header>

      <section className="print-val-section print-val-section--compact">
        <h2>Inventory Valuation Summary</h2>
        <table className="val-print-table print-val-summary-table" aria-label="Inventory valuation summary">
          <thead>
            <tr>
              <th scope="col">Total Items</th>
              <th scope="col">Total Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{items.length}</td>
              <td>{formatCurrency(filteredTotal)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="print-val-section">
        <h3>Category Summary</h3>
        <table className="val-print-table" aria-label="Inventory value by category">
          <colgroup>
            <col /><col className="print-val-col-value" /><col className="print-val-col-percent" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col" className="print-align-right">Value</th>
              <th scope="col" className="print-align-right">% of Overall Value</th>
            </tr>
          </thead>
          <tbody>
            {categorySummary.length === 0 ? (
              <tr>
                <td colSpan={3} className="print-empty-cell">No category data available.</td>
              </tr>
            ) : (
              categorySummary.map((summary) => (
                <tr key={summary.category}>
                  <td>{summary.category}</td>
                  <td className="print-align-right">{formatCurrency(summary.value)}</td>
                  <td className="print-align-right">{summary.pct}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <p className="print-val-note">
          Category totals follow the category filter. Search applies to the detailed items below.
        </p>
      </section>

      <section className="print-val-section">
        <h3>Detailed Items List</h3>
        <table className="val-print-table" aria-label="Detailed inventory valuation">
          <colgroup>
            <col className="print-val-col-item" /><col className="print-val-col-category" />
            <col className="print-val-col-stock" /><col className="print-val-col-unit" />
            <col className="print-val-col-cost" /><col className="print-val-col-value" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Item</th><th scope="col">Category</th>
              <th scope="col" className="print-align-right">Stock</th><th scope="col">Unit</th>
              <th scope="col" className="print-align-right">Cost/Unit</th>
              <th scope="col" className="print-align-right">Total Value</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="print-empty-cell">No items for the selected filters.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.item}</td><td>{item.category}</td>
                  <td className="print-align-right">{item.stock}</td><td>{item.unit}</td>
                  <td className="print-align-right">{formatCurrency(item.cost)}</td>
                  <td className="print-align-right">{formatCurrency(item.value)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={5} className="print-align-right">Total Value</th>
              <td className="print-align-right">{formatCurrency(filteredTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <footer className="print-val-footer">
        Señorito Café | POS &amp; Inventory Management System | Inventory Valuation Report
      </footer>
    </div>,
    document.body,
  );
};

export default InventoryValuationPrintLayout;
