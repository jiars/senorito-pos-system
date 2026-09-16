import React from 'react';
import { formatDate } from '../../../utils/dateFormatters';
import { formatCurrency } from '../../../utils/currencyFormatters';

const ExpenseRecordsTable = ({ 
  filteredExpenseRecords, 
  paginatedExpenses, 
  getCategoryColor, 
  handleEditExpense, 
  handleArchiveExpense, 
  expenseTotalPages, 
  expensePage, 
  setExpensePage 
}) => {
  return (
    <div className="expense-table-container">
      <h3 className="expense-table-title">Expense Records</h3>
      <div className="expense-table-wrapper">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Vendor/Supplier</th>
              <th>Amount</th>
              <th>Recorded By</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenseRecords.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  No expenses found.
                </td>
              </tr>
            )}
            {paginatedExpenses.map((record) => (
              <tr key={record.id}>
                <td style={{ minWidth: "130px" }}>
                  <div style={{ fontWeight: 500 }}>
                    {formatDate(record.expense_date)}
                  </div>
                </td>
                <td>
                  <span
                    className="expense-cat-chip"
                    style={{
                      backgroundColor: getCategoryColor(
                        record.expense_categories?.category_name,
                      ),
                      color: "#ffffff",
                    }}
                  >
                    {record.expense_categories?.category_name ||
                      "Uncategorized"}
                  </span>
                </td>
                <td>{record.description}</td>
                <td>{record.vendor || "-"}</td>
                <td style={{ fontWeight: 600 }}>
                  {formatCurrency(record.amount)}
                </td>
                <td>
                  {record.profiles
                    ? `${record.profiles.first_name} ${record.profiles.last_name}`
                    : "Auto/Unknown"}
                </td>
                <td>
                  <div
                    className="expense-actions"
                    style={{ justifyContent: "center" }}
                  >
                    <button
                      className="expense-action-btn expense-action-btn--edit"
                      title="Edit"
                      onClick={() => handleEditExpense(record)}
                      disabled={
                        record.expense_categories?.category_name ===
                          "Inventory Purchase"
                      }
                      style={{
                        opacity:
                          record.expense_categories?.category_name ===
                            "Inventory Purchase"
                            ? 0.3
                            : 1,
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="expense-action-btn expense-action-btn--delete"
                      title="Archive"
                      onClick={() => handleArchiveExpense(record)}
                      disabled={
                        record.expense_categories?.category_name ===
                          "Inventory Purchase"
                      }
                      style={{
                        opacity:
                          record.expense_categories?.category_name ===
                            "Inventory Purchase"
                            ? 0.3
                            : 1,
                      }}
                    >
                      <i className="bi bi-archive"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expenseTotalPages > 0 && (
        <div className="expense-pagination">
          <span>
            Page {expensePage} of {expenseTotalPages}
          </span>
          <div className="expense-page-controls">
            <button
              className="expense-page-btn"
              disabled={expensePage === 1}
              onClick={() => setExpensePage((p) => Math.max(1, p - 1))}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button className="expense-page-btn active">{expensePage}</button>
            <button
              className="expense-page-btn"
              disabled={expensePage === expenseTotalPages}
              onClick={() =>
                setExpensePage((p) => Math.min(expenseTotalPages, p + 1))
              }
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseRecordsTable;
