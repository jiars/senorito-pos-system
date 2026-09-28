import React from 'react';

const EditAddonBaseInfo = ({
  addonName,
  setAddonName,
  isAvailable,
  setIsAvailable,
  categories,
  selectedCategories,
  toggleCategory,
  sellingPrice,
  setSellingPrice,
  estCost,
  profit,
  margin,
  errors,
  hasAttemptedSubmit
}) => {
  return (
    <div className="eao-top-grid">
      {/* Left Column */}
      <div>
        <div className="eao-section">
          <label className="eao-label">Add-on Name *</label>
          <input
            type="text"
            className={`eao-input ${hasAttemptedSubmit && errors.addonName ? 'is-invalid' : ''}`}
            placeholder="e.g. Extra Shot"
            value={addonName}
            onChange={(e) => setAddonName(e.target.value)}
          />
          {hasAttemptedSubmit && errors.addonName && <p className="eao-error-text">{errors.addonName}</p>}
        </div>

        {/* Available Toggle */}
        <div className="eao-section" style={{ marginTop: '0.75rem' }}>
          <label className="eao-toggle-container">
            <input
              type="checkbox"
              style={{ display: 'none' }}
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <span className="eao-toggle-switch">
              <span className="eao-toggle-slider"></span>
            </span>
            <span className="eao-toggle-label">Available for sale</span>
          </label>
        </div>

        <div className="eao-section">
          <label className="eao-label">Apply to Categories *</label>
          <div className={`eao-categories-list ${hasAttemptedSubmit && errors.categories ? 'is-invalid-border' : ''}`} style={hasAttemptedSubmit && errors.categories ? { padding: '0.5rem', borderRadius: '6px' } : {}}>
            {categories.map((cat) => (
              <label className="eao-checkbox-label" key={cat.id}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />
                {cat.category_name}
              </label>
            ))}
          </div>
          {hasAttemptedSubmit && errors.categories && <p className="eao-error-text">{errors.categories}</p>}
        </div>
      </div>

      {/* Right Column */}
      <div>
        <div className="eao-section">
          <label className="eao-label">Selling Price *</label>
          <div className={`eao-currency-wrapper ${hasAttemptedSubmit && errors.sellingPrice ? 'is-invalid-border' : ''}`}>
            <span className="eao-currency-symbol">₱</span>
            <input
              type="number"
              className="eao-input"
              placeholder="0.00"
              value={sellingPrice}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || parseFloat(val) >= 0) {
                  setSellingPrice(val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') e.preventDefault();
              }}
              min="0" step="any"
            />
          </div>
          {hasAttemptedSubmit && errors.sellingPrice && <p className="eao-error-text">{errors.sellingPrice}</p>}
        </div>

        <div className="eao-section">
          <label className="eao-label">Est. Cost</label>
          <div className="eao-currency-wrapper">
            <span className="eao-currency-symbol">₱</span>
            <input type="text" className="eao-input" readOnly value={estCost.toFixed(2)} />
          </div>
        </div>

        <div className="eao-section">
          <label className="eao-label">Profit</label>
          <div className="eao-currency-wrapper">
            <span className="eao-currency-symbol">₱</span>
            <input type="text" className="eao-input" readOnly value={profit.toFixed(2)} />
          </div>
        </div>

        <div className="eao-section">
          <label className="eao-label">Margin</label>
          <input type="text" className="eao-input" readOnly value={`${margin.toFixed(2)}%`} />
        </div>
      </div>
    </div>
  );
};

export default EditAddonBaseInfo;
