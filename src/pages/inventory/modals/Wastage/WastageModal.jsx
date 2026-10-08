import { useMemo, useRef, useState } from "react";

import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
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
import { toast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useRefreshInventoryAuditLogs } from "@/hooks/useInventoryAuditLogs";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { useRefreshInventoryValuation } from "@/hooks/useInventoryValuation";
import { useRefreshMenuManagement } from "@/hooks/useMenuManagement";
import { useRefreshPosManagement } from "@/hooks/usePosManagement";
import { useRefreshSalesReport } from "@/hooks/useSalesReport";
import { recordInventoryWastage } from "@/services/inventory/stock/wastageService";
import {
  getSortedStockActionBatches,
  getWastageSpilloverPreview,
} from "@/utils/inventory/inventoryStockActionUtils";
import { getInventorySaveErrorCode } from "@/utils/inventory/feedback/inventoryFeedback";
import {
  WASTAGE_FEEDBACK,
  getWastageInlineFeedback,
  getWastageStatusFeedback,
  getWastageToastFeedback,
} from "@/utils/inventory/feedback/wastageFeedback";
import { validateStockLog } from "@/utils/inventory/validation/stockLogValidation";
import { getQuantityRules } from "@/utils/inventory/quantityRules";

const wastageReasons = [
  "Expired",
  "Spoiled",
  "Damaged",
  "Spillage",
  "Wrong Preparation",
  "Burnt / Overcooked",
  "Contaminated",
  "Customer Return",
  "Overproduction",
  "Storage Issue",
  "Missing Item",
];

const labelClassName =
  "text-[length:var(--app-font-size-caption)] font-semibold leading-[var(--app-line-height-caption)] text-[var(--app-color-text)]";
const controlClassName =
  "h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0";
const readonlyClassName =
  "bg-[var(--app-color-canvas)] text-[var(--app-color-text-muted)]";

