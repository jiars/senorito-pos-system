import React from 'react';

const AddAddonBaseInfo = ({
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
    <div className="aao-top-grid">
      {/* Left Column */}
      <div>
        <div className="aao-section">
          <label className="aao-label">Add-on Name *</label>
          <input
            type="text"
            className={`aao-input ${hasAttemptedSubmit && errors.addonName ? 'is-invalid' : ''}`}
            placeholder="e.g. Extra Shot"
            value={addonName}
            onChange={(e) => setAddonName(e.target.value)}
          />
          {hasAttemptedSubmit && errors.addonName && <p className="aao-error-text">{errors.addonName}</p>}
        </div>

        {/* Available Toggle */}
        <div className="aao-section" style={{ marginTop: '0.75rem' }}>
          <label className="aao-toggle-container">
            <input
              type="checkbox"
              style={{ display: 'none' }}
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <span className="aao-toggle-switch">
              <span className="aao-toggle-slider"></span>
            </span>
            <span className="aao-toggle-label">Available for sale</span>
          </label>
        </div>

        <div className="aao-section">
          <label className="aao-label">Apply to Categories *</label>
          <div className={`aao-categories-list ${hasAttemptedSubmit && errors.categories ? 'is-invalid-border' : ''}`} style={hasAttemptedSubmit && errors.categories ? { padding: '0.5rem', borderRadius: '6px' } : {}}>
            {categories.map((cat) => (
              <label className="aao-checkbox-label" key={cat.id}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />
                {cat.category_name}
              </label>
            ))}
          </div>
          {hasAttemptedSubmit && errors.categories && <p className="aao-error-text">{errors.categories}</p>}
        </div>
      </div>

      {/* Right Column */}
      <div>
        <div className="aao-section">
          <label className="aao-label">Selling Price *</label>
          <div className={`aao-currency-wrapper ${hasAttemptedSubmit && errors.sellingPrice ? 'is-invalid-border' : ''}`}>
            <span className="aao-currency-symbol">₱</span>
            <input
              type="number"
              className="aao-input"
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
          {hasAttemptedSubmit && errors.sellingPrice && <p className="aao-error-text">{errors.sellingPrice}</p>}
        </div>

        <div className="aao-section">
          <label className="aao-label">Est. Cost</label>
          <div className="aao-currency-wrapper">
            <span className="aao-currency-symbol">₱</span>
            <input type="text" className="aao-input" readOnly value={estCost.toFixed(2)} />
          </div>
        </div>

        <div className="aao-section">
          <label className="aao-label">Profit</label>
          <div className="aao-currency-wrapper">
            <span className="aao-currency-symbol">₱</span>
            <input type="text" className="aao-input" readOnly value={profit.toFixed(2)} />
          </div>
        </div>

        <div className="aao-section">
          <label className="aao-label">Margin</label>
          <input type="text" className="aao-input" readOnly value={`${margin.toFixed(2)}%`} />
        </div>
      </div>
    </div>
  );
};

export default AddAddonBaseInfo;
