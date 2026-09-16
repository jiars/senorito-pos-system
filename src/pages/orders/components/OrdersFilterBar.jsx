import React from 'react';

const OrdersFilterBar = ({
  searchTerm, setSearchTerm,
  fromDate, setFromDate,
  toDate, setToDate,
  paymentMethod, setPaymentMethod,
  orderSource, setOrderSource,
  handleResetFilters
}) => {
  return (
    <div className="orders-filter-bar">
      <div className="orders-search">
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder="Search order #, date, cashier, source..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="orders-date-group">
        <span className="orders-date-label">From</span>
        <input
          type="date"
          className="orders-filter-date"
          title="From Date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </div>

      <div className="orders-date-group">
        <span className="orders-date-label">To</span>
        <input
          type="date"
          className="orders-filter-date"
          title="To Date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      <select
        className="orders-filter-select"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="All">All Payment Method</option>
        <option value="Cash">Cash</option>
        <option value="GCash">GCash</option>
        <option value="External">External</option>
      </select>

      <select
        className="orders-filter-select"
        value={orderSource}
        onChange={(e) => setOrderSource(e.target.value)}
      >
        <option value="All">All Order Source</option>
        <option value="In-Store">In-Store</option>
        <option value="Foodpanda">Foodpanda</option>
        <option value="Grab">Grab</option>
      </select>

      <button className="orders-reset-btn" onClick={handleResetFilters}>
        Reset
      </button>
    </div>
  );
};

export default OrdersFilterBar;
