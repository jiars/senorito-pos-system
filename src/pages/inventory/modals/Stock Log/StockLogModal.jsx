import React, { useState, useEffect } from 'react';
import './stockLogModal.css';

const StockLogModal = ({ isOpen, onClose, item }) => {
  const [actionType, setActionType] = useState('restock'); // 'restock', 'wastage', 'correct'
  const [quantity, setQuantity] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setActionType('restock');
      setQuantity('');
      setExpirationDate('');
      setReason('');
      setNotes('');
      setErrors({});
    }
  }, [isOpen]);

  const currentStock = item ? Number(item.qty || 0) : 0;
  const unit = item ? item.unit || 'pcs' : 'pcs';
  const isExpiryTracked = item && item.expiry !== null;

  // Real-time validation and calculations
  useEffect(() => {
    if (!isOpen) return;
    const newErrors = {};
    const numQuantity = Number(quantity);

    if (quantity === '') {
      newErrors.quantity = 'Quantity is required.';
    } else if (isNaN(numQuantity)) {
      newErrors.quantity = 'Quantity must be a valid number.';
    } else if (actionType === 'correct' && numQuantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative.';
    } else if (actionType !== 'correct' && numQuantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0.';
    }

    if (actionType === 'restock' && isExpiryTracked) {
      if (!expirationDate) {
        newErrors.expirationDate = 'Expiration date is required.';
      }
    }

    if (!reason) {
      newErrors.reason = 'Reason is required.';
    }

    setErrors(newErrors);
  }, [quantity, expirationDate, reason, actionType, isOpen]);

  if (!isOpen || !item) return null;

  const isFormValid = Object.keys(errors).length === 0;

  const handleSave = () => {
    if (!isFormValid) return;
    console.log('Saving Stock Log:', {
      item: item.name,
      actionType,
      quantity: Number(quantity),
      expirationDate: actionType === 'restock' ? expirationDate : null,
      reason,
      notes
    });
    onClose();
  };

  const getSubtext = () => {
    switch (actionType) {
      case 'restock': return 'Add stock from delivery or purchase';
      case 'wastage': return 'Remove stock due to spoilage, damage, or loss';
      case 'correct': return 'Adjust stock based on physical count or corrections';
      default: return '';
    }
  };

  const renderActionButtons = () => (
    <div className="stocklog-action-types">
      <button 
        className={`stocklog-action-btn stocklog-action-btn--restock ${actionType === 'restock' ? 'active' : ''}`}
        onClick={() => { setActionType('restock'); setReason(''); }}
      >
        <i className="bi bi-plus-circle"></i> Restock
      </button>
      <button 
        className={`stocklog-action-btn stocklog-action-btn--wastage ${actionType === 'wastage' ? 'active' : ''}`}
        onClick={() => { setActionType('wastage'); setReason(''); }}
      >
        <i className="bi bi-dash-circle"></i> Wastage
      </button>
      <button 
        className={`stocklog-action-btn stocklog-action-btn--correct ${actionType === 'correct' ? 'active' : ''}`}
        onClick={() => { setActionType('correct'); setReason(''); }}
      >
        <i className="bi bi-check2-circle"></i> Correct
      </button>
    </div>
  );

  const renderReasonOptions = () => {
    if (actionType === 'restock') {
      return (
        <>
          <option value="Initial Stock">Initial Stock</option>
          <option value="Supplier Delivery">Supplier Delivery</option>
          <option value="Manual Stock Addition">Manual Stock Addition</option>
          <option value="Owner Adjustment">Owner Adjustment</option>
        </>
      );
    }
    if (actionType === 'wastage') {
      return (
        <>
          <option value="Expired">Expired</option>
          <option value="Spoiled">Spoiled</option>
          <option value="Damaged">Damaged</option>
          <option value="Spillage">Spillage</option>
          <option value="Wrong Preparation">Wrong Preparation</option>
          <option value="Burnt / Overcooked">Burnt / Overcooked</option>
          <option value="Contaminated">Contaminated</option>
          <option value="Customer Return">Customer Return</option>
          <option value="Overproduction">Overproduction</option>
          <option value="Storage Issue">Storage Issue</option>
          <option value="Missing Item">Missing Item</option>
        </>
      );
    }
    return (
      <>
        <option value="Physical Count Mismatch">Physical Count Mismatch</option>
        <option value="Encoding Error">Encoding Error</option>
        <option value="Unit Conversion Error">Unit Conversion Error</option>
        <option value="Duplicate Entry Correction">Duplicate Entry Correction</option>
        <option value="Unrecorded Stock Movement">Unrecorded Stock Movement</option>
        <option value="System Sync Error">System Sync Error</option>
        <option value="Batch Count Correction">Batch Count Correction</option>
        <option value="Audit Adjustment">Audit Adjustment</option>
      </>
    );
  };

  // Preview Calculations
  const numQty = Number(quantity) || 0;
  let previewLabel = "New Stock (preview)";
  let previewValue = "";
  
  if (actionType === 'restock') {
    previewValue = `${currentStock + numQty} ${unit}`;
  } else if (actionType === 'wastage') {
    previewValue = `${Math.max(0, currentStock - numQty)} ${unit}`;
  } else if (actionType === 'correct') {
    previewLabel = "Difference";
    const diff = numQty - currentStock;
    const sign = diff > 0 ? '+' : '';
    previewValue = quantity !== '' ? `${sign}${diff} ${unit}` : `-`;
  }

  const getQuantityLabel = () => {
    if (actionType === 'restock') return 'Quantity to Add';
    if (actionType === 'wastage') return 'Quantity to Remove';
    return 'Actual Physical Count';
  };

  return (
    <div className="stocklog-modal-overlay">
      <div className="stocklog-modal-content">
        <div className="stocklog-modal-header">
          <h3>Stock Log</h3>
          <button className="stocklog-modal-close" onClick={onClose} aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="stocklog-modal-body">
          {/* Item Info */}
          <div className="stocklog-section">
            <label className="stocklog-label">Item</label>
            <input type="text" className="stocklog-input" value={item.name} readOnly />
            <div className="stocklog-subtext" style={{ color: '#6C757D' }}>
              Current stock: <strong style={{ color: '#2C1810' }}>{currentStock} {unit}</strong>
            </div>
          </div>

          <hr className="stocklog-divider" />

          {/* Action Type */}
          <div className="stocklog-section">
            <label className="stocklog-label">Action Type</label>
            {renderActionButtons()}
            <div className="stocklog-subtext">
              <i className="bi bi-info-circle"></i> {getSubtext()}
            </div>
          </div>

          <hr className="stocklog-divider" />

          {/* Quantity & Preview */}
          <div className="stocklog-section-row">
            <div className="stocklog-section">
              <label className="stocklog-label">{getQuantityLabel()}</label>
              <input
                type="number"
                className={`stocklog-input ${(quantity !== '' && errors.quantity) ? 'is-invalid' : ''}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                min="0"
              />
              {(quantity !== '' && errors.quantity) && (
                <p className="stocklog-error-msg">{errors.quantity}</p>
              )}
            </div>
            <div className="stocklog-section">
              <label className="stocklog-label">{previewLabel}</label>
              <input type="text" className="stocklog-input" value={previewValue} readOnly />
            </div>
          </div>

          <hr className="stocklog-divider" />

          {/* Expiration Date - Only for restock and if item tracks expiry */}
          {actionType === 'restock' && isExpiryTracked && (
            <>
              <div className="stocklog-section">
                <label className="stocklog-label">Expiration Date</label>
                <input
                  type="date"
                  className={`stocklog-input ${(expirationDate !== '' && errors.expirationDate) ? 'is-invalid' : ''}`}
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
                {(expirationDate !== '' && errors.expirationDate) && (
                  <p className="stocklog-error-msg">{errors.expirationDate}</p>
                )}
                <div className="stocklog-subtext">
                  Required for expiry-tracked items when restocking
                </div>
              </div>
              <hr className="stocklog-divider" />
            </>
          )}

          {/* Reason & Notes */}
          <div className="stocklog-section-row">
            <div className="stocklog-section">
              <label className="stocklog-label">Reason</label>
              <select
                className={`stocklog-select ${(reason !== '' && errors.reason) ? 'is-invalid' : ''}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="" disabled>Select reason...</option>
                {renderReasonOptions()}
              </select>
              {(reason !== '' && errors.reason) && (
                <p className="stocklog-error-msg">{errors.reason}</p>
              )}
            </div>
            <div className="stocklog-section">
              <label className="stocklog-label">
                {actionType === 'restock' ? 'Supplier (Optional)' : 'Notes (Optional)'}
              </label>
              <input
                type="text"
                className="stocklog-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter details..."
              />
            </div>
          </div>
        </div>

        <div className="stocklog-modal-footer">
          <button className="stocklog-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="stocklog-btn-save" 
            onClick={handleSave}
            disabled={!isFormValid}
          >
            Save Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockLogModal;
