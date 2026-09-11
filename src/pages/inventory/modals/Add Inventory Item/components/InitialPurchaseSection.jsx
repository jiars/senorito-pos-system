import React from 'react';
import { formatCurrency } from '../../../../../utils/currencyFormatters';

const InitialPurchaseSection = ({
  qtyPurchased, setQtyPurchased,
  purchaseUnit, setPurchaseUnit,
  totalCost, setTotalCost,
  purchaseMultiplier, setPurchaseMultiplier,
  minLevel, setMinLevel,
  supplier, setSupplier,
  unit, getStandardMultiplier,
  hasAttemptedSubmit,
  isQtyValid, isCostValid, isMinValid, isMultiplierValid,
  getBaseUnitCost, parsedCost, parsedQty
}) => {

  const renderPurchaseHelper = () => {
    if (!isQtyValid || !isCostValid || !purchaseUnit || !unit) {
      return "Enter purchase details to calculate cost.";
    }

    const costPerPurchaseUnit = parsedCost / parsedQty;
    const baseCost = getBaseUnitCost();
    let baseText = "Requires conversion setup";
    if (baseCost !== null) {
      baseText = `${formatCurrency(baseCost)} / ${unit}`;
    }

    return (
      <>
        Computed cost per unit: {formatCurrency(costPerPurchaseUnit)} / {purchaseUnit}<br />
        Per base unit: {baseText}
      </>
    );
  };

  return (
    <div className="inventory-modal-section">
      <h4 className="inventory-modal-section-title">Initial Purchase</h4>
      <div className="inventory-form-grid inventory-form-grid--3">
        <div className="inventory-form-group">
          <label className="inventory-form-label">Qty Purchased *</label>
          <input
            type="number"
            min="1"
            step="any"
            className={`inventory-form-input ${hasAttemptedSubmit && !isQtyValid ? 'inventory-form-input--error' : ''}`}
            placeholder="Enter quantity"
            value={qtyPurchased}
            onChange={(e) => setQtyPurchased(e.target.value)}
          />
          {hasAttemptedSubmit && !isQtyValid && (
            <span className="inventory-form-error">Must be at least 1.</span>
          )}
        </div>
        <div className="inventory-form-group">
          <label className="inventory-form-label">Purchase Unit *</label>
          <input
            type="text"
            className={`inventory-form-input ${hasAttemptedSubmit && purchaseUnit === '' ? 'inventory-form-input--error' : ''}`}
            placeholder="e.g. Box, Sack, kg"
            value={purchaseUnit}
            onChange={(e) => setPurchaseUnit(e.target.value)}
          />
          {hasAttemptedSubmit && purchaseUnit === '' && (
            <span className="inventory-form-error">Purchase unit required.</span>
          )}
        </div>
        <div className="inventory-form-group">
          <label className="inventory-form-label">Total Cost (₱) *</label>
          <input
            type="number"
            min="0"
            step="any"
            className={`inventory-form-input ${hasAttemptedSubmit && !isCostValid ? 'inventory-form-input--error' : ''}`}
            placeholder="Enter total cost"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
          />
          {hasAttemptedSubmit && !isCostValid && (
            <span className="inventory-form-error">Must be greater than 0.</span>
          )}
        </div>
      </div>

      {purchaseUnit && unit && !getStandardMultiplier(unit, purchaseUnit) && (
        <div style={{ marginTop: '0.5rem', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '6px', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, fontSize: '0.85rem', color: '#6c757d' }}>
            <strong>Purchase Conversion:</strong> How many {unit} are in 1 {purchaseUnit}?
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#2C1810', fontWeight: 'bold' }}>
            <span>1 {purchaseUnit} = </span>
            <input
              type="number"
              min="0"
              step="any"
              className={`inventory-form-input ${!isMultiplierValid ? 'inventory-form-input--error' : ''}`}
              style={{ width: '80px', padding: '4px 8px', textAlign: 'center' }}
              value={purchaseMultiplier}
              onChange={(e) => setPurchaseMultiplier(e.target.value)}
            />
            <span>{unit}</span>
          </div>
        </div>
      )}

      <div className="inventory-form-helper">
        {renderPurchaseHelper()}
      </div>
      <div className="inventory-form-grid inventory-form-grid--2" style={{ marginTop: '0.5rem' }}>
        <div className="inventory-form-group">
          <label className="inventory-form-label">Minimum Level ({unit || 'unit'}) *</label>
          <input
            type="number"
            min="0"
            step="any"
            className={`inventory-form-input ${hasAttemptedSubmit && !isMinValid ? 'inventory-form-input--error' : ''}`}
            placeholder="Enter minimum stock level"
            value={minLevel}
            onChange={(e) => setMinLevel(e.target.value)}
          />
          {hasAttemptedSubmit && !isMinValid && (
            <span className="inventory-form-error">Must be greater than 0.</span>
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
  );
};

export default InitialPurchaseSection;
