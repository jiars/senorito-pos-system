import React from 'react';
import { formatCurrency } from '../../../utils/currencyFormatters';

const SummaryCards = ({ metrics, isLoadingTop }) => {
  return (
    <div className="dashboard-summary-cards">
      <div className="dashboard-summary-card dashboard-summary-card--green">
        <div className="dashboard-summary-card-icon">
          <i className="bi bi-bag-check-fill"></i>
        </div>
        <p className="dashboard-summary-card-value">
          {isLoadingTop ? '...' : formatCurrency(metrics.totalSales)}
        </p>
        <p className="dashboard-summary-card-label">Today's Sales ({isLoadingTop ? '0' : metrics.orderCount} orders)</p>
      </div>

      <div className="dashboard-summary-card dashboard-summary-card--yellow">
        <div className="dashboard-summary-card-icon">
          <i className="bi bi-cash-stack"></i>
        </div>
        <p className="dashboard-summary-card-value">
          {isLoadingTop ? '...' : formatCurrency(metrics.totalExpenses)}
        </p>
        <p className="dashboard-summary-card-label">Today's Expenses</p>
      </div>

      <div className="dashboard-summary-card dashboard-summary-card--red">
        <div className="dashboard-summary-card-icon">
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <p className="dashboard-summary-card-value">
          {isLoadingTop ? '...' : metrics.lowStockCount}
        </p>
        <p className="dashboard-summary-card-label">Low Stock Alerts</p>
      </div>
    </div>
  );
};

export default SummaryCards;
