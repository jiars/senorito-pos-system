import React from 'react';

const InventoryArchiveFilters = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  expiryFilter,
  setExpiryFilter,
  categories,
  handleReset
}) => {
  return (
    <div className="inventory-filters-bar">
      <div className="inventory-search">
        <i className="bi bi-search"></i>
        <input 
          type="text" 
          placeholder="Search archived item..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <select 
        className="inventory-filter-select"
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        <option>All Categories</option>
        {categories.map((cat, idx) => (
          <option key={idx} value={cat}>{cat}</option>
        ))}
      </select>
      <select 
        className="inventory-filter-select"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option>All Status</option>
        <option>In-stock</option>
        <option>Low Stock</option>
        <option>Out of Stock</option>
      </select>
      <select 
        className="inventory-filter-select"
        value={expiryFilter}
        onChange={(e) => setExpiryFilter(e.target.value)}
      >
        <option>All Expiry Status</option>
        <option>Good</option>
        <option>Expiring Soon</option>
        <option>Expired</option>
        <option>Non-Perishable</option>
        <option>No Stock</option>
      </select>
      <button className="inventory-reset-btn" onClick={handleReset}>Reset</button>
    </div>
  );
};

export default InventoryArchiveFilters;
