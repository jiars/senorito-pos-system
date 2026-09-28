import { formatCurrency } from "../../../../utils/currencyFormatters";

const ArchiveExpenseSummary = ({ expense }) => (
  <div className="cde-stats-grid">
    <div className="cde-stat-card">
      <div className="cde-stat-icon">
        <i className="bi bi-tag-fill" />
      </div>
      <div className="cde-stat-details">
        <span className="cde-stat-label">Category</span>
        <span className="cde-stat-value">
          {expense.expense_categories?.category_name || "N/A"}
        </span>
      </div>
    </div>

    <div className="cde-stat-card">
      <div className="cde-stat-icon cde-stat-icon--alt">
        <i className="bi bi-cash-stack" />
      </div>
      <div className="cde-stat-details">
        <span className="cde-stat-label">Amount</span>
        <span className="cde-stat-value">{formatCurrency(expense.amount)}</span>
      </div>
    </div>
  </div>
);

export default ArchiveExpenseSummary;
