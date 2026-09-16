import React from "react";
import { formatCurrency } from "../../../utils/currencyFormatters";

const ExpenseCategoryBreakdown = ({
  overallExpenses,
  categories,
  getCategoryColor,
}) => (
  <div className="expense-box expense-category-summary-box">
    <div className="expense-distribution-info">
      <p className="expense-dist-total">{formatCurrency(overallExpenses)}</p>
      <p className="expense-dist-label">Total expenses overall</p>
    </div>

    <div className="expense-category-summary-divider" />
    <h4 className="expense-category-summary-title">By Category</h4>

    <div className="expense-category-breakdown">
      {categories.map((category) => (
        <div className="expense-cat-row" key={category.category}>
          <span
            className="expense-cat-chip"
            style={{
              backgroundColor: getCategoryColor(category.category),
              color: "#ffffff",
            }}
          >
            {category.category}
          </span>
          <div>
            <span className="expense-cat-amount">
              {formatCurrency(category.amount)}
            </span>
            <span className="expense-cat-pct">{category.pct}%</span>
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <p className="expense-category-summary-empty">No expenses found.</p>
      )}
    </div>
  </div>
);

export default ExpenseCategoryBreakdown;
