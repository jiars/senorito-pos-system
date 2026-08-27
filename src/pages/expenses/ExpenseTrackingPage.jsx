import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/currencyFormatters';
import { formatDate } from '../../utils/dateFormatters';
import { fetchSalesSummary } from '../../services/reports/salesReportService';

import ManageExpenseCategoriesModal from './Manage Expense Categories/ManageExpenseCategoriesModal';
import AddExpenseModal from './Add Expense/AddExpenseModal';
import EditExpenseModal from './Edit Expense/EditExpenseModal';
import ConfirmDeleteExpenseModal from './Confirm Delete Expense/ConfirmDeleteExpenseModal';

import './expenseTracking.css';

// Premium Color Palette for Categories
const CATEGORY_PALETTE = [
  '#4E342E', // Deep Brown
  '#827717', // Olive Green
  '#BF360C', // Earthy Red
  '#E65100', // Earthy Orange
  '#5D4037', // Dark Brown
  '#8D6E63', // Light Brown
  '#3E2723', // Very Dark Brown
  '#795548', // Standard Brown
  '#6D4C41', // Medium Brown
  '#A1887F', // Soft Brown
];

const ExpenseTrackingPage = () => {
  const { expenses, categories, isLoading, refetchExpenses } = useExpenses();

  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [datePreset, setDatePreset] = useState('All Time');

  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isDeleteExpenseOpen, setIsDeleteExpenseOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const [expensePage, setExpensePage] = useState(1);
  const [wastagePage, setWastagePage] = useState(1);
  const itemsPerPage = 10;

  const [netSales, setNetSales] = useState(0);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const summary = await fetchSalesSummary(fromDate, toDate, 'All Order Sources', 'All Categories');
        setNetSales(summary.netSales || 0);
      } catch (error) {
        console.error("Failed to fetch sales summary for expenses page:", error);
      }
    };
    loadSales();
  }, [fromDate, toDate]);

  // --- 1. Filter Logic ---
  const filteredExpenseRecords = expenses.filter(record => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const categoryName = record.expense_categories?.category_name || 'Uncategorized';
    
    // Clean description to make startsWith more useful (e.g., removing 'Wastage: ' or 'Restock: ' prefix)
    let searchDesc = record.description.toLowerCase();
    if (searchDesc.startsWith('wastage: ')) searchDesc = searchDesc.replace('wastage: ', '');
    if (searchDesc.startsWith('restock: ')) searchDesc = searchDesc.replace('restock: ', '');

    const matchesSearch =
      categoryName.toLowerCase().startsWith(searchLower) ||
      searchDesc.startsWith(searchLower) ||
      (record.vendor && record.vendor.toLowerCase().startsWith(searchLower));

    // Date
    let matchesDate = true;
    if (fromDate || toDate) {
      const recordDate = new Date(record.expense_date);
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        if (recordDate < start) matchesDate = false;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (recordDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  // Reset pagination when filters change
  useEffect(() => {
    setExpensePage(1);
    setWastagePage(1);
  }, [searchTerm, fromDate, toDate]);

  const handlePresetChange = (e) => {
    const preset = e.target.value;
    setDatePreset(preset);

    const now = new Date();
    if (preset === 'All Time') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'This Month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setFromDate(start.toISOString().split('T')[0]);
      setToDate(end.toISOString().split('T')[0]);
    } else if (preset === 'Last Month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      setFromDate(start.toISOString().split('T')[0]);
      setToDate(end.toISOString().split('T')[0]);
    } else if (preset === 'This Year') {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      setFromDate(start.toISOString().split('T')[0]);
      setToDate(end.toISOString().split('T')[0]);
    }
  };

  // --- Pagination Data ---
  const filteredMainExpenseRecords = filteredExpenseRecords.filter(
    record => record.expense_categories?.category_name !== 'Inventory Wastage'
  ).sort((a, b) => {
    const dateDiff = new Date(b.expense_date) - new Date(a.expense_date);
    if (dateDiff === 0) return new Date(b.created_at) - new Date(a.created_at);
    return dateDiff;
  });

  const expenseTotalPages = Math.max(1, Math.ceil(filteredMainExpenseRecords.length / itemsPerPage));
  const paginatedExpenses = filteredMainExpenseRecords.slice((expensePage - 1) * itemsPerPage, expensePage * itemsPerPage);

  const filteredWastageRecords = filteredExpenseRecords.filter(
    record => record.expense_categories?.category_name === 'Inventory Wastage'
  ).sort((a, b) => {
    const dateDiff = new Date(b.expense_date) - new Date(a.expense_date);
    if (dateDiff === 0) return new Date(b.created_at) - new Date(a.created_at);
    return dateDiff;
  });
  
  const wastageTotalPages = Math.max(1, Math.ceil(filteredWastageRecords.length / itemsPerPage));
  const paginatedWastage = filteredWastageRecords.slice((wastagePage - 1) * itemsPerPage, wastagePage * itemsPerPage);

  // --- 2. Compute Totals ---
  const overallExpenses = filteredExpenseRecords.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalInventoryPurchases = filteredExpenseRecords
    .filter(e => e.expense_categories?.category_name === 'Inventory Purchase')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalWastageCost = filteredExpenseRecords
    .filter(e => e.expense_categories?.category_name === 'Inventory Wastage')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const netOperational = netSales - overallExpenses;

  // --- 3. Wastage Summary Logic ---
  let mostWastedItem = '-';
  let mostCommonReason = '-';
  const wastageExpenses = filteredExpenseRecords.filter(e => e.expense_categories?.category_name === 'Inventory Wastage');

  if (wastageExpenses.length > 0) {
    const itemCounts = {};
    const reasonCounts = {};

    wastageExpenses.forEach(w => {
      const descParts = w.description.replace('Wastage: ', '').split(' - ');
      let itemName = descParts[0] || 'Unknown';
      let reason = descParts[1] || 'Unknown';
      
      itemName = itemName.replace(/\[Qty:\s*.*?\]/, '').trim();
      reason = reason.replace(/\[Batch:\s*.*?\]/, '').trim();

      itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    mostWastedItem = Object.keys(itemCounts).reduce((a, b) => itemCounts[a] > itemCounts[b] ? a : b);
    mostCommonReason = Object.keys(reasonCounts).reduce((a, b) => reasonCounts[a] > reasonCounts[b] ? a : b);
  }

  // --- 4. Expense Breakdown by Category ---
  const categoryTotals = {};
  filteredExpenseRecords.forEach(e => {
    const catName = e.expense_categories?.category_name || 'Uncategorized';
    if (!categoryTotals[catName]) categoryTotals[catName] = 0;
    categoryTotals[catName] += Number(e.amount);
  });

  const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    pct: overallExpenses > 0 ? ((amount / overallExpenses) * 100).toFixed(2) : 0
  })).sort((a, b) => b.amount - a.amount);

  // --- Handlers ---
  const handleEditExpense = (record) => {
    const categoryName = record.expense_categories?.category_name;
    if (categoryName === 'Inventory Purchase' || categoryName === 'Inventory Wastage') {
      alert("System-generated inventory expenses cannot be edited here. Please use the Inventory module.");
      return;
    }
    setExpenseToEdit(record);
    setIsEditExpenseOpen(true);
  };

  const handleDeleteExpense = (record) => {
    const categoryName = record.expense_categories?.category_name;
    if (categoryName === 'Inventory Purchase' || categoryName === 'Inventory Wastage') {
      alert("System-generated inventory expenses cannot be deleted here. Please use the Inventory module.");
      return;
    }
    setExpenseToDelete(record);
    setIsDeleteExpenseOpen(true);
  };

  // Create a color map for all categories coming from the database
  const categoryColorMap = {};
  categories.forEach((cat, idx) => {
    categoryColorMap[cat.category_name] = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];
  });

  const getCategoryColor = (categoryName) => {
    return categoryColorMap[categoryName] || '#888888';
  };

  // SVG Chart Calculation
  const radius = 80;
  const strokeWidth = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const chartSegments = categoryBreakdown.map((cat, i) => {
    const proportion = overallExpenses > 0 ? (cat.amount / overallExpenses) : 0;
    const dashArray = proportion * circumference;
    const gap = circumference - dashArray;
    const dashOffset = circumference - offset;
    offset += dashArray;

    return {
      ...cat,
      dashArray,
      gap,
      dashOffset,
      color: getCategoryColor(cat.category)
    };
  });

  if (isLoading) {
    return <div className="expense-page"><p>Loading expense data...</p></div>;
  }

  const handleExportExcel = () => {
    if (filteredExpenseRecords.length === 0) {
      alert("No expenses to export based on current filters.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    // ==========================================
    // 1. Tab 1: Expense Records
    // ==========================================
    let mainExpensesTotal = 0;
    const mainData = filteredMainExpenseRecords.map(record => {
      mainExpensesTotal += Number(record.amount);
      return {
        "Date": formatDate(record.expense_date),
        "Category": record.expense_categories?.category_name || 'Uncategorized',
        "Description": record.description,
        "Vendor/Supplier": record.vendor || '-',
        "Amount (₱)": Number(record.amount),
        "Recorded By": record.profiles ? `${record.profiles.first_name} ${record.profiles.last_name}` : 'Auto/Unknown'
      };
    });

    mainData.push({
      "Date": "TOTAL EXPENSES",
      "Category": "",
      "Description": "",
      "Vendor/Supplier": "",
      "Amount (₱)": mainExpensesTotal,
      "Recorded By": ""
    });

    const mainSheet = XLSX.utils.json_to_sheet(mainData);
    mainSheet['!cols'] = [
      { wch: 15 }, // Date
      { wch: 25 }, // Category
      { wch: 40 }, // Description
      { wch: 20 }, // Vendor
      { wch: 15 }, // Amount
      { wch: 20 }  // Recorded By
    ];
    XLSX.utils.book_append_sheet(workbook, mainSheet, "Expense Records");

    // ==========================================
    // 2. Tab 2: Wastage Records
    // ==========================================
    let wastageTotal = 0;
    const wastageData = filteredWastageRecords.map(record => {
      wastageTotal += Number(record.amount);
      
      let item = record.description;
      let qty = '-';
      let reason = '-';
      let batch = '-';
      
      if (item.startsWith('Wastage: ')) {
        const parts = item.replace('Wastage: ', '').split(' - ');
        item = parts[0];
        if (parts.length > 1) {
          reason = parts.slice(1).join(' - ');
          const batchMatch = reason.match(/\[Batch:\s*(.*?)\]/);
          if (batchMatch) {
            batch = batchMatch[1];
            reason = reason.replace(batchMatch[0], '').trim();
          }
        }
        const qtyMatch = item.match(/\[Qty:\s*(.*?)\]/);
        if (qtyMatch) {
          qty = qtyMatch[1];
          item = item.replace(qtyMatch[0], '').trim();
        }
      }

      return {
        "Date": formatDate(record.expense_date),
        "Item Wasted": item,
        "Quantity": qty,
        "Reason": reason,
        "Batch #": batch,
        "Est. Cost (₱)": Number(record.amount),
        "Recorded By": record.profiles ? `${record.profiles.first_name} ${record.profiles.last_name}` : 'Auto/Unknown'
      };
    });

    if (wastageData.length > 0) {
      wastageData.push({
        "Date": "TOTAL WASTAGE",
        "Item Wasted": "",
        "Quantity": "",
        "Reason": "",
        "Batch #": "",
        "Est. Cost (₱)": wastageTotal,
        "Recorded By": ""
      });
    }

    const wastageSheet = XLSX.utils.json_to_sheet(wastageData.length > 0 ? wastageData : [{ "Message": "No wastage records for this filter." }]);
    wastageSheet['!cols'] = [
      { wch: 15 }, // Date
      { wch: 30 }, // Item
      { wch: 15 }, // Qty
      { wch: 30 }, // Reason
      { wch: 15 }, // Batch
      { wch: 15 }, // Cost
      { wch: 20 }  // Recorded By
    ];
    XLSX.utils.book_append_sheet(workbook, wastageSheet, "Wastage Records");

    // ==========================================
    // 3. Tab 3: Category Summary
    // ==========================================
    const catData = categoryBreakdown.map(cat => ({
      "Category": cat.category,
      "Total Amount (₱)": cat.amount,
      "% Of Total": `${cat.pct}%`
    }));

    catData.push({
      "Category": "OVERALL TOTAL",
      "Total Amount (₱)": overallExpenses,
      "% Of Total": "100.00%"
    });

    const catSheet = XLSX.utils.json_to_sheet(catData);
    catSheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, catSheet, "Category Summary");

    // ==========================================
    // Trigger Download
    // ==========================================
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Expense_Tracking_${dateStr}.xlsx`);
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
          <button className="expense-btn" onClick={handleExportExcel}>
            <i className="bi bi-database-down"></i>
            Export Data
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

        <select 
          className="expense-filter-select"
          value={datePreset}
          onChange={handlePresetChange}
        >
          <option value="All Time">All Time</option>
          <option value="This Month">This Month</option>
          <option value="Last Month">Last Month</option>
          <option value="This Year">This Year</option>
          <option value="Custom">Custom</option>
        </select>

        <div className="expense-date-group">
          <span className="expense-date-label">From</span>
          <input
            type="date"
            className="expense-filter-date"
            title="From Date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setDatePreset('Custom');
            }}
          />
        </div>

        <div className="expense-date-group">
          <span className="expense-date-label">To</span>
          <input
            type="date"
            className="expense-filter-date"
            title="To Date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setDatePreset('Custom');
            }}
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

            <div className={`expense-summary-card ${netOperational >= 0 ? 'expense-summary-card--blue' : 'expense-summary-card--red'}`}>
              <div className="expense-summary-card-icon">
                <i className={`bi ${netOperational >= 0 ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'}`}></i>
              </div>
              <p className="expense-summary-card-value">{formatCurrency(netOperational)}</p>
              <p className="expense-summary-card-label">Net Operational Income</p>
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
                <span>{wastageExpenses.length}</span>
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
                <div style={{ position: 'relative', width: '240px', height: '240px' }}>
                  <svg className="expense-donut-svg" viewBox="0 0 200 200">
                    {chartSegments.map((seg, idx) => (
                      <circle
                        key={idx}
                        className="expense-donut-segment"
                        cx="100" cy="100" r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${seg.dashArray} ${seg.gap}`}
                        strokeDashoffset={seg.dashOffset}
                        onMouseEnter={() => setHoveredSegment(idx)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        style={{ opacity: hoveredSegment !== null && hoveredSegment !== idx ? 0.4 : 1 }}
                      />
                    ))}
                  </svg>
                  {hoveredSegment !== null && categoryBreakdown[hoveredSegment] && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                      pointerEvents: 'none', textAlign: 'center'
                    }}>
                      <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {categoryBreakdown[hoveredSegment].category}
                      </span>
                      <span style={{ fontSize: '1.5rem', color: '#2C1810', fontWeight: 700 }}>
                        {categoryBreakdown[hoveredSegment].pct}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="expense-legend">
                  {categoryBreakdown.map((cat, idx) => (
                    <div 
                      className="expense-legend-item" 
                      key={idx}
                      onMouseEnter={() => setHoveredSegment(idx)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="expense-legend-color" style={{ backgroundColor: getCategoryColor(cat.category) }}></div>
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
                    <span className="expense-cat-chip" style={{ backgroundColor: getCategoryColor(cat.category), color: '#ffffff' }}>{cat.category}</span>
                  </div>
                  <div>
                    <span className="expense-cat-amount">{formatCurrency(cat.amount)}</span>
                    <span className="expense-cat-pct">{cat.pct}%</span>
                  </div>
                </div>
              ))}
              {categoryBreakdown.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No expenses found.</p>}
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
              {paginatedExpenses.map((record) => (
                <tr key={record.id}>
                  <td style={{ minWidth: '130px' }}>
                    <div style={{ fontWeight: 500 }}>{formatDate(record.expense_date)}</div>
                  </td>
                  <td>
                    <span className="expense-cat-chip" style={{ backgroundColor: getCategoryColor(record.expense_categories?.category_name), color: '#ffffff' }}>
                      {record.expense_categories?.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td>{record.description}</td>
                  <td>{record.vendor || '-'}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(record.amount)}</td>
                  <td>{record.profiles ? `${record.profiles.first_name} ${record.profiles.last_name}` : 'Auto/Unknown'}</td>
                  <td>
                    <div className="expense-actions" style={{ justifyContent: 'center' }}>
                      <button
                        className="expense-action-btn expense-action-btn--edit"
                        title="Edit"
                        onClick={() => handleEditExpense(record)}
                        disabled={record.expense_categories?.category_name === 'Inventory Purchase' || record.expense_categories?.category_name === 'Inventory Wastage'}
                        style={{ opacity: (record.expense_categories?.category_name === 'Inventory Purchase' || record.expense_categories?.category_name === 'Inventory Wastage') ? 0.3 : 1 }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="expense-action-btn expense-action-btn--delete"
                        title="Delete"
                        onClick={() => handleDeleteExpense(record)}
                        disabled={record.expense_categories?.category_name === 'Inventory Purchase' || record.expense_categories?.category_name === 'Inventory Wastage'}
                        style={{ opacity: (record.expense_categories?.category_name === 'Inventory Purchase' || record.expense_categories?.category_name === 'Inventory Wastage') ? 0.3 : 1 }}
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

        {/* Expense Pagination */}
        {expenseTotalPages > 0 && (
          <div className="expense-pagination">
            <span>Page {expensePage} of {expenseTotalPages}</span>
            <div className="expense-page-controls">
              <button
                className="expense-page-btn"
                disabled={expensePage === 1}
                onClick={() => setExpensePage(p => Math.max(1, p - 1))}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="expense-page-btn active">{expensePage}</button>
              <button
                className="expense-page-btn"
                disabled={expensePage === expenseTotalPages}
                onClick={() => setExpensePage(p => Math.min(expenseTotalPages, p + 1))}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ───── Wastage Records Table ───── */}
      <div className="expense-table-container" style={{ marginTop: '2rem' }}>
        <h3 className="expense-table-title">Wastage Records</h3>
        <div className="expense-table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th style={{ minWidth: '130px' }}>Date</th>
                <th>Item Wasted</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Batch #</th>
                <th>Est. Cost</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWastage.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>No wastage records found.</td>
                </tr>
              ) : (
                paginatedWastage.map(record => {
                  let item = record.description;
                  let qty = '-';
                  let reason = '-';
                  let batch = '-';
                  
                  if (item.startsWith('Wastage: ')) {
                    const parts = item.replace('Wastage: ', '').split(' - ');
                    item = parts[0];
                    if (parts.length > 1) {
                      reason = parts.slice(1).join(' - ');
                      // Extract batch if present: "Spoiled [Batch: BATCH-123]"
                      const batchMatch = reason.match(/\[Batch:\s*(.*?)\]/);
                      if (batchMatch) {
                        batch = batchMatch[1];
                        reason = reason.replace(batchMatch[0], '').trim();
                      }
                    }

                    // Extract Qty if present: "Arabica Coffee Beans [Qty: 5 kg]"
                    const qtyMatch = item.match(/\[Qty:\s*(.*?)\]/);
                    if (qtyMatch) {
                      qty = qtyMatch[1];
                      item = item.replace(qtyMatch[0], '').trim();
                    }
                  }

                  return (
                    <tr key={record.id}>
                      <td style={{ minWidth: '130px' }}>
                        <div style={{ fontWeight: 500 }}>{formatDate(record.expense_date)}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{item}</td>
                      <td style={{ fontWeight: 600 }}>{qty}</td>
                      <td>{reason}</td>
                      <td style={{ fontWeight: 600 }}>{batch}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(record.amount)}</td>
                      <td>{record.profiles ? `${record.profiles.first_name} ${record.profiles.last_name}` : 'Auto/Unknown'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Wastage Pagination */}
        {wastageTotalPages > 0 && (
          <div className="expense-pagination">
            <span>Page {wastagePage} of {wastageTotalPages}</span>
            <div className="expense-page-controls">
              <button
                className="expense-page-btn"
                disabled={wastagePage === 1}
                onClick={() => setWastagePage(p => Math.max(1, p - 1))}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="expense-page-btn active">{wastagePage}</button>
              <button
                className="expense-page-btn"
                disabled={wastagePage === wastageTotalPages}
                onClick={() => setWastagePage(p => Math.min(wastageTotalPages, p + 1))}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ───── Modals ───── */}
      <ManageExpenseCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        categories={categories}
        expenses={expenses}
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
