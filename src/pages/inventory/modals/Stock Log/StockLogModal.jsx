import { useMemo, useState } from 'react';

import { useRefreshInventoryAuditLogs } from '../../../../hooks/useInventoryAuditLogs';
import { useRefreshInventoryValuation } from '../../../../hooks/useInventoryValuation';
import { useRefreshSalesReport } from '../../../../hooks/useSalesReport';
import { correctInventoryStock } from '../../../../services/inventory/stock/correctionService';
import { restockInventoryItem } from '../../../../services/inventory/stock/restockService';
import { recordInventoryWastage } from '../../../../services/inventory/stock/wastageService';
import { validateStockLog } from '../../../../utils/validation/inventory/stockLogValidation';
import RestockFields from './components/RestockFields';
import RestockExpenseNotice from './components/RestockExpenseNotice';
import StockActionSelector from './components/StockActionSelector';
import StockBatchSelector from './components/StockBatchSelector';
import StockLogHeader from './components/StockLogHeader';
import StockQuantityFields from './components/StockQuantityFields';
import StockReasonFields from './components/StockReasonFields';

import './stockLogModal.css';

const getBatchTime = value => value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;

const compareOldestBatch = (a, b) => {
  const receivedDifference = getBatchTime(a.received_date) - getBatchTime(b.received_date);
  if (receivedDifference !== 0) return receivedDifference;

  const createdDifference = getBatchTime(a.created_at) - getBatchTime(b.created_at);
  if (createdDifference !== 0) return createdDifference;

  return a.batch_number.localeCompare(b.batch_number, undefined, { numeric: true });
};

const StockLogModal = ({ isOpen, onClose, refetchInventory, item }) => {
  const refreshAuditLogs = useRefreshInventoryAuditLogs();
  const refreshValuation = useRefreshInventoryValuation();
  const refreshSalesReport = useRefreshSalesReport();
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
      const aHasStock = Number(a.quantity) > 0;
      const bHasStock = Number(b.quantity) > 0;

      // Active batches always appear before depleted batches.
      if (aHasStock !== bHasStock) return aHasStock ? -1 : 1;

      if (aHasStock) {
        // Active batches use FEFO, with FIFO as the tie-breaker.
        const expirationDifference = getBatchTime(a.expiration_date) -
          getBatchTime(b.expiration_date);
        if (expirationDifference !== 0) return expirationDifference;
      }

      // Depleted batches and FEFO ties use oldest received batch first.
      return compareOldestBatch(a, b);
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

  const activeDefaultBatchId = batches.find(batch => Number(batch.quantity) > 0)?.id || '';
  const correctionDefaultBatchId = activeDefaultBatchId || batches[0]?.id || '';
  const defaultBatchId = actionType === 'correct'
    ? correctionDefaultBatchId
    : activeDefaultBatchId;
  const effectiveBatchId = actionType === 'restock' ? '' : selectedBatchId || defaultBatchId;
  const selectedBatchStock = Number(
    batches.find(batch => batch.id === effectiveBatchId)?.quantity || 0,
  );

  const errors = useMemo(() => validateStockLog({
    actionType,
    quantity,
    currentStock,
    totalCost,
    expirationDate,
    isExpiryTracked,
    selectedBatchId: effectiveBatchId,
    selectedBatchStock,
    reason,
  }), [actionType, quantity, currentStock, totalCost, expirationDate, isExpiryTracked, effectiveBatchId, selectedBatchStock, reason]);

  const preview = useMemo(() => {
    const numericQuantity = Number(quantity) || 0;
    const quantityChange = actionType === 'restock'
      ? numericQuantity
      : actionType === 'wastage'
        ? -numericQuantity
        : numericQuantity - selectedBatchStock;
    const stockAfter = currentStock + quantityChange;

    return {
      label: 'New Stock (preview)',
      stock: `${stockAfter} ${unit}`,
      change: quantity === ''
        ? null
        : `${quantityChange > 0 ? '+' : ''}${quantityChange} ${unit}`,
      tone: quantityChange > 0 ? 'positive' : quantityChange < 0 ? 'negative' : 'neutral',
    };
  }, [actionType, quantity, currentStock, selectedBatchStock, unit]);

  if (!isOpen || !item) return null;

  const handleActionChange = nextAction => {
    setActionType(nextAction);
    setSelectedBatchId(
      nextAction === 'restock'
        ? ''
        : nextAction === 'correct'
          ? correctionDefaultBatchId
          : activeDefaultBatchId,
    );
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

      // Wastage only needs stock details and the selected starting batch.
      const wastagePayload = {
        stockData: {
          quantity: numericQuantity,
          reason: reason.trim(),
          notes: notes.trim() || null,
        },
        batchData: {
          selected_batch_id: effectiveBatchId,
        },
      };

      // Correction sends the actual count of the selected batch.
      const correctionPayload = {
        stockData: {
          actual_batch_quantity: numericQuantity,
          reason: reason.trim(),
          notes: notes.trim() || null,
        },
        batchData: {
          selected_batch_id: effectiveBatchId,
        },
      };

      if (actionType === 'restock') {
        await restockInventoryItem(item.id, restockPayload);
      } else if (actionType === 'wastage') {
        await recordInventoryWastage(item.id, wastagePayload);
      } else {
        await correctInventoryStock(item.id, correctionPayload);
      }

      // Refresh the current Inventory page before closing the modal.
      if (refetchInventory) {
        await refetchInventory();
      }

      handleClose();

      // Refresh secondary pages without delaying the Inventory modal.
      const backgroundRefreshRequests = [
        refreshAuditLogs(),
        refreshValuation(),
      ];

      if (actionType === 'wastage') {
        backgroundRefreshRequests.push(refreshSalesReport());
      }

      Promise.allSettled(backgroundRefreshRequests);
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
                actionType={actionType}
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
            previewStock={preview.stock}
            previewChange={preview.change}
            previewTone={preview.tone}
            selectedBatchStock={selectedBatchStock}
            unit={unit}
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
