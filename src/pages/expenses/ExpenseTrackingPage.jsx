import React, { useState } from 'react';
import './expenseTracking.css';
import ManageExpenseCategoriesModal from './Manage Expense Categories/ManageExpenseCategoriesModal';
import AddExpenseModal from './Add Expense/AddExpenseModal';
import EditExpenseModal from './Edit Expense/EditExpenseModal';
import ConfirmDeleteExpenseModal from './Confirm Delete Expense/ConfirmDeleteExpenseModal';

/* ═══════════════════════════════════════════════════
   Placeholder Data
═══════════════════════════════════════════════════ */

const summaryCards = [
  { id: 'total', title: 'Total Expenses', value: '₱13,750', pct: '+12%', color: 'brown', icon: 'bi-receipt' },
  { id: 'wastage', title: 'Wastage Cost', value: '₱1,240', pct: '+5%', color: 'red', icon: 'bi-trash' },
  { id: 'inventory', title: 'Inventory Purchases', value: '₱3,750', pct: '-8%', color: 'green', icon: 'bi-box-seam' },
  { id: 'net', title: 'Net Operational', value: '₱14,990', pct: '', color: 'grey', icon: 'bi-percent' }
];

const expenseRecords = [
  { id: 1, date: 'Mar 1, 2026', category: 'Rent', description: 'Monthly Rent', vendor: '-', amount: '₱10,000.00', recordedBy: 'Jane Velarde Mayorga' },
  { id: 2, date: 'Mar 1, 2026', category: 'Inventory Purchase', description: 'Purchase Order', vendor: 'John Rick Mabalot', amount: '₱3,750.00', recordedBy: 'Lyanna Magtuloy' }
];

const wastageRecords = [
  { id: 1, date: 'Mar 1, 2026', item: 'Fresh Milk', quantity: '3 L', reason: 'Expired', cost: '₱420.00', recordedBy: 'Jane Velarde Mayorga' },
  { id: 2, date: 'Mar 1, 2026', item: 'Coffee Beans', quantity: '1 KG', reason: 'Expired', cost: '₱150.00', recordedBy: 'Lyanna Magtuloy' }
];

const ExpenseTrackingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isDeleteExpenseOpen, setIsDeleteExpenseOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setIsEditExpenseOpen(true);
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setIsDeleteExpenseOpen(true);
  };

  const getCategoryClass = (cat) => {
    if (cat === 'Rent') return 'rent';
    if (cat === 'Inventory Purchase') return 'inventory';
    return '';
  };

  return (
    <div className="expense-page">
      {/* ───── Page Header ───── */}
      <div className="expense-page-header">
        <div className="layout-page-heading">
          <h2>Expense Tracking</h2>
          <p>Track and monitor your business expenses.</p>
        </div>

        <div className="expense-header-actions">
          <button 
            className="expense-btn" 
            title="Manage Categories"
            onClick={() => setIsManageCategoriesOpen(true)}
          >
            <i className="bi bi-tags"></i>
            Manage Categories
          </button>
          <button className="expense-btn">
            <i className="bi bi-download"></i>
            Export CSV
          </button>
          <button 
            className="expense-btn expense-btn--primary"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <i className="bi bi-plus-circle"></i>
            Add Expense
          </button>
        </div>
      </div>

      {/* ───── Filter Bar ───── */}
      <div className="expense-filter-bar">
        <div className="expense-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search expense, vendor, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="expense-filter-select">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>

        <select className="expense-filter-select">
          <option>All Categories</option>
          <option>Rent</option>
          <option>Inventory Purchase</option>
        </select>

        <div className="expense-date-group">
          <span className="expense-date-label">From</span>
          <input
            type="date"
            className="expense-filter-date"
            title="From Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="expense-date-group">
          <span className="expense-date-label">To</span>
          <input
            type="date"
            className="expense-filter-date"
            title="To Date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          className="expense-reset-btn"
          onClick={() => {
            setSearchTerm('');
            setFromDate('');
            setToDate('');
          }}
        >
          Reset
        </button>
      </div>

      {/* ───── Main Dashboard Grid ───── */}
      <div className="expense-main-dashboard">
        
        {/* Left Column */}
        <div className="expense-left-col">
          {/* Summary Cards */}
          <div className="expense-summary-cards">
            {summaryCards.map((card) => (
              <div key={card.id} className={`expense-summary-card expense-summary-card--${card.color}`}>
                <div className="expense-summary-card-icon">
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <p className="expense-summary-card-value">{card.value}</p>
                <p className="expense-summary-card-label">{card.title}</p>
                {card.pct && <span className="expense-summary-card-pct">{card.pct}</span>}
              </div>
            ))}
          </div>

          {/* Wastage Summary */}
          <div className="expense-box" style={{ height: '100%' }}>
            <h3 className="expense-box-title">Wastage Summary</h3>
            <ul className="expense-wastage-list">
              <li>
                <strong>Total Wastage Cost:</strong>
                <span>₱1,240.00</span>
              </li>
              <li>
                <strong>Total Wastage Logs:</strong>
                <span>2</span>
              </li>
              <li>
                <strong>Most Wasted Item:</strong>
                <span>Fresh Milk</span>
              </li>
              <li>
                <strong>Most Common Reason:</strong>
                <span>Expired</span>
              </li>
              <li>
                <strong>Highest Loss Category:</strong>
                <span>Ingredient</span>
              </li>
              <li>
                <strong>Total Wasted Quantity:</strong>
                <span>18 L</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="expense-right-col">
          {/* Expense Distribution */}
          <div className="expense-box">
            <h3 className="expense-box-title">Expense Distribution</h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem 0' }}>
              <div className="expense-chart-container">
                <div className="expense-pie-chart"></div>
                <div className="expense-legend">
                  <div className="expense-legend-item">
                    <div className="expense-legend-color" style={{ backgroundColor: '#42a5f5' }}></div>
                    <span>Rent</span>
                  </div>
                  <div className="expense-legend-item">
                    <div className="expense-legend-color" style={{ backgroundColor: '#5D4037' }}></div>
                    <span>Inventory Purchase</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Expense Distribution List box */}
          <div className="expense-box" style={{ height: '100%' }}>
            <div className="expense-distribution-info">
              <p className="expense-dist-total">₱13,750.00</p>
              <p className="expense-dist-label">Total expenses this month</p>
            </div>
            <div style={{ borderBottom: '1px solid #f0e0d8', margin: '0.5rem 0 1rem 0' }}></div>
            <h4 style={{ fontSize: '0.8125rem', color: '#2C1810', textAlign: 'center', margin: '0 0 1rem 0' }}>By Category</h4>
            <div className="expense-category-breakdown">
              <div className="expense-cat-row">
                <div>
                  <span className="expense-cat-chip inventory">Inventory Purchase</span>
                  <span style={{ fontSize: '0.75rem', color: '#6c757d', marginLeft: '0.5rem' }}>(1)</span>
                </div>
                <div>
                  <span className="expense-cat-amount">₱3,750.00</span>
                  <span className="expense-cat-pct">27.27%</span>
                </div>
              </div>
              <div className="expense-cat-row">
                <div>
                  <span className="expense-cat-chip rent">Rent</span>
                  <span style={{ fontSize: '0.75rem', color: '#6c757d', marginLeft: '0.5rem' }}>(1)</span>
                </div>
                <div>
                  <span className="expense-cat-amount">₱10,000.00</span>
                  <span className="expense-cat-pct">72.73%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Expense Records Table ───── */}
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
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenseRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>
                    <span className={`expense-cat-chip ${getCategoryClass(record.category)}`}>
                      {record.category}
                    </span>
                  </td>
                  <td>{record.description}</td>
                  <td>{record.vendor}</td>
                  <td style={{ fontWeight: 600 }}>{record.amount}</td>
                  <td>{record.recordedBy}</td>
                  <td>
                    <div className="expense-actions" style={{ justifyContent: 'center' }}>
                      <button 
                        className="expense-action-btn expense-action-btn--edit" 
                        title="Edit"
                        onClick={() => handleEditExpense(record)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="expense-action-btn expense-action-btn--delete" 
                        title="Delete"
                        onClick={() => handleDeleteExpense(record)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───── Wastage Records Table ───── */}
      <div className="expense-table-container">
        <h3 className="expense-table-title">Wastage Records</h3>
        <div className="expense-table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Cost</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {wastageRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.item}</td>
                  <td>{record.quantity}</td>
                  <td>{record.reason}</td>
                  <td style={{ fontWeight: 600 }}>{record.cost}</td>
                  <td>{record.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───── Modals ───── */}
      <ManageExpenseCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />

      <EditExpenseModal
        isOpen={isEditExpenseOpen}
        onClose={() => setIsEditExpenseOpen(false)}
        expenseData={expenseToEdit}
      />

      <ConfirmDeleteExpenseModal
        isOpen={isDeleteExpenseOpen}
        onClose={() => setIsDeleteExpenseOpen(false)}
        expense={expenseToDelete}
      />

    </div>
  );
};

export default ExpenseTrackingPage;
