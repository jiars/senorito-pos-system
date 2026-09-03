import React, { useState, useEffect } from 'react';

import { fetchItemBatches, fetchLiveItemStock, logStockAdjustment } from '../../../../services/inventory/inventoryStockService';
import { useAuth } from '../../../../hooks/useAuth';

import './stockLogModal.css';

const StockLogModal = ({ isOpen, onClose, refetchInventory, item }) => {
  const { user } = useAuth();

  const [totalCost, setTotalCost] = useState('');
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveStock, setLiveStock] = useState(null);

  const [actionType, setActionType] = useState('restock');
  const [quantity, setQuantity] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [reason, setReason] = useState('');
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setActionType('restock');
      setQuantity('');
      setExpirationDate('');
      setReason('');
      setIsCustomReason(false);
      setNotes('');
      setTotalCost('');
      setSelectedBatchId('');
      setLiveStock(null);
      setErrors({});
      setHasAttemptedSubmit(false);

      if (item) {
        fetchItemBatches(item.id)
          .then(data => setBatches(data || []))
          .catch(err => console.error("Error fetching batches:", err));

        fetchLiveItemStock(item.id)
          .then(stock => setLiveStock(stock))
          .catch(err => console.error("Error fetching live stock:", err));
      }
    }
  }, [isOpen, item]);

  // Auto-select oldest batch for Wastage/Correct
  useEffect(() => {
    if ((actionType === 'wastage' || actionType === 'correct') && batches.length > 0) {
      // Find oldest active batch (quantity > 0)
      const activeBatches = [...batches].filter(b => b.quantity > 0);

      // Sort by expiration_date (or received_date if no expiry)
      activeBatches.sort((a, b) => {
        const dateA = new Date(a.expiration_date || a.received_date);
        const dateB = new Date(b.expiration_date || b.received_date);
        return dateA - dateB;
      });

      if (activeBatches.length > 0) {
        setSelectedBatchId(activeBatches[0].id);
      } else {
        setSelectedBatchId(batches[0].id); // Fallback to first if all depleted
      }
    } else if (actionType === 'restock') {
      setSelectedBatchId('');
    }
  }, [batches, actionType]);

  // Use live stock if fetched, otherwise fallback to item prop
  const currentStock = liveStock !== null ? Number(liveStock) : (item ? Number(item.current_stock || 0) : 0);
  const unit = item ? item.base_unit || 'pcs' : 'pcs';
  const isExpiryTracked = item ? item.track_expiry : false;

  // Real-time validation and calculations
  useEffect(() => {
    if (!isOpen) return;
    const newErrors = {};
    const numQuantity = Number(quantity);

    if (quantity === '') {
      newErrors.quantity = 'Quantity is required.';
    } else if (isNaN(numQuantity)) {
      newErrors.quantity = 'Quantity must be a valid number.';
    } else if (actionType === 'restock' && numQuantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0.';
    } else if (actionType === 'wastage') {
      if (numQuantity <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0.';
      } else if (numQuantity > currentStock) {
        newErrors.quantity = `Cannot waste more than current stock (${currentStock}).`;
      }
    } else if (actionType === 'correct') {
      if (numQuantity < 0) {
        newErrors.quantity = 'Quantity cannot be negative.';
      } else if (numQuantity === currentStock) {
        newErrors.quantity = 'New stock is the same as current stock (no changes).';
      }
    }

    if (actionType === 'restock') {
      if (totalCost === '') {
        newErrors.totalCost = 'Total cost is required.';
      }
      if (isExpiryTracked && !expirationDate) {
        newErrors.expirationDate = 'Expiration date is required for tracked items.';
      }
    }

    if (actionType === 'wastage' || actionType === 'correct') {
      if (!selectedBatchId) {
        newErrors.selectedBatchId = 'Please select a batch.';
      }
    }

    if (!isCustomReason && !reason) {
      newErrors.reason = 'Reason is required.';
    } else if (isCustomReason && !reason.trim()) {
      newErrors.reason = 'Please specify a reason.';
    }

    setErrors(newErrors);
  }, [quantity, totalCost, reason, isCustomReason, actionType, isOpen, currentStock, selectedBatchId, isExpiryTracked, expirationDate]);

  if (!isOpen || !item) return null;

  const isFormValid = Object.keys(errors).length === 0;

  const handleSave = async () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const numQty = Number(quantity);
      const newTotalStock = actionType === 'restock' ? (currentStock + numQty) :
        actionType === 'wastage' ? Math.max(0, currentStock - numQty) : numQty;

      await logStockAdjustment({
        item,
        actionType,
        quantityChange: numQty,
        newTotalStock,
        userId: user?.id,
        reason,
        notes,
        totalCost: Number(totalCost) || 0,
        supplier: notes, // In restock, the 'notes' field acts as Supplier
        expirationDate,
        selectedBatchId
      });

      if (refetchInventory) refetchInventory();
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
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
        onClick={() => { setActionType('restock'); setReason(''); setSelectedBatchId(''); }}
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
          <option value="Others">Others (Please specify)</option>
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
          <option value="Others">Others (Please specify)</option>
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
        <option value="Others">Others (Please specify)</option>
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
            <input type="text" className="stocklog-input" value={item ? item.item_name : ''} readOnly />
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

          {/* Wastage/Correct View: Select Batch Dropdown */}
          {(actionType === 'wastage' || actionType === 'correct') && (
            <>
              <div className="stocklog-section">
                <label className="stocklog-label">Select Batch *</label>
                <select
                  className={`stocklog-select ${hasAttemptedSubmit && errors.selectedBatchId ? 'is-invalid' : ''}`}
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                >
                  {[...batches].sort((a, b) => {
                    if ((a.quantity > 0 && b.quantity > 0) || (a.quantity <= 0 && b.quantity <= 0)) return 0;
                    return a.quantity > 0 ? -1 : 1;
                  }).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.batch_number} ({b.quantity} left) {b.expiration_date ? `- Expires: ${b.expiration_date}` : ''}
                    </option>
                  ))}
                  {batches.length === 0 && (
                    <option value="" disabled>No batches available</option>
                  )}
                </select>
                {hasAttemptedSubmit && errors.selectedBatchId && (
                  <p className="stocklog-error-msg">{errors.selectedBatchId}</p>
                )}
                <div className="stocklog-subtext">
                  If the deduction exceeds this batch's stock, the remaining amount will automatically be deducted from the next oldest batch.
                </div>
              </div>
              <hr className="stocklog-divider" />
            </>
          )}

          {/* Quantity & Preview */}
          <div className="stocklog-section-row">
            <div className="stocklog-section">
              <label className="stocklog-label">{getQuantityLabel()} *</label>
              <input
                type="number"
                className={`stocklog-input ${hasAttemptedSubmit && errors.quantity ? 'is-invalid' : ''}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                min="0"
              />
              {hasAttemptedSubmit && errors.quantity && (
                <p className="stocklog-error-msg">{errors.quantity}</p>
              )}
            </div>
            <div className="stocklog-section">
              <label className="stocklog-label">{previewLabel}</label>
              <input type="text" className="stocklog-input" value={previewValue} readOnly />
            </div>
          </div>

          <hr className="stocklog-divider" />

          {/* Restock View: Total Cost & Expiration Date */}
          {actionType === 'restock' && (
            <>
              <div className="stocklog-section-row">
                <div className="stocklog-section">
                  <label className="stocklog-label">Total Cost (Amount Paid) *</label>
                  <input
                    type="number"
                    className={`stocklog-input ${hasAttemptedSubmit && errors.totalCost ? 'is-invalid' : ''}`}
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    placeholder="₱ 0.00"
                    min="0"
                  />
                  {hasAttemptedSubmit && errors.totalCost && (
                    <p className="stocklog-error-msg">{errors.totalCost}</p>
                  )}
                </div>

                {/* Expiration date on restock, required if isExpiryTracked */}
                <div className="stocklog-section">
                  <label className="stocklog-label">
                    Expiration Date {isExpiryTracked ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="date"
                    className={`stocklog-input ${hasAttemptedSubmit && errors.expirationDate ? 'is-invalid' : ''}`}
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                  {hasAttemptedSubmit && errors.expirationDate && (
                    <p className="stocklog-error-msg">{errors.expirationDate}</p>
                  )}
                </div>
              </div>

              <hr className="stocklog-divider" />
            </>
          )}

          {/* Reason & Notes */}
          <div className="stocklog-section-row">
            <div className="stocklog-section">
              <label className="stocklog-label">Reason *</label>
              {isCustomReason ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className={`stocklog-input ${hasAttemptedSubmit && errors.reason ? 'is-invalid' : ''}`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Others (please specify)"
                    autoFocus
                  />
                  <button
                    className="stocklog-btn-cancel"
                    style={{ padding: '0 12px', flexShrink: 0, margin: 0, height: '42px' }}
                    onClick={() => {
                      setIsCustomReason(false);
                      setReason('');
                    }}
                    title="Cancel custom reason"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ) : (
                <select
                  className={`stocklog-select ${hasAttemptedSubmit && errors.reason ? 'is-invalid' : ''}`}
                  value={reason}
                  onChange={(e) => {
                    if (e.target.value === 'Others') {
                      setIsCustomReason(true);
                      setReason('');
                    } else {
                      setReason(e.target.value);
                    }
                  }}
                >
                  <option value="" disabled>Select reason...</option>
                  {renderReasonOptions()}
                </select>
              )}
              {hasAttemptedSubmit && errors.reason && (
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

          {actionType === 'restock' && (
            <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: '#FAFAFA', border: '1px solid #E9ECEF', borderRadius: '8px', fontSize: '0.8rem', color: '#495057', display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
              <i className="bi bi-info-circle-fill" style={{ color: '#7A4B35', marginTop: '0.1rem' }}></i>
              <span>Recording a restock here will automatically be logged as an Inventory Purchase expense. The updated cost per unit will take effect once the new batch is utilized.</span>
            </div>
          )}
        </div>

        {hasAttemptedSubmit && !isFormValid && (
          <div style={{ color: '#dc3545', fontSize: '0.85rem', padding: '0 1.5rem', marginBottom: '1rem', textAlign: 'right', fontWeight: '500' }}>
            Please fill in all required fields (*)
          </div>
        )}

        <div className="stocklog-modal-footer">
          <button className="stocklog-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="stocklog-btn-save"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Log'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockLogModal;

