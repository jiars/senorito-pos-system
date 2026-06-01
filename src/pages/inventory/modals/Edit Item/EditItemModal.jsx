import React, { useState, useEffect } from 'react';
import './editItemModal.css';

const EditItemModal = ({ isOpen, onClose, item, existingItems = [] }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [supplier, setSupplier] = useState('');

  const [errors, setErrors] = useState({});

  // Reset form when modal opens or item changes
  useEffect(() => {
    if (isOpen && item) {
      setName(item.name || '');
      setUnit(item.unit || '');
      setCategory(item.category || '');
      setCost(item.cost || '25');
      setReorderLevel(item.minLevel !== undefined ? item.minLevel : '');
      setSupplier(item.supplier || 'Jana Levanza');
      setErrors({});
    }
  }, [isOpen, item]);

  // Real-time validation
  useEffect(() => {
    if (!isOpen) return;

    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Item name is required.';
    } else if (
      existingItems.some(
        (existingName) =>
          existingName.toLowerCase() === name.trim().toLowerCase() &&
          existingName.toLowerCase() !== (item?.name || '').toLowerCase()
      )
    ) {
      newErrors.name = 'An item with this name already exists.';
    }

    if (!unit) {
      newErrors.unit = 'Unit is required.';
    }

    if (!category) {
      newErrors.category = 'Category is required.';
    }

    if (cost === '') {
      newErrors.cost = 'Cost is required.';
    } else if (Number(cost) <= 0) {
      newErrors.cost = 'Cost must be greater than 0.';
    }

    if (reorderLevel === '') {
      newErrors.reorderLevel = 'Reorder level is required.';
    } else if (Number(reorderLevel) < 0) {
      newErrors.reorderLevel = 'Reorder level cannot be negative.';
    }

    setErrors(newErrors);
  }, [name, unit, category, cost, reorderLevel, existingItems, isOpen, item]);

  if (!isOpen || !item) return null;

  const isFormValid = Object.keys(errors).length === 0;

  const handleSave = () => {
    if (!isFormValid) return;

    console.log('Saving edited item:', {
      id: item.id,
      name: name.trim(),
      unit,
      category,
      cost: Number(cost),
      reorderLevel: Number(reorderLevel),
      supplier: supplier.trim()
    });

    onClose();
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <div className="edit-modal-header">
          <h3>Edit Item</h3>
          <span className="edit-modal-subtitle">{item.name}</span>
          <button className="edit-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="edit-modal-body">
          <div className="edit-modal-form-grid">
            {/* Name */}
            <div className="edit-modal-group">
              <label className="edit-modal-label">Name</label>
              <input
                type="text"
                className={`edit-modal-input ${errors.name ? 'is-invalid' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter item name"
              />
              {errors.name && <p className="edit-modal-error-msg">{errors.name}</p>}
            </div>

            {/* Unit */}
            <div className="edit-modal-group">
              <label className="edit-modal-label">Unit</label>
              <select
                className={`edit-modal-select ${errors.unit ? 'is-invalid' : ''}`}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="" disabled>Select unit</option>
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="bottle">bottle</option>
                <option value="pack">pack</option>
              </select>
              {errors.unit && <p className="edit-modal-error-msg">{errors.unit}</p>}
            </div>

            {/* Category */}
            <div className="edit-modal-group">
              <label className="edit-modal-label">Category</label>
              <select
                className={`edit-modal-select ${errors.category ? 'is-invalid' : ''}`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>Select category</option>
                <option value="Ingredient">Ingredient</option>
                <option value="Packaging">Packaging</option>
                <option value="Cleaning">Cleaning</option>
              </select>
              {errors.category && <p className="edit-modal-error-msg">{errors.category}</p>}
            </div>

            {/* Cost/Unit */}
            <div className="edit-modal-group">
              <label className="edit-modal-label">Cost/Unit (₱)</label>
              <input
                type="number"
                className={`edit-modal-input ${errors.cost ? 'is-invalid' : ''}`}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
              {errors.cost && <p className="edit-modal-error-msg">{errors.cost}</p>}
            </div>

            {/* Reorder Level */}
            <div className="edit-modal-group">
              <label className="edit-modal-label">Reorder Level</label>
              <input
                type="number"
                className={`edit-modal-input ${errors.reorderLevel ? 'is-invalid' : ''}`}
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                placeholder="0"
                min="0"
              />
              {errors.reorderLevel && <p className="edit-modal-error-msg">{errors.reorderLevel}</p>}
            </div>

            {/* Supplier */}
            <div className="edit-modal-group">
              <label className="edit-modal-label">Supplier</label>
              <input
                type="text"
                className="edit-modal-input"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <div className="edit-modal-footer">
          <button className="edit-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="edit-btn-save"
            onClick={handleSave}
            disabled={!isFormValid}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
