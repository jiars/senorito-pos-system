import React from "react";

const ExpenseHeader = ({ onManageCategories, onExport, onAddExpense }) => (
  <div className="expense-page-header">
    <div className="layout-page-heading">
      <h2>Expense Tracking</h2>
      <p>Track and monitor your business expenses.</p>
    </div>

    <div className="expense-header-actions">
      <button className="expense-btn" onClick={onManageCategories}>
        <i className="bi bi-tags" />
        Manage Categories
      </button>
      <button className="expense-btn" onClick={onExport}>
        <i className="bi bi-database-down" />
        Export Data
      </button>
      <button
        className="expense-btn expense-btn--primary"
        onClick={onAddExpense}
      >
        <i className="bi bi-plus-circle" />
        Add Expense
      </button>
    </div>
  </div>
);

export default ExpenseHeader;
