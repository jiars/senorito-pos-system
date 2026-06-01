import React, { useState } from 'react';
import './addInventoryItemModal.css';

const AddInventoryItemModal = ({ isOpen, onClose, existingItems = [] }) => {
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [qtyPurchased, setQtyPurchased] = useState('');
  const [purchaseUnit, setPurchaseUnit] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [minLevel, setMinLevel] = useState('');
  const [supplier, setSupplier] = useState('');

  const [conversions, setConversions] = useState([
    { id: 1, unit: '', equivalent: '' }
  ]);

  const [trackExpiry, setTrackExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [note, setNote] = useState('');

  // Track touched fields for validation
  const [touched, setTouched] = useState({});

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setItemName('');
      setUnit('');
      setCategory('');
      setQtyPurchased('');
      setPurchaseUnit('');
      setTotalCost('');
      setMinLevel('');
      setSupplier('');
      setConversions([{ id: 1, unit: '', equivalent: '' }]);
      setTrackExpiry(false);
      setExpiryDate('');
      setNote('');
      setTouched({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time interaction handler
  const handleInteraction = (field) => {
    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleExpiryToggle = (e) => {
    const isChecked = e.target.checked;
    setTrackExpiry(isChecked);
    if (isChecked) {
      handleInteraction('expiryDate');
    }
  };

  const handleAddConversion = () => {
    setConversions([...conversions, { id: Date.now(), unit: '', equivalent: '' }]);
  };

  const handleRemoveConversion = (id) => {
    // Only allow removing if more than 1 row exists
    if (conversions.length > 1) {
      setConversions(conversions.filter(c => c.id !== id));
    }
  };

  const handleConversionChange = (id, field, value) => {
    setConversions(conversions.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // ─── Validation Logic ───
  const trimmedName = itemName.trim();
  const isNameEmpty = trimmedName === '';
  const isDuplicateName = existingItems.some(
    (name) => name.toLowerCase() === trimmedName.toLowerCase()
  );

  const parsedQty = parseFloat(qtyPurchased);
  const isQtyValid = qtyPurchased !== '' && !isNaN(parsedQty) && parsedQty > 0;

  const parsedCost = parseFloat(totalCost);
  const isCostValid = totalCost !== '' && !isNaN(parsedCost) && parsedCost > 0;

  const parsedMin = parseFloat(minLevel);
  const isMinValid = minLevel !== '' && !isNaN(parsedMin) && parsedMin >= 0;

  let conversionsValid = true;
  conversions.forEach(c => {
    if (c.unit !== '' || c.equivalent !== '') {
      const eq = parseFloat(c.equivalent);
      if (c.unit === '' || isNaN(eq) || eq <= 0) {
        conversionsValid = false;
      }
    }
  });

  const isExpiryEmpty = expiryDate === '';
  const isExpiryDateFuture = () => {
    if (!expiryDate) return false;
    const dateObj = new Date(expiryDate);
    if (isNaN(dateObj.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = expiryDate.split('-');
    if (parts.length === 3) {
      const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
      return localDate >= today;
    }
    return dateObj >= today;
  };

  const hasValidFutureDate = isExpiryDateFuture();
  const isExpiryValid = !trackExpiry || (trackExpiry && !isExpiryEmpty && hasValidFutureDate);

  const isFormValid =
    !isNameEmpty &&
    !isDuplicateName &&
    unit !== '' &&
    category !== '' &&
    isQtyValid &&
    purchaseUnit !== '' &&
    isCostValid &&
    isMinValid &&
    conversionsValid &&
    isExpiryValid;

  // ─── Helpers for Computed Costs ───
  const getBaseUnitCost = () => {
    if (!isQtyValid || !isCostValid || !purchaseUnit || !unit) return null;

    const costPerPurchaseUnit = parsedCost / parsedQty;
    if (purchaseUnit === 'kg' && unit === 'g') return costPerPurchaseUnit / 1000;
    if (purchaseUnit === 'L' && unit === 'ml') return costPerPurchaseUnit / 1000;
    if (purchaseUnit === unit) return costPerPurchaseUnit;
    return null;
  };

  const renderPurchaseHelper = () => {
    if (!isQtyValid || !isCostValid || !purchaseUnit || !unit) {
      return "Enter purchase details to calculate cost.";
    }

    const costPerPurchaseUnit = parsedCost / parsedQty;
    const baseCost = getBaseUnitCost();
    let baseText = "Requires conversion setup";
    if (baseCost !== null) {
      baseText = `₱${baseCost.toFixed(2)} / ${unit}`;
    }

    return (
      <>
        Computed cost per unit: ₱{costPerPurchaseUnit.toFixed(2)} / {purchaseUnit}<br />
        Per base unit: {baseText}
      </>
    );
  };

  const renderConversionHelper = (conv) => {
    const eq = parseFloat(conv.equivalent);
    if (!conv.unit || isNaN(eq) || eq <= 0) {
      return "Enter equivalent value to calculate conversion cost.";
    }

    const baseCost = getBaseUnitCost();
    if (baseCost !== null) {
      const costPerConv = baseCost * eq;
      return (
        <>
          Computed cost per unit:<br />
          1 {conv.unit}/ {eq}{unit}<br />
          Per base unit: ₱{costPerConv.toFixed(2)}/ {conv.unit}
        </>
      );
    }
    return "Enter purchase details to calculate conversion cost.";
  };

  return (
    <div className="inventory-modal-overlay">
      <div className="inventory-modal-content">
        <div className="inventory-modal-header">
          <h3>Add Inventory Item</h3>
          <button className="inventory-modal-close" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="inventory-modal-body">
          {/* Section 1 */}
          <div className="inventory-modal-section">
            <div className="inventory-form-grid inventory-form-grid--3">
              <div className="inventory-form-group">
                <label className="inventory-form-label">Item Name</label>
                <input
                  type="text"
                  className={`inventory-form-input ${touched.itemName && (isNameEmpty || isDuplicateName) ? 'inventory-form-input--error' : ''}`}
                  placeholder="Enter item name"
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value);
                    handleInteraction('itemName');
                  }}
                  onBlur={() => handleInteraction('itemName')}
                />
                {touched.itemName && isNameEmpty && (
                  <span className="inventory-form-error">Item name is required.</span>
                )}
                {touched.itemName && !isNameEmpty && isDuplicateName && (
                  <span className="inventory-form-error">This item already exists.</span>
                )}
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Base Unit</label>
                <select
                  className={`inventory-form-select ${touched.unit && unit === '' ? 'inventory-form-select--error' : ''}`}
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value);
                    handleInteraction('unit');
                  }}
                  onBlur={() => handleInteraction('unit')}
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
                {touched.unit && unit === '' && (
                  <span className="inventory-form-error">Unit is required.</span>
                )}
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Category</label>
                <select
                  className={`inventory-form-select ${touched.category && category === '' ? 'inventory-form-select--error' : ''}`}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    handleInteraction('category');
                  }}
                  onBlur={() => handleInteraction('category')}
                >
                  <option value="" disabled>Select category</option>
                  <option value="Ingredient">Ingredient</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Supply">Supply</option>
                </select>
                {touched.category && category === '' && (
                  <span className="inventory-form-error">Category is required.</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="inventory-modal-section">
            <h4 className="inventory-modal-section-title">Initial Purchase</h4>
            <div className="inventory-form-grid inventory-form-grid--3">
              <div className="inventory-form-group">
                <label className="inventory-form-label">Qty Purchased</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className={`inventory-form-input ${touched.qtyPurchased && !isQtyValid ? 'inventory-form-input--error' : ''}`}
                  placeholder="Enter quantity"
                  value={qtyPurchased}
                  onChange={(e) => {
                    setQtyPurchased(e.target.value);
                    handleInteraction('qtyPurchased');
                  }}
                  onBlur={() => handleInteraction('qtyPurchased')}
                />
                {touched.qtyPurchased && !isQtyValid && (
                  <span className="inventory-form-error">Must be greater than 0.</span>
                )}
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Purchase Unit</label>
                <select
                  className={`inventory-form-select ${touched.purchaseUnit && purchaseUnit === '' ? 'inventory-form-select--error' : ''}`}
                  value={purchaseUnit}
                  onChange={(e) => {
                    setPurchaseUnit(e.target.value);
                    handleInteraction('purchaseUnit');
                  }}
                  onBlur={() => handleInteraction('purchaseUnit')}
                >
                  <option value="" disabled>Select purchase unit</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="pcs">pcs</option>
                  <option value="pack">pack</option>
                  <option value="bottle">bottle</option>
                </select>
                {touched.purchaseUnit && purchaseUnit === '' && (
                  <span className="inventory-form-error">Purchase unit required.</span>
                )}
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Total Cost (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className={`inventory-form-input ${touched.totalCost && !isCostValid ? 'inventory-form-input--error' : ''}`}
                  placeholder="Enter total cost"
                  value={totalCost}
                  onChange={(e) => {
                    setTotalCost(e.target.value);
                    handleInteraction('totalCost');
                  }}
                  onBlur={() => handleInteraction('totalCost')}
                />
                {touched.totalCost && !isCostValid && (
                  <span className="inventory-form-error">Must be greater than 0.</span>
                )}
              </div>
            </div>
            <div className="inventory-form-helper">
              {renderPurchaseHelper()}
            </div>
            <div className="inventory-form-grid inventory-form-grid--2" style={{ marginTop: '0.5rem' }}>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Minimum Level ({unit || 'unit'})</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className={`inventory-form-input ${touched.minLevel && !isMinValid ? 'inventory-form-input--error' : ''}`}
                  placeholder="Enter minimum stock level"
                  value={minLevel}
                  onChange={(e) => {
                    setMinLevel(e.target.value);
                    handleInteraction('minLevel');
                  }}
                  onBlur={() => handleInteraction('minLevel')}
                />
                {touched.minLevel && !isMinValid && (
                  <span className="inventory-form-error">Must be 0 or greater.</span>
                )}
              </div>
              <div className="inventory-form-group">
                <label className="inventory-form-label">Supplier (optional)</label>
                <input
                  type="text"
                  className="inventory-form-input"
                  placeholder="Enter supplier name"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="inventory-modal-section">
            <h4 className="inventory-modal-section-title">Recipe Conversion Unit</h4>

            {conversions.map((conv) => {
              const eq = parseFloat(conv.equivalent);
              const isConvUnitEmpty = conv.unit === '';
              const isEqInvalid = isNaN(eq) || eq <= 0;
              const hasInput = !isConvUnitEmpty || conv.equivalent !== '';
              const showError = hasInput && (isConvUnitEmpty || isEqInvalid);

              return (
                <div className="inventory-conversion-row" key={conv.id}>
                  <div className="inventory-form-group">
                    <label className="inventory-form-label">Converted Unit</label>
                    <select
                      className={`inventory-form-select ${showError && isConvUnitEmpty ? 'inventory-form-select--error' : ''}`}
                      value={conv.unit}
                      onChange={(e) => handleConversionChange(conv.id, 'unit', e.target.value)}
                    >
                      <option value="" disabled>Select converted unit</option>
                      <option value="tbsp">tbsp</option>
                      <option value="cup">cup</option>
                      <option value="tsp">tsp</option>
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                      <option value="pcs">pcs</option>
                    </select>
                    {showError && isConvUnitEmpty && (
                      <span className="inventory-form-error">Unit required.</span>
                    )}
                  </div>
                  <div className="inventory-form-group">
                    <label className="inventory-form-label">
                      Equivalent Amount
                      <span className="inventory-form-label-helper">
                        Amount in {unit || "base unit"}
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={`inventory-form-input ${showError && isEqInvalid ? 'inventory-form-input--error' : ''}`}
                      placeholder="Enter equivalent amount"
                      value={conv.equivalent}
                      onChange={(e) => handleConversionChange(conv.id, 'equivalent', e.target.value)}
                    />
                    {showError && isEqInvalid && (
                      <span className="inventory-form-error">Must be &gt; 0.</span>
                    )}
                  </div>
                  <div className="inventory-form-helper inventory-form-helper--align-bottom">
                    {renderConversionHelper(conv)}
                  </div>
                  <button
                    className="inventory-remove-conv-btn"
                    onClick={() => handleRemoveConversion(conv.id)}
                    title="Remove conversion"
                    disabled={conversions.length <= 1}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              );
            })}

            <button className="inventory-add-conversion-btn" onClick={handleAddConversion}>
              <i className="bi bi-plus" style={{ marginRight: '0.25rem' }}></i>
              Add conversion unit
            </button>
          </div>

          {/* Section 4 */}
          <div className="inventory-modal-section" style={{ borderBottom: 'none' }}>
            <div className="inventory-switch-group">
              <label className="inventory-switch">
                <input
                  type="checkbox"
                  checked={trackExpiry}
                  onChange={handleExpiryToggle}
                />
                <span className="inventory-switch-slider"></span>
              </label>
              <span className="inventory-switch-label">
                <i className="bi bi-calendar-check"></i>
                Track Expiry for this item
              </span>
            </div>

            {trackExpiry && (
              <div className="inventory-form-group" style={{ marginTop: '0.5rem' }}>
                <label className="inventory-form-label">Expiration Date</label>
                <div className="inventory-date-input-wrapper">
                  <input
                    type="date"
                    className={`inventory-form-input ${touched.expiryDate && (!isExpiryValid) ? 'inventory-form-input--error' : ''}`}
                    value={expiryDate}
                    onChange={(e) => {
                      setExpiryDate(e.target.value);
                      handleInteraction('expiryDate');
                    }}
                    onBlur={() => handleInteraction('expiryDate')}
                  />
                  {touched.expiryDate && isExpiryEmpty && (
                    <span className="inventory-form-error">Expiration date is required.</span>
                  )}
                  {touched.expiryDate && !isExpiryEmpty && !hasValidFutureDate && (
                    <span className="inventory-form-error">Enter a valid future expiration date.</span>
                  )}
                </div>
              </div>
            )}

            <div className="inventory-form-group" style={{ marginTop: '0.5rem' }}>
              <label className="inventory-form-label">Note (optional)</label>
              <input
                type="text"
                className="inventory-form-input"
                placeholder="Add a note for this inventory item"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

        </div>

        <div className="inventory-modal-footer">
          <button className="inventory-modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="inventory-modal-btn-save"
            onClick={onClose}
            disabled={!isFormValid}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryItemModal;
