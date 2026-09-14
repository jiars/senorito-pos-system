const InventoryValuationFilters = ({
  searchTerm,
  category,
  sort,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onReset,
}) => (
  <div className="val-filter-bar">
    <div className="val-search">
      <i className="bi bi-search"></i>
      <input
        type="text"
        placeholder="Search item name..."
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>

    <select
      className="val-select"
      value={category}
      onChange={(event) => onCategoryChange(event.target.value)}
    >
      <option>All Categories</option>
      {categories.map((categoryName) => (
        <option key={categoryName}>{categoryName}</option>
      ))}
    </select>

    <select
      className="val-select"
      value={sort}
      onChange={(event) => onSortChange(event.target.value)}
    >
      <option>Sort: Highest Value First</option>
      <option>Sort: Lowest Value First</option>
      <option>Sort: A-Z</option>
    </select>

    <button className="val-reset-btn" onClick={onReset}>Reset</button>
  </div>
);

export default InventoryValuationFilters;
