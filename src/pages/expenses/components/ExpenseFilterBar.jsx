import React from 'react';

const ExpenseFilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  datePreset, 
  handlePresetChange, 
  fromDate, 
  setFromDate, 
  setDatePreset, 
  toDate, 
  setToDate 
}) => {
  return (
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
            setDatePreset("Custom");
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
            setDatePreset("Custom");
          }}
        />
      </div>

      <button
        className="expense-reset-btn"
        onClick={() => {
          setSearchTerm("");
          setFromDate("");
          setToDate("");
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default ExpenseFilterBar;
