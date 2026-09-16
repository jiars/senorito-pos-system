import React from 'react';
import { formatCurrency } from '../../../utils/currencyFormatters';

const ExpenseSummaryCards = ({ overallExpenses, totalInventoryPurchases, netOperational }) => {
  return (
    <div className="expense-summary-cards">
      <div className={`expense-summary-card expense-summary-card--brown`}>
        <div className="expense-summary-card-icon">
          <i className={`bi bi-receipt`}></i>
        </div>
        <p className="expense-summary-card-value">
          {formatCurrency(overallExpenses)}
        </p>
        <p className="expense-summary-card-label">Total Expenses</p>
      </div>

      <div className={`expense-summary-card expense-summary-card--green`}>
        <div className="expense-summary-card-icon">
          <i className={`bi bi-box-seam`}></i>
        </div>
        <p className="expense-summary-card-value">
          {formatCurrency(totalInventoryPurchases)}
        </p>
        <p className="expense-summary-card-label">Inventory Purchases</p>
      </div>

      <div
        className={`expense-summary-card ${netOperational >= 0 ? "expense-summary-card--blue" : "expense-summary-card--red"}`}
      >
        <div className="expense-summary-card-icon">
          <i
            className={`bi ${netOperational >= 0 ? "bi-graph-up-arrow" : "bi-graph-down-arrow"}`}
          ></i>
        </div>
        <p className="expense-summary-card-value">
          {formatCurrency(netOperational)}
        </p>
        <p className="expense-summary-card-label">
          Net Operational Income
        </p>
      </div>
    </div>
  );
};

export default ExpenseSummaryCards;
