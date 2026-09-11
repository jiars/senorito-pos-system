import { useMemo, useState } from 'react';

import { useAuth } from '../../../../hooks/useAuth';
import { logStockAdjustment } from '../../../../services/inventory/inventoryStockService';
import { restockInventoryItem } from '../../../../services/inventory/stock/restockService';
import { validateStockLog } from '../../../../utils/validation/inventory/stockLogValidation';
import RestockFields from './components/RestockFields';
import RestockExpenseNotice from './components/RestockExpenseNotice';
import StockActionSelector from './components/StockActionSelector';
import StockBatchSelector from './components/StockBatchSelector';
import StockLogHeader from './components/StockLogHeader';
import StockQuantityFields from './components/StockQuantityFields';
import StockReasonFields from './components/StockReasonFields';

import './stockLogModal.css';

const StockLogModal = ({ isOpen, onClose, refetchInventory, item }) => {
  const { user } = useAuth();
  const [actionType, setActionType] = useState('restock');
  const [quantity, setQuantity] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [reason, setReason] = useState('');
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const currentStock = Number(item?.current_stock || 0);
  const unit = item?.base_unit || 'pcs';
  const isExpiryTracked = Boolean(item?.track_expiry);

  // Batches already come from the unified Inventory init request.
  const batches = useMemo(() => {
    return [...(item?.inventory_batches || [])].sort((a, b) => {
      if ((a.quantity > 0) !== (b.quantity > 0)) return a.quantity > 0 ? -1 : 1;
      return new Date(a.expiration_date || a.received_date || a.created_at) -
        new Date(b.expiration_date || b.received_date || b.created_at);
    });
  }, [item]);

  const resetForm = () => {
    setActionType('restock');
    setQuantity('');
    setTotalCost('');
    setExpirationDate('');
    setSelectedBatchId('');
    setReason('');
    setIsCustomReason(false);
    setNotes('');
    setIsSubmitting(false);
    setHasAttemptedSubmit(false);
  };

  const defaultBatchId = batches.find(batch => Number(batch.quantity) > 0)?.id || batches[0]?.id || '';
  const effectiveBatchId = actionType === 'restock' ? '' : selectedBatchId || defaultBatchId;

  const errors = useMemo(() => validateStockLog({
    actionType,
    quantity,
    currentStock,
    totalCost,
    expirationDate,
    isExpiryTracked,
    selectedBatchId: effectiveBatchId,
    reason,
  }), [actionType, quantity, currentStock, totalCost, expirationDate, isExpiryTracked, effectiveBatchId, reason]);

  const preview = useMemo(() => {
    const numericQuantity = Number(quantity) || 0;
    if (actionType === 'correct') {
      const difference = numericQuantity - currentStock;
      return {
        label: 'Difference',
        value: quantity === '' ? '-' : `${difference > 0 ? '+' : ''}${difference} ${unit}`,
      };
    }

    const stockAfter = actionType === 'restock'
      ? currentStock + numericQuantity
      : Math.max(0, currentStock - numericQuantity);
    return { label: 'New Stock (preview)', value: `${stockAfter} ${unit}` };
  }, [actionType, quantity, currentStock, unit]);

  if (!isOpen || !item) return null;

  const handleActionChange = nextAction => {
    setActionType(nextAction);
    setSelectedBatchId(nextAction === 'restock' ? '' : defaultBatchId);
    setReason('');
    setIsCustomReason(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    setHasAttemptedSubmit(true);
    if (Object.keys(errors).length > 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const numericQuantity = Number(quantity);
      const newTotalStock = actionType === 'restock'
        ? currentStock + numericQuantity
        : actionType === 'wastage'
          ? currentStock - numericQuantity
          : numericQuantity;

      // Restock sends one nested payload to its Laravel orchestrator.
      const restockPayload = {
        stockData: {
          quantity: numericQuantity,
          reason: reason.trim(),
          notes: notes.trim() || null,
        },
        purchaseData: {
          total_cost: Number(totalCost) || 0,
          supplier: notes.trim() || null,
          expiration_date: expirationDate || null,
        },
      };

      // Keep the old payload for Wastage and Correction until migrated.
      const legacyAdjustmentPayload = {
        item: { ...item, current_stock: currentStock },
        actionType,
        quantityChange: numericQuantity,
        newTotalStock,
        userId: user?.id,
        reason: reason.trim(),
        notes: notes.trim(),
        totalCost: Number(totalCost) || 0,
        supplier: actionType === 'restock' ? notes.trim() : null,
        expirationDate: expirationDate || null,
        selectedBatchId: effectiveBatchId || null,
      };

      if (actionType === 'restock') {
        await restockInventoryItem(item.id, restockPayload);
      } else {
        await logStockAdjustment(legacyAdjustmentPayload);
      }
      if (refetchInventory) await refetchInventory();
      handleClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stocklog-modal-overlay">
      <div className="stocklog-modal-content">
        <StockLogHeader onClose={handleClose} isSubmitting={isSubmitting} />

        <div className="stocklog-modal-body">
          <div className="stocklog-section">
            <label className="stocklog-label">Item</label>
            <input type="text" className="stocklog-input" value={item.item_name} readOnly />
            <div className="stocklog-subtext">
              Current stock: <strong>{currentStock} {unit}</strong>
            </div>
          </div>

          <hr className="stocklog-divider" />
          <StockActionSelector actionType={actionType} onChange={handleActionChange} />
          <hr className="stocklog-divider" />

          {actionType !== 'restock' && (
            <>
              <StockBatchSelector
                batches={batches}
                value={effectiveBatchId}
                onChange={setSelectedBatchId}
                error={errors.selectedBatchId}
                showError={hasAttemptedSubmit}
              />
              <hr className="stocklog-divider" />
            </>
          )}

          <StockQuantityFields
            actionType={actionType}
            quantity={quantity}
            setQuantity={setQuantity}
            previewLabel={preview.label}
            previewValue={preview.value}
            error={errors.quantity}
            showError={hasAttemptedSubmit}
          />

          {actionType === 'restock' && (
            <>
              <hr className="stocklog-divider" />
              <RestockFields
                totalCost={totalCost}
                setTotalCost={setTotalCost}
                expirationDate={expirationDate}
                setExpirationDate={setExpirationDate}
                isExpiryTracked={isExpiryTracked}
                errors={errors}
                showErrors={hasAttemptedSubmit}
              />
            </>
          )}

          <hr className="stocklog-divider" />
          <StockReasonFields
            actionType={actionType}
            reason={reason}
            setReason={setReason}
            isCustomReason={isCustomReason}
            setIsCustomReason={setIsCustomReason}
            notes={notes}
            setNotes={setNotes}
            error={errors.reason}
            showError={hasAttemptedSubmit}
          />

          {actionType === 'restock' && <RestockExpenseNotice />}
        </div>

        {hasAttemptedSubmit && Object.keys(errors).length > 0 && (
          <div className="stocklog-form-error">Please fix the required fields.</div>
        )}

        <div className="stocklog-modal-footer">
          <button type="button" className="stocklog-btn-cancel" onClick={handleClose} disabled={isSubmitting}>Cancel</button>
          <button type="button" className="stocklog-btn-save" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Log'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockLogModal;
