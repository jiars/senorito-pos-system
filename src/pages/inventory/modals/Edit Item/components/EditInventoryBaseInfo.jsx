import React from 'react';

const EditInventoryBaseInfo = ({
  name,
  unit,
  category,
  setCategory,
  cost,
  setCost,
  reorderLevel,
  setReorderLevel,
  supplier,
  setSupplier,
  categories,
  hasBatches,
  hasAttemptedSubmit,
  errors
}) => (
  <div className="edit-modal-form-grid">
    <div className="edit-modal-group">
      <label className="edit-modal-label">Name *</label>
      <input
        type="text"
        className={`edit-modal-input ${hasAttemptedSubmit && errors.name ? 'is-invalid' : ''}`}
        value={name}
        disabled
        title="Name cannot be changed after creation"
      />
      {hasAttemptedSubmit && errors.name && (
        <p className="edit-modal-error-msg">{errors.name}</p>
      )}
    </div>

    <div className="edit-modal-group">
      <label className="edit-modal-label">Unit *</label>
      <input
        type="text"
        className={`edit-modal-input ${hasAttemptedSubmit && errors.unit ? 'is-invalid' : ''}`}
        value={unit}
        disabled
        title="Base unit cannot be changed after creation"
      />
      {hasAttemptedSubmit && errors.unit && (
        <p className="edit-modal-error-msg">{errors.unit}</p>
      )}
    </div>

    <div className="edit-modal-group">
      <label className="edit-modal-label">Category *</label>
      <select
        className={`edit-modal-select ${hasAttemptedSubmit && errors.category ? 'is-invalid' : ''}`}
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
      {hasAttemptedSubmit && errors.category && (
        <p className="edit-modal-error-msg">{errors.category}</p>
      )}
    </div>

    <div className="edit-modal-group">
      <label className="edit-modal-label">Cost/Unit (₱) *</label>
      <input
        type="number"
        className={`edit-modal-input ${hasAttemptedSubmit && errors.cost ? 'is-invalid' : ''}`}
        value={cost}
        onChange={(event) => setCost(event.target.value)}
        min="0.01"
        step="0.01"
        disabled={hasBatches}
        title={hasBatches ? 'Managed automatically by batches' : ''}
      />
      {hasBatches && (
        <small className="edit-modal-helper">
          Managed automatically by batches.
        </small>
      )}
      {hasAttemptedSubmit && errors.cost && (
        <p className="edit-modal-error-msg">{errors.cost}</p>
      )}
    </div>

    <div className="edit-modal-group">
      <label className="edit-modal-label">Minimum Level *</label>
      <input
        type="number"
        className={`edit-modal-input ${hasAttemptedSubmit && errors.reorderLevel ? 'is-invalid' : ''}`}
        value={reorderLevel}
        onChange={(event) => setReorderLevel(event.target.value)}
        min="1"
      />
      {hasAttemptedSubmit && errors.reorderLevel && (
        <p className="edit-modal-error-msg">{errors.reorderLevel}</p>
      )}
    </div>

    <div className="edit-modal-group">
      <label className="edit-modal-label">Supplier (optional)</label>
      <input
        type="text"
        className="edit-modal-input"
        value={supplier}
        onChange={(event) => setSupplier(event.target.value)}
        placeholder="Optional"
      />
    </div>
  </div>
);

export default EditInventoryBaseInfo;
