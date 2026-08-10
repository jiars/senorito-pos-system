import React, { useState } from 'react';
import './expenseTracking.css';
import ManageExpenseCategoriesModal from './Manage Expense Categories/ManageExpenseCategoriesModal';
import AddExpenseModal from './Add Expense/AddExpenseModal';
import EditExpenseModal from './Edit Expense/EditExpenseModal';
import ConfirmDeleteExpenseModal from './Confirm Delete Expense/ConfirmDeleteExpenseModal';

import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/currencyFormatters';
import { formatDate } from '../../utils/dateFormatters';

const ExpenseTrackingPage = () => {
  const { expenses, categories, wastage, purchases, isLoading, refetchExpenses } = useExpenses();

  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isDeleteExpenseOpen, setIsDeleteExpenseOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // --- 1. Combine Operational Expenses and Inventory Purchases ---
  const operationalExpensesFormatted = expenses.map(e => ({
    id: `op-${e.id}`,
    originalId: e.id,
    type: 'Operational',
    date: e.expense_date,
    category: e.expense_categories?.category_name || 'Uncategorized',
    description: e.description,
    vendor: e.vendor || '-',
    amount: e.amount,
    recordedBy: e.profiles ? `${e.profiles.first_name} ${e.profiles.last_name}` : 'Unknown',
    rawExpense: e
  }));

  const purchaseExpensesFormatted = purchases.map(p => ({
    id: `inv-${p.id}`,
    originalId: p.id,
    type: 'Inventory',
    date: p.purchased_at,
    category: 'Inventory Purchase',
    description: `Purchase: ${p.inventory_items?.item_name || 'Item'}`,
    vendor: p.supplier || '-',
    amount: p.total_cost,
    recordedBy: p.profiles ? `${p.profiles.first_name} ${p.profiles.last_name}` : 'Unknown',
    rawExpense: p
  }));

  const allExpenseRecords = [...operationalExpensesFormatted, ...purchaseExpensesFormatted]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- 2. Filter Logic ---
  const filteredExpenseRecords = allExpenseRecords.filter(record => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      record.category.toLowerCase().includes(searchLower) ||
      record.description.toLowerCase().includes(searchLower) ||
      record.vendor.toLowerCase().includes(searchLower);
    
    // Date
    let matchesDate = true;
    if (fromDate && toDate) {
      const recordDate = new Date(record.date);
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = recordDate >= start && recordDate <= end;
    }

    return matchesSearch && matchesDate;
  });

  // --- 3. Compute Totals ---
  const totalOperationalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalInventoryPurchases = purchases.reduce((sum, p) => sum + Number(p.total_cost), 0);
  const totalWastageCost = wastage.reduce((sum, w) => sum + Number(w.cost), 0);
  const overallExpenses = totalOperationalExpenses + totalInventoryPurchases;

  // --- 4. Wastage Summary Logic ---
  let mostWastedItem = '-';
  let mostCommonReason = '-';
  
  if (wastage.length > 0) {
    const itemCounts = {};
    const reasonCounts = {};
    
    wastage.forEach(w => {
      const itemName = w.inventory_items?.item_name || 'Unknown';
      itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
      
      const reason = w.reason || 'Unknown';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    mostWastedItem = Object.keys(itemCounts).reduce((a, b) => itemCounts[a] > itemCounts[b] ? a : b);
    mostCommonReason = Object.keys(reasonCounts).reduce((a, b) => reasonCounts[a] > reasonCounts[b] ? a : b);
  }

  // --- 5. Expense Distribution ---
  const categoryTotals = {};
  filteredExpenseRecords.forEach(record => {
    categoryTotals[record.category] = (categoryTotals[record.category] || 0) + Number(record.amount);
  });

  const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    pct: overallExpenses > 0 ? ((amount / overallExpenses) * 100).toFixed(2) : 0
  })).sort((a, b) => b.amount - a.amount);


  // --- Handlers ---
  const handleEditExpense = (record) => {
    if (record.type === 'Inventory') {
      alert("Inventory purchases cannot be edited here. Please use the Inventory module.");
      return;
    }
    setExpenseToEdit(record.rawExpense);
    setIsEditExpenseOpen(true);
  };

  const handleDeleteExpense = (record) => {
    if (record.type === 'Inventory') {
      alert("Inventory purchases cannot be deleted here. Please use the Inventory module.");
      return;
    }
    setExpenseToDelete(record.rawExpense);
    setIsDeleteExpenseOpen(true);
  };

  const getCategoryClass = (cat) => {
    if (cat === 'Rent') return 'rent';
    if (cat === 'Inventory Purchase') return 'inventory';
    return '';
  };

  if (isLoading) {
      return <div className="expense-page"><p>Loading expense data...</p></div>;
  }

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
              <div className={`expense-summary-card expense-summary-card--brown`}>
                <div className="expense-summary-card-icon">
                  <i className={`bi bi-receipt`}></i>
                </div>
                <p className="expense-summary-card-value">{formatCurrency(overallExpenses)}</p>
                <p className="expense-summary-card-label">Total Expenses</p>
              </div>

              <div className={`expense-summary-card expense-summary-card--red`}>
                <div className="expense-summary-card-icon">
                  <i className={`bi bi-trash`}></i>
                </div>
                <p className="expense-summary-card-value">{formatCurrency(totalWastageCost)}</p>
                <p className="expense-summary-card-label">Wastage Cost</p>
              </div>

              <div className={`expense-summary-card expense-summary-card--green`}>
                <div className="expense-summary-card-icon">
                  <i className={`bi bi-box-seam`}></i>
                </div>
                <p className="expense-summary-card-value">{formatCurrency(totalInventoryPurchases)}</p>
                <p className="expense-summary-card-label">Inventory Purchases</p>
              </div>

              <div className={`expense-summary-card expense-summary-card--grey`}>
                <div className="expense-summary-card-icon">
                  <i className={`bi bi-percent`}></i>
                </div>
                <p className="expense-summary-card-value">{formatCurrency(overallExpenses)}</p>
                <p className="expense-summary-card-label">Net Operational (No Sales Yet)</p>
              </div>
          </div>

          {/* Wastage Summary */}
          <div className="expense-box" style={{ height: '100%' }}>
            <h3 className="expense-box-title">Wastage Summary</h3>
            <ul className="expense-wastage-list">
              <li>
                <strong>Total Wastage Cost:</strong>
                <span>{formatCurrency(totalWastageCost)}</span>
              </li>
              <li>
                <strong>Total Wastage Logs:</strong>
                <span>{wastage.length}</span>
              </li>
              <li>
                <strong>Most Wasted Item:</strong>
                <span>{mostWastedItem}</span>
              </li>
              <li>
                <strong>Most Common Reason:</strong>
                <span>{mostCommonReason}</span>
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
                <div className="expense-pie-chart" style={{
                    // Fallback visual
                    background: 'conic-gradient(#5D4037 0% 50%, #8D6E63 50% 100%)'
                }}></div>
                <div className="expense-legend">
                  {categoryBreakdown.slice(0,3).map((cat, idx) => (
                      <div className="expense-legend-item" key={idx}>
                        <div className="expense-legend-color" style={{ backgroundColor: idx === 0 ? '#5D4037' : '#8D6E63' }}></div>
                        <span>{cat.category}</span>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Expense Distribution List box */}
          <div className="expense-box" style={{ height: '100%' }}>
            <div className="expense-distribution-info">
              <p className="expense-dist-total">{formatCurrency(overallExpenses)}</p>
              <p className="expense-dist-label">Total expenses overall</p>
            </div>
            <div style={{ borderBottom: '1px solid #f0e0d8', margin: '0.5rem 0 1rem 0' }}></div>
            <h4 style={{ fontSize: '0.8125rem', color: '#2C1810', textAlign: 'center', margin: '0 0 1rem 0' }}>By Category</h4>
            <div className="expense-category-breakdown">
              {categoryBreakdown.map((cat, idx) => (
                  <div className="expense-cat-row" key={idx}>
                    <div>
                      <span className={`expense-cat-chip ${getCategoryClass(cat.category)}`}>{cat.category}</span>
                    </div>
                    <div>
                      <span className="expense-cat-amount">{formatCurrency(cat.amount)}</span>
                      <span className="expense-cat-pct">{cat.pct}%</span>
                    </div>
                  </div>
              ))}
              {categoryBreakdown.length === 0 && <p style={{textAlign: 'center', color: '#888'}}>No expenses found.</p>}
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
              {filteredExpenseRecords.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>No expenses found.</td>
                </tr>
              )}
              {filteredExpenseRecords.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.date)}</td>
                  <td>
                    <span className={`expense-cat-chip ${getCategoryClass(record.category)}`}>
                      {record.category}
                    </span>
                  </td>
                  <td>{record.description}</td>
                  <td>{record.vendor}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(record.amount)}</td>
                  <td>{record.recordedBy}</td>
                  <td>
                    <div className="expense-actions" style={{ justifyContent: 'center' }}>
                      <button 
                        className="expense-action-btn expense-action-btn--edit" 
                        title="Edit"
                        onClick={() => handleEditExpense(record)}
                        disabled={record.type === 'Inventory'}
                        style={{ opacity: record.type === 'Inventory' ? 0.3 : 1 }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="expense-action-btn expense-action-btn--delete" 
                        title="Delete"
                        onClick={() => handleDeleteExpense(record)}
                        disabled={record.type === 'Inventory'}
                        style={{ opacity: record.type === 'Inventory' ? 0.3 : 1 }}
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
        <h3 className="expense-table-title">Wastage Records (From Inventory)</h3>
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
              {wastage.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>No wastage records found.</td>
                  </tr>
              )}
              {wastage.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.created_at)}</td>
                  <td>{record.inventory_items?.item_name}</td>
                  <td>{record.quantity}</td>
                  <td>{record.reason}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(record.cost)}</td>
                  <td>{record.profiles ? `${record.profiles.first_name} ${record.profiles.last_name}` : 'Auto/Unknown'}</td>
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
        categories={categories}
        refetch={refetchExpenses}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        categories={categories}
        refetch={refetchExpenses}
      />

      <EditExpenseModal
        isOpen={isEditExpenseOpen}
        onClose={() => setIsEditExpenseOpen(false)}
        expenseData={expenseToEdit}
        categories={categories}
        refetch={refetchExpenses}
      />

      <ConfirmDeleteExpenseModal
        isOpen={isDeleteExpenseOpen}
        onClose={() => setIsDeleteExpenseOpen(false)}
        expense={expenseToDelete}
        refetch={refetchExpenses}
      />

    </div>
  );
};

export default ExpenseTrackingPage;
