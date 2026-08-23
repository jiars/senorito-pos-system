import React, { useState, useEffect } from 'react';
import './editItemModal.css';
import { updateInventoryItem } from '../../../../services/inventory/inventoryItemsService';

const EditItemModal = ({ isOpen, onClose, item, existingItems = [], categories = [], refetchInventory }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [supplier, setSupplier] = useState('');
  const [conversions, setConversions] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Reset form when modal opens or item changes
  useEffect(() => {
    if (isOpen && item) {
      setName(item.item_name || '');
      setUnit(item.base_unit || '');
      setCategory(item.category_id || '');
      setCost(item.cost_per_unit ? item.cost_per_unit.toString() : '');
      setReorderLevel(item.minimum_level !== undefined ? item.minimum_level.toString() : '');
      setSupplier(item.supplier || '');
      
      // Initialize conversions
      if (item.inventory_conversion_units && item.inventory_conversion_units.length > 0) {
        setConversions(item.inventory_conversion_units.map(c => ({
          id: c.id,
          unit: c.converted_unit,
          equivalent: c.equivalent_base_amount.toString()
        })));
      } else {
        setConversions([]);
      }

      setErrors({});
      setApiError('');
      setIsSubmitting(false);
    }
  }, [isOpen, item]);

  const handleAddConversion = () => {
    setConversions([...conversions, { id: Date.now().toString(), unit: '', equivalent: '' }]);
  };

  const handleRemoveConversion = (id) => {
    setConversions(conversions.filter(c => c.id !== id));
  };

  const handleConversionChange = (id, field, value) => {
    setConversions(conversions.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

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
          existingName.toLowerCase() !== (item?.item_name || '').toLowerCase()
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

  let conversionsValid = true;
  conversions.forEach(c => {
    const eq = parseFloat(c.equivalent);
    if (c.unit.trim() === '' || isNaN(eq) || eq <= 0) {
      conversionsValid = false;
    }
  });

  const isFormValid = Object.keys(errors).length === 0 && name.trim() !== '' && unit !== '' && category !== '' && cost !== '' && reorderLevel !== '' && conversionsValid;

  const handleSave = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const updatePayload = {
        item_name: name.trim(),
        base_unit: unit,
        category_id: category,
        cost_per_unit: Number(cost),
        minimum_level: Number(reorderLevel),
        supplier: supplier.trim()
      };

      const conversionsData = conversions.map(c => ({
        id: c.id,
        converted_unit: c.unit.trim(),
        equivalent_base_amount: parseFloat(c.equivalent)
      }));

      await updateInventoryItem(item.id, updatePayload, conversionsData);

      if (refetchInventory) {
        await refetchInventory();
      }

      onClose();
    } catch (error) {
      setApiError(error.message || 'Failed to update inventory item.');
    } finally {
      setIsSubmitting(false);
    }
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
                disabled // Name should not be editable to prevent recipe breakage
                title="Name cannot be changed after creation"
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
                disabled // Unit should not be editable to prevent recipe cost calculation breakage
                title="Base unit cannot be changed after creation"
              >
                <option value="" disabled>Select unit</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="pcs">pcs</option>
                <option value="pack">pack</option>
                <option value="bottle">bottle</option>
                <option value="tbsp">tbsp</option>
                <option value="cup">cup</option>
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
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
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
                disabled={item?.inventory_batches?.length > 0}
                title={item?.inventory_batches?.length > 0 ? "Cost is automatically calculated based on your active batches (FIFO)" : ""}
              />
              {item?.inventory_batches?.length > 0 && (
                <small style={{ color: '#666', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Managed automatically by batches.
                </small>
              )}
              {errors.cost && !item?.inventory_batches?.length > 0 && <p className="edit-modal-error-msg">{errors.cost}</p>}
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

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e9ecef' }} />

          <div className="edit-modal-section">
            <h4 style={{ fontSize: '0.95rem', color: '#2C1810', marginBottom: '1rem' }}>Recipe Conversion Units</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '0.5rem', alignItems: 'end' }}>
              <label className="edit-modal-label" style={{ marginBottom: 0 }}>Converted Unit</label>
              <label className="edit-modal-label" style={{ marginBottom: 0 }}>
                Equivalent Amount in {unit || 'base unit'}
              </label>
              <div style={{ width: '32px' }}></div>
            </div>

            {conversions.map((conv) => {
              const eq = parseFloat(conv.equivalent);
              const isConvUnitEmpty = conv.unit.trim() === '';
              const isEqInvalid = isNaN(eq) || eq <= 0;
              const hasInput = !isConvUnitEmpty || conv.equivalent !== '';
              const showError = hasInput && (isConvUnitEmpty || isEqInvalid);

              return (
                <div key={conv.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div className="edit-modal-group" style={{ marginBottom: 0 }}>
                    <input
                      type="text"
                      className={`edit-modal-input ${showError && isConvUnitEmpty ? 'is-invalid' : ''}`}
                      placeholder="e.g. shot, tbsp"
                      value={conv.unit}
                      onChange={(e) => handleConversionChange(conv.id, 'unit', e.target.value)}
                    />
                    {showError && isConvUnitEmpty && <p className="edit-modal-error-msg">Required.</p>}
                  </div>
                  <div className="edit-modal-group" style={{ marginBottom: 0 }}>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={`edit-modal-input ${showError && isEqInvalid ? 'is-invalid' : ''}`}
                      placeholder="Enter amount"
                      value={conv.equivalent}
                      onChange={(e) => handleConversionChange(conv.id, 'equivalent', e.target.value)}
                    />
                    {showError && isEqInvalid && <p className="edit-modal-error-msg">Must be &gt; 0.</p>}
                  </div>
                  <button
                    style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', marginTop: '0', padding: '0.6rem' }}
                    onClick={() => handleRemoveConversion(conv.id)}
                    title="Remove"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              );
            })}

            <button
              onClick={handleAddConversion}
              style={{ background: 'none', border: '1px dashed #ced4da', borderRadius: '6px', color: '#2C1810', padding: '0.5rem 1rem', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <i className="bi bi-plus"></i> Add conversion unit
            </button>
          </div>
        </div>

        <div className="edit-modal-footer">
          {apiError && <p className="edit-modal-error-msg" style={{ marginRight: 'auto', marginBottom: 0 }}>{apiError}</p>}
          <button className="edit-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="edit-btn-save"
            onClick={handleSave}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
