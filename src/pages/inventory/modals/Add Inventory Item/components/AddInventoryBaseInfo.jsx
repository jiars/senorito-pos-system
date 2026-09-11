import React from 'react';

const AddInventoryBaseInfo = ({
  itemName,
  setItemName,
  unit,
  setUnit,
  category,
  setCategory,
  units,
  categories,
  hasAttemptedSubmit,
  isNameEmpty,
  isDuplicateName
}) => {
  return (
    <div className="inventory-modal-section">
      <div className="inventory-form-grid inventory-form-grid--3">
        <div className="inventory-form-group">
          <label className="inventory-form-label">Item Name *</label>
          <input
            type="text"
            className={`inventory-form-input ${hasAttemptedSubmit && (isNameEmpty || isDuplicateName) ? 'inventory-form-input--error' : ''}`}
            placeholder="Enter item name"
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
          />
          {hasAttemptedSubmit && isNameEmpty && (
            <span className="inventory-form-error">Item name is required.</span>
          )}
          {hasAttemptedSubmit && !isNameEmpty && isDuplicateName && (
            <span className="inventory-form-error">This item already exists.</span>
          )}
        </div>

        <div className="inventory-form-group">
          <label className="inventory-form-label">Base Unit *</label>
          <select
            className={`inventory-form-select ${hasAttemptedSubmit && unit === '' ? 'inventory-form-select--error' : ''}`}
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
          >
            <option value="" disabled>Select base unit</option>
            {units
              .filter((currentUnit) => {
                const lowerUnit = currentUnit.toLowerCase();
                return lowerUnit !== 'kg' && lowerUnit !== 'bottle';
              })
              .map((currentUnit) => (
                <option key={currentUnit} value={currentUnit}>
                  {currentUnit}
                </option>
              ))}
          </select>
          {hasAttemptedSubmit && unit === '' && (
            <span className="inventory-form-error">Unit is required.</span>
          )}
        </div>

        <div className="inventory-form-group">
          <label className="inventory-form-label">Category *</label>
          <select
            className={`inventory-form-select ${hasAttemptedSubmit && category === '' ? 'inventory-form-select--error' : ''}`}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="" disabled>Select category</option>
            {categories.map((currentCategory) => (
              <option key={currentCategory.id} value={currentCategory.id}>
                {currentCategory.category_name}
              </option>
            ))}
          </select>
          {hasAttemptedSubmit && category === '' && (
            <span className="inventory-form-error">Category is required.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddInventoryBaseInfo;
