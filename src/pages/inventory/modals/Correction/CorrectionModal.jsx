import { useMemo, useState } from "react";

import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useRefreshInventoryAuditLogs } from "@/hooks/useInventoryAuditLogs";
import { useRefreshInventoryValuation } from "@/hooks/useInventoryValuation";
import { useRefreshMenuManagement } from "@/hooks/useMenuManagement";
import { useRefreshPosManagement } from "@/hooks/usePosManagement";
import { correctInventoryStock } from "@/services/inventory/stock/correctionService";
import { getSortedStockActionBatches } from "@/utils/inventory/inventoryStockActionUtils";
import { validateStockLog } from "@/utils/validation/inventory/stockLogValidation";

const correctionReasons = [
  "Physical Count Mismatch",
  "Encoding Error",
  "Unit Conversion Error",
  "Duplicate Entry Correction",
  "Unrecorded Stock Movement",
  "System Sync Error",
  "Batch Count Correction",
  "Audit Adjustment",
];

const labelClassName =
  "text-[length:var(--app-font-size-caption)] font-semibold leading-[var(--app-line-height-caption)] text-[var(--app-color-text)]";
const controlClassName =
  "h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0";
const readonlyClassName =
  "bg-[var(--app-color-canvas)] text-[var(--app-color-text-muted)]";

