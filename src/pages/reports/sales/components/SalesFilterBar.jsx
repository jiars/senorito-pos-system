import React from 'react';

const SalesFilterBar = ({
  datePreset, handleDatePresetChange,
  filterSource, setFilterSource,
  filterCategory, setFilterCategory,
  categories,
  fromDate, setFromDate,
  toDate, setToDate,
  setDatePreset
}) => {
  return (
    <div className="sales-filter-bar">
      <select className="sales-filter-select" value={datePreset} onChange={(e) => handleDatePresetChange(e.target.value)}>
        <option value="All Time">All Time</option>
        <option value="Today">Today</option>
        <option value="This Week">This Week</option>
        <option value="This Month">This Month</option>
        <option value="Last Month">Last Month</option>
        <option value="This Year">This Year</option>
        <option value="Custom">Custom Range</option>
      </select>

      <select className="sales-filter-select" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
        <option>All Order Sources</option>
        <option>In-Store</option>
        <option>Grab</option>
        <option>FoodPanda</option>
      </select>

      <select className="sales-filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
        <option>All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.category_name}>
            {category.category_name}
          </option>
        ))}
      </select>

      <div className="sales-date-group">
        <span className="sales-date-label">From</span>
        <input
          type="date"
          className="sales-filter-date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setDatePreset('Custom');
          }}
        />
      </div>

      <div className="sales-date-group">
        <span className="sales-date-label">To</span>
        <input
          type="date"
          className="sales-filter-date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setDatePreset('Custom');
          }}
        />
      </div>

      <button 
        className="sales-reset-btn"
        onClick={() => {
          handleDatePresetChange('All Time');
          setFilterSource('All Order Sources');
          setFilterCategory('All Categories');
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default SalesFilterBar;