// Use the same preview in the form and confirmation; this is not a saved result.
const SpilloverPreview = ({ batches, unit, id, role }) => (
  <div id={id} role={role} className="flex min-w-0 items-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] p-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
    <i className="bi bi-info-circle-fill shrink-0 text-[var(--app-color-info)]" aria-hidden="true" />
    <div className="flex min-w-0 flex-1 flex-col gap-[var(--app-space-2)]">
      <p>{WASTAGE_FEEDBACK.SPILLOVER_NOTICE}</p>
      {batches.length > 0 && (
        <div>
          <p className="font-semibold">Expected spillover (current stock):</p>
          <ul className="flex flex-col gap-[var(--app-space-1)]">
            {batches.map((batch) => (
              <li key={batch.batchId} className="flex min-w-0 items-start justify-between gap-[var(--app-space-2)]">
                <strong className="min-w-0 break-words font-semibold">{batch.batchNumber}</strong>
                <span className="shrink-0">{batch.quantity} {unit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

const WastageModalContent = ({
  onClose,
  onWastageAgain,
  refetchInventory,
  inventoryItems,
  item,
}) => {
  const refreshAuditLogs = useRefreshInventoryAuditLogs();
  const refreshValuation = useRefreshInventoryValuation();
  const refreshMenuManagement = useRefreshMenuManagement();
  const refreshPosManagement = useRefreshPosManagement();
  const refreshSalesReport = useRefreshSalesReport();
  const [selectedItem, setSelectedItem] = useState(item ?? null);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [reason, setReason] = useState("");
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const fieldsRef = useRef(null);
  const operationInFlight = useRef(false);
  const savedWastageResponse = useRef(null);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getWastageInlineFeedback);
  const fieldsDisabled = isSubmitting || isConfirmationOpen || hasSaved;

  const currentStock = Number(selectedItem?.current_stock || 0);
  const numericQuantity = Number(quantity) || 0;
  const finalStock = currentStock - numericQuantity;
  const unit = selectedItem?.base_unit || "pcs";
  const batches = useMemo(
    () => getSortedStockActionBatches(selectedItem),
    [selectedItem],
  );
  const defaultBatchId =
    batches.find((batch) => Number(batch.quantity) > 0)?.id ?? "";
  const effectiveBatchId = selectedBatchId || defaultBatchId;
  const selectedBatch = batches.find(
    (batch) => String(batch.id) === String(effectiveBatchId),
  );
  const selectedBatchStock = Number(selectedBatch?.quantity || 0);
  const hasSpillover = Boolean(selectedBatch) && selectedBatchStock > 0 &&
    numericQuantity > selectedBatchStock && numericQuantity <= currentStock;
  const spilloverBatches = useMemo(() => {
    if (!hasSpillover) return [];
    return getWastageSpilloverPreview(selectedItem, effectiveBatchId, quantity);
  }, [hasSpillover, selectedItem, effectiveBatchId, quantity]);

  const validation = useMemo(() => {
    return validateStockLog({
      selectedItem,
      actionType: "wastage",
      quantity,
      currentStock,
      totalCost: "",
      expirationDate: "",
      isExpiryTracked: false,
      selectedBatchId: effectiveBatchId,
      selectedBatchStock,
      reason,
    });

  }, [
    currentStock,
    effectiveBatchId,
    quantity,
    reason,
    selectedBatchStock,
    selectedItem,
  ]);
  const { errors, isFormValid } = validation;

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

  const validateForm = () => {
    setHasAttemptedSubmit(true);
    clearFeedback();

    if (!isFormValid) {
      requestAnimationFrame(() => {
        if (!fieldsRef.current) return;
        const firstInvalidField = fieldsRef.current.querySelector('[aria-invalid="true"]');
        if (firstInvalidField) firstInvalidField.focus();
      });
      return false;
    }
    return true;
  };

  const handleReview = () => {
    if (operationInFlight.current || isConfirmationOpen || hasSaved || hasUnconfirmedSave) return;
    if (validateForm()) setIsConfirmationOpen(true);
  };

  const handleClose = () => {
    if (!operationInFlight.current && !isConfirmationOpen && !hasSaved) onClose();
  };

  // Once saved, recovery may only repeat the read, never the wastage deduction.
  const refreshSavedInventory = async () => {
    try {
      if (refetchInventory) {
        const result = await refetchInventory();
        if (result && (result.isError || result.error)) {
          showFeedback("REFRESH_FAILED");
          return;
        }
      }
    } catch {
      showFeedback("REFRESH_FAILED");
      return;
    }

    clearFeedback();
    const response = savedWastageResponse.current;
    const savedItem = response && response.item;
    const toastDetails = {
      quantity: Number(quantity),
      itemName: selectedItem.item_name,
      reason: reason.trim(),
      totalStock: savedItem ? savedItem.current_stock : undefined,
      unit: savedItem ? savedItem.base_unit : unit,
      // The response does not identify spillover batches; label the selected batch only.
      batchNumber: selectedBatch.batch_number,
      hasSpillover,
    };
    let toastId;
    if (onWastageAgain) {
      toastDetails.onWastageAgain = () => {
        toast.close(toastId);
        onWastageAgain();
      };
    }
    toastId = toast.add(getWastageToastFeedback("WASTAGE_SAVED", toastDetails));
    onClose();

    // This success confirms Inventory only; preserve existing background consumers.
    Promise.allSettled([
      refreshAuditLogs(),
      refreshValuation(),
      refreshMenuManagement(),
      refreshPosManagement(),
      refreshSalesReport(),
    ]);
  };

  const handleSave = async () => {
    if (operationInFlight.current || hasSaved || hasUnconfirmedSave) return;
    setIsConfirmationOpen(false);
    if (!validateForm()) return;

    operationInFlight.current = true;
    setIsSubmitting(true);

    try {
      try {
        savedWastageResponse.current = await recordInventoryWastage(selectedItem.id, {
          stockData: {
            quantity: Number(quantity),
            reason: reason.trim(),
            notes: notes.trim() || null,
          },
          batchData: {
            selected_batch_id: effectiveBatchId,
          },
        });
      } catch (error) {
        const errorCode = getInventorySaveErrorCode(error);
        showFeedback(errorCode);
        if (errorCode === "SAVE_UNCONFIRMED") setHasUnconfirmedSave(true);
        return;
      }

      setHasSaved(true);
      await refreshSavedInventory();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !hasSaved) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    try {
      await refreshSavedInventory();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let blockingCode = "STOCK_SAVING";
  if (hasSaved) blockingCode = "INVENTORY_REFRESHING";
  if (isRefreshError) blockingCode = "INVENTORY_REFRESH_FAILED";
  const blockingFeedback = getWastageStatusFeedback(blockingCode);
  let blockingAction;
  if (isRefreshError) {
    blockingAction = { label: blockingFeedback.buttonLabel, onClick: handleRetryRefresh };
  }

  return (
    <>
    <Modal
      isOpen={!isSubmitting && !hasSaved}
      onClose={handleClose}
      maxWidth="32rem"
      maxHeight="min(90svh, 46rem)"
    >
      <ModalHeader
        title="Log Wastage"
        description="Remove stock due to spoilage, damage, or loss."
        iconClassName="bi bi-droplet-fill"
        closeDisabled={fieldsDisabled}
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
        <ModalContent>
          <InlineFeedback feedback={feedback} id="wastage-action-feedback" />
          <fieldset ref={fieldsRef} disabled={fieldsDisabled} aria-busy={isSubmitting} className="flex min-w-0 flex-col gap-[var(--app-gap-related)] border-0 p-0">
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
                disabled={Boolean(item) || fieldsDisabled}
              >
                <ComboboxInput
                  placeholder="Select an inventory item"
                  disabled={Boolean(item) || fieldsDisabled}
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
              <FieldLabel htmlFor="wastage-batch" className={labelClassName}>
                Batch
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>
              <Select
                value={effectiveBatchId ? String(effectiveBatchId) : null}
                onValueChange={setSelectedBatchId}
                disabled={!selectedItem || fieldsDisabled}
              >
                <SelectTrigger
                  id="wastage-batch"
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
                    <SelectItem
                      key={batch.id}
                      value={String(batch.id)}
                      disabled={Number(batch.quantity) <= 0}
                    >
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
                <FieldLabel htmlFor="wastage-reason" className={labelClassName}>
                  Reason
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                {isCustomReason ? (
                  <div className="flex gap-[var(--app-space-2)]">
                    <Input
                      id="wastage-reason"
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
                    disabled={fieldsDisabled}
                  >
                    <SelectTrigger
                      id="wastage-reason"
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
                      {wastageReasons.map((option) => (
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
                <FieldLabel htmlFor="wastage-notes" className={labelClassName}>
                  Note
                </FieldLabel>
                <Input
                  id="wastage-notes"
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
                  htmlFor="wastage-stock-on-hand"
                  className={labelClassName}
                >
                  Stock on Hand
                </FieldLabel>
                <Input
                  id="wastage-stock-on-hand"
                  value={selectedItem ? `${currentStock} ${unit}` : "—"}
                  readOnly
                  aria-readonly="true"
                  className={`${controlClassName} ${readonlyClassName}`}
                />
              </Field>

              <Field
                data-invalid={hasAttemptedSubmit && Boolean(errors.quantity)}
              >
                <FieldLabel
                  htmlFor="wastage-quantity"
                  className={labelClassName}
                >
                  Qty Lost
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                <Input
                  id="wastage-quantity"
                  type="number"
                  min="1"
                  step={getQuantityRules(unit).step}
                  inputMode={getQuantityRules(unit).inputMode}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="0"
                  aria-invalid={hasAttemptedSubmit && Boolean(errors.quantity)}
                  aria-describedby={hasSpillover ? "wastage-spillover-notice" : undefined}
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
                  htmlFor="wastage-final-stock"
                  className={labelClassName}
                >
                  Final Stock
                </FieldLabel>
                <Input
                  id="wastage-final-stock"
                  value={selectedItem ? `${finalStock} ${unit}` : "—"}
                  readOnly
                  aria-readonly="true"
                  className={`${controlClassName} ${readonlyClassName} ${numericQuantity > 0 ? "font-semibold !text-[var(--app-color-danger)]" : ""}`}
                />
              </Field>
            </div>
            {hasSpillover && (
              <SpilloverPreview
                id="wastage-spillover-notice"
                role="status"
                batches={spilloverBatches}
                unit={unit}
              />
            )}
          </fieldset>
        </ModalContent>
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          disabled={fieldsDisabled}
          onClick={handleClose}
          className="min-h-[var(--app-touch-target-min)] min-w-24 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-border-subtle)]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={fieldsDisabled || hasUnconfirmedSave}
          onClick={handleReview}
          aria-describedby={feedback ? "wastage-action-feedback" : undefined}
          className="min-h-[var(--app-touch-target-min)] min-w-32 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {hasUnconfirmedSave && feedback ? feedback.buttonLabel : "Log Wastage"}
        </Button>
      </ModalFooter>
      <ActionAlertDialog
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        type="small"
        title="Confirm wastage?"
        description={
          <>
            Remove <strong className="font-semibold">{quantity} {unit}</strong> from{" "}
            <strong className="font-semibold">{selectedItem && selectedItem.item_name}</strong>, starting with batch{" "}
            <strong className="font-semibold">{selectedBatch && selectedBatch.batch_number}</strong>?
          </>
        }
        actions={[
          { key: "cancel", label: "Cancel", close: true },
          { key: "confirm", label: "Confirm", onClick: handleSave, disabled: isSubmitting },
        ]}
      >
        {hasSpillover && <SpilloverPreview batches={spilloverBatches} unit={unit} />}
      </ActionAlertDialog>
    </Modal>
    <BlockingFeedback
      open={isSubmitting || hasSaved}
      status={isRefreshError ? "error" : "loading"}
      title={blockingFeedback.title}
      message={blockingFeedback.message}
      action={blockingAction}
    />
    </>
  );
};

const WastageModal = ({
  isOpen,
  onClose,
  onWastageAgain,
  refetchInventory,
  inventoryItems = [],
  item = null,
}) => {
  if (!isOpen) return null;

  return (
    <WastageModalContent
      onClose={onClose}
      onWastageAgain={onWastageAgain}
      refetchInventory={refetchInventory}
      inventoryItems={inventoryItems}
      item={item}
    />
  );
};

export default WastageModal;