const CorrectionModalContent = ({
  onClose,
  refetchInventory,
  inventoryItems,
  item,
}) => {
  const refreshAuditLogs = useRefreshInventoryAuditLogs();
  const refreshValuation = useRefreshInventoryValuation();
  const refreshMenuManagement = useRefreshMenuManagement();
  const refreshPosManagement = useRefreshPosManagement();
  const [selectedItem, setSelectedItem] = useState(item ?? null);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [reason, setReason] = useState("");
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [notes, setNotes] = useState("");
  const [actualItemCount, setActualItemCount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const unit = selectedItem?.base_unit || "pcs";
  const batches = useMemo(
    () => getSortedStockActionBatches(selectedItem),
    [selectedItem],
  );
  const defaultBatchId =
    batches.find((batch) => Number(batch.quantity) > 0)?.id ??
    batches[0]?.id ??
    "";
  const effectiveBatchId = selectedBatchId || defaultBatchId;
  const selectedBatch = batches.find(
    (batch) => String(batch.id) === String(effectiveBatchId),
  );
  const selectedBatchStock = Number(selectedBatch?.quantity || 0);
  const numericActualCount = Number(actualItemCount) || 0;
  const difference = numericActualCount - selectedBatchStock;

  const errors = useMemo(() => {
    const nextErrors = validateStockLog({
      actionType: "correct",
      quantity: actualItemCount,
      currentStock: Number(selectedItem?.current_stock || 0),
      totalCost: "",
      expirationDate: "",
      isExpiryTracked: false,
      selectedBatchId: effectiveBatchId,
      selectedBatchStock,
      reason,
    });

    if (!selectedItem) {
      nextErrors.item = "Please select an inventory item.";
    }

    return nextErrors;
  }, [
    actualItemCount,
    effectiveBatchId,
    reason,
    selectedBatchStock,
    selectedItem,
  ]);

  const handleItemChange = (nextItem) => {
    setSelectedItem(nextItem);
    setSelectedBatchId("");
  };

  const handleReasonChange = (nextReason) => {
    if (nextReason === "Others") {
      setIsCustomReason(true);
      setReason("");
      return;
    }

    setReason(nextReason);
  };

  const handleSave = async () => {
    setHasAttemptedSubmit(true);

    if (Object.keys(errors).length > 0 || isSubmitting || !selectedItem) return;

    setIsSubmitting(true);

    try {
      await correctInventoryStock(selectedItem.id, {
        stockData: {
          actual_batch_quantity: Number(actualItemCount),
          reason: reason.trim(),
          notes: notes.trim() || null,
        },
        batchData: {
          selected_batch_id: effectiveBatchId,
        },
      });

      if (refetchInventory) {
        await refetchInventory();
      }

      onClose();

      Promise.allSettled([
        refreshAuditLogs(),
        refreshValuation(),
        refreshMenuManagement(),
        refreshPosManagement(),
      ]);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="32rem"
      maxHeight="min(90svh, 46rem)"
    >
      <ModalHeader
        title="Inventory Correction"
        description="Adjust stock based on the actual physical item count."
        iconClassName="bi bi-arrow-counterclockwise"
        closeDisabled={isSubmitting}
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
        <ModalContent>
          <div className="flex flex-col gap-[var(--app-gap-related)]">
            <Field data-invalid={hasAttemptedSubmit && Boolean(errors.item)}>
              <FieldLabel className={labelClassName}>
                Item Name
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>
              <Combobox
                items={inventoryItems}
                value={selectedItem}
                onValueChange={handleItemChange}
                itemToStringLabel={(inventoryItem) =>
                  inventoryItem?.item_name ?? ""
                }
                itemToStringValue={(inventoryItem) =>
                  String(inventoryItem?.id ?? "")
                }
                isItemEqualToValue={(inventoryItem, value) =>
                  inventoryItem?.id === value?.id
                }
                disabled={Boolean(item)}
              >
                <ComboboxInput
                  placeholder="Select an inventory item"
                  disabled={Boolean(item)}
                  aria-invalid={hasAttemptedSubmit && Boolean(errors.item)}
                  className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] has-aria-invalid:border-[var(--app-color-danger)]"
                />
                <ComboboxContent
                  positionerClassName="!z-[1100]"
                  className="z-[1100] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)]  ring-0"
                >
                  <ComboboxEmpty>No inventory item found.</ComboboxEmpty>
                  <ComboboxList>
                    {(inventoryItem) => (
                      <ComboboxItem
                        key={inventoryItem.id}
                        value={inventoryItem}
                        className="min-h-[var(--app-touch-target-min)] gap-[var(--app-space-2)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {inventoryItem.item_name}
                        </span>
                        <em className="shrink-0 text-[length:var(--app-font-size-caption)] font-normal text-[var(--app-color-text-subtle)]">
                          {Number(inventoryItem.current_stock || 0)}{" "}
                          {inventoryItem.base_unit || "pcs"} available
                        </em>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {hasAttemptedSubmit && errors.item && (
                <FieldError className="text-[length:var(--app-font-size-caption)]">
                  {errors.item}
                </FieldError>
              )}
            </Field>

            <Field
              data-invalid={
                hasAttemptedSubmit && Boolean(errors.selectedBatchId)
              }
            >
              <FieldLabel htmlFor="correction-batch" className={labelClassName}>
                Batch
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>
              <Select
                value={effectiveBatchId ? String(effectiveBatchId) : null}
                onValueChange={setSelectedBatchId}
                disabled={!selectedItem}
              >
                <SelectTrigger
                  id="correction-batch"
                  aria-invalid={
                    hasAttemptedSubmit && Boolean(errors.selectedBatchId)
                  }
                  className={`data-[size=default]:!h-[var(--app-touch-target-min)] w-full ${controlClassName}`}
                >
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-[var(--app-space-2)]">
                    <span className="truncate">
                      {selectedBatch?.batch_number ?? "Select batch"}
                    </span>
                    {selectedBatch && (
                      <em className="shrink-0 text-[length:var(--app-font-size-caption)] font-normal text-[var(--app-color-text-subtle)]">
                        {selectedBatch.quantity} {unit} available
                      </em>
                    )}
                  </span>
                </SelectTrigger>
                <SelectContent
                  positionerClassName="!z-[1100]"
                  className="z-[1100]"
                >
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={String(batch.id)}>
                      <span className="flex w-full items-center justify-between gap-[var(--app-space-2)]">
                        <span className="truncate">{batch.batch_number}</span>
                        <em className="shrink-0 text-[length:var(--app-font-size-caption)] font-normal text-[var(--app-color-text-subtle)]">
                          {batch.quantity} {unit} available
                        </em>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasAttemptedSubmit && errors.selectedBatchId && (
                <FieldError className="text-[length:var(--app-font-size-caption)]">
                  {errors.selectedBatchId}
                </FieldError>
              )}
            </Field>

            <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
              <Field
                data-invalid={hasAttemptedSubmit && Boolean(errors.reason)}
              >
                <FieldLabel
                  htmlFor="correction-reason"
                  className={labelClassName}
                >
                  Reason
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                {isCustomReason ? (
                  <div className="flex gap-[var(--app-space-2)]">
                    <Input
                      id="correction-reason"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Please specify"
                      autoFocus
                      aria-invalid={
                        hasAttemptedSubmit && Boolean(errors.reason)
                      }
                      className={controlClassName}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-[var(--app-touch-target-min)] shrink-0 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)]"
                      onClick={() => {
                        setIsCustomReason(false);
                        setReason("");
                      }}
                      aria-label="Cancel custom reason"
                    >
                      <i className="bi bi-x-lg" aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={reason || null}
                    onValueChange={handleReasonChange}
                  >
                    <SelectTrigger
                      id="correction-reason"
                      aria-invalid={
                        hasAttemptedSubmit && Boolean(errors.reason)
                      }
                      className={`data-[size=default]:!h-[var(--app-touch-target-min)] w-full ${controlClassName}`}
                    >
                      <span>{reason || "Select reason"}</span>
                    </SelectTrigger>
                    <SelectContent
                      positionerClassName="!z-[1100]"
                      className="z-[1100]"
                    >
                      {correctionReasons.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                      <SelectItem value="Others">
                        Others (Please specify)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {hasAttemptedSubmit && errors.reason && (
                  <FieldError className="text-[length:var(--app-font-size-caption)]">
                    {errors.reason}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="correction-notes"
                  className={labelClassName}
                >
                  Note
                </FieldLabel>
                <Input
                  id="correction-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Enter optional note"
                  className={controlClassName}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-[var(--app-space-2)] sm:grid-cols-3">
              <Field>
                <FieldLabel
                  htmlFor="correction-stock-on-hand"
                  className={labelClassName}
                >
                  Stock on Hand
                </FieldLabel>
                <Input
                  id="correction-stock-on-hand"
                  value={
                    effectiveBatchId ? `${selectedBatchStock} ${unit}` : "—"
                  }
                  readOnly
                  aria-readonly="true"
                  className={`${controlClassName} ${readonlyClassName}`}
                />
              </Field>

              <Field
                data-invalid={hasAttemptedSubmit && Boolean(errors.quantity)}
              >
                <FieldLabel
                  htmlFor="correction-actual-count"
                  className={labelClassName}
                >
                  Actual Item Count
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                <Input
                  id="correction-actual-count"
                  type="number"
                  min="1"
                  value={actualItemCount}
                  onChange={(event) => setActualItemCount(event.target.value)}
                  placeholder="0"
                  aria-invalid={hasAttemptedSubmit && Boolean(errors.quantity)}
                  className={controlClassName}
                />
                {hasAttemptedSubmit && errors.quantity && (
                  <FieldError className="text-[length:var(--app-font-size-caption)]">
                    {errors.quantity}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="correction-difference"
                  className={labelClassName}
                >
                  Difference
                </FieldLabel>
                <Input
                  id="correction-difference"
                  value={
                    effectiveBatchId
                      ? `${difference > 0 ? "+" : ""}${difference} ${unit}`
                      : "—"
                  }
                  readOnly
                  aria-readonly="true"
                  className={`${controlClassName} ${readonlyClassName} ${difference > 0 ? "font-semibold !text-[var(--app-color-success)]" : difference < 0 ? "font-semibold !text-[var(--app-color-danger)]" : ""}`}
                />
              </Field>
            </div>
          </div>
        </ModalContent>
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onClose}
          className="min-h-[var(--app-touch-target-min)] min-w-24 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-border-subtle)]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleSave}
          className="min-h-[var(--app-touch-target-min)] min-w-32 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {isSubmitting ? "Saving..." : "Apply Correction"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const CorrectionModal = ({
  isOpen,
  onClose,
  refetchInventory,
  inventoryItems = [],
  item = null,
}) => {
  if (!isOpen) return null;

  return (
    <CorrectionModalContent
      onClose={onClose}
      refetchInventory={refetchInventory}
      inventoryItems={inventoryItems}
      item={item}
    />
  );
};

export default CorrectionModal;
