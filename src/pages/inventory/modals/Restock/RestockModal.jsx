import { useEffect, useMemo, useRef, useState } from "react";
import { addYears, format, parseISO } from "date-fns";

import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import StatusFeedback from "@/components/feedback/status/StatusFeedback";
import { Skeleton } from "@/components/ui/skeleton";
import { getQrStatusFeedback } from "@/utils/inventory/feedback/qrFeedback";
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
import DatePicker from "@/components/ui/date-picker";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { restockInventoryItem } from "@/services/inventory/stock/restockService";
import { getInventorySaveErrorCode } from "@/utils/inventory/feedback/inventoryFeedback";
import {
  getRestockInlineFeedback,
  getRestockStatusFeedback,
  getRestockToastFeedback,
} from "@/utils/inventory/feedback/restockFeedback";
import { validateStockLog } from "@/utils/inventory/validation/stockLogValidation";
import { getQuantityRules } from "@/utils/inventory/quantityRules";

const restockReasons = [
  "Initial Stock",
  "Supplier Delivery",
  "Manual Stock Addition",
  "Owner Adjustment",
];

const labelClassName =
  "text-[length:var(--app-font-size-caption)] font-semibold leading-[var(--app-line-height-caption)] text-[var(--app-color-text)]";
const controlClassName =
  "h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0";
const readonlyClassName =
  "bg-[var(--app-color-canvas)] text-[var(--app-color-text-muted)]";

const RestockModalContent = ({
  onClose,
  onRestockAgain,
  refetchInventory,
  inventoryItems,
  item,
  qrItemId,
  isLoadingQr,
  qrLoadError,
  isQrArchived,
}) => {
  const refreshAuditLogs = useRefreshInventoryAuditLogs();
  const refreshValuation = useRefreshInventoryValuation();
  const refreshMenuManagement = useRefreshMenuManagement();
  const refreshPosManagement = useRefreshPosManagement();
  const [selectedItem, setSelectedItem] = useState(() => {
    if (qrItemId !== null && (isLoadingQr || qrLoadError || isQrArchived)) return null;
    return item ?? null;
  });
  // Resolve the QR selection once; background refresh must not reset the form.
  useEffect(() => {
    if (qrItemId !== null && !selectedItem && !isLoadingQr && !qrLoadError && !isQrArchived && item) {
      setSelectedItem(item);
    }
  }, [qrItemId, selectedItem, isLoadingQr, qrLoadError, isQrArchived, item]);

  const showQrPlaceholder = qrItemId !== null && !selectedItem;
  let qrFeedback = null;
  if (showQrPlaceholder && !isLoadingQr) {
    if (qrLoadError) qrFeedback = getQrStatusFeedback("QR_LOAD_FAILED");
    else if (isQrArchived) qrFeedback = getQrStatusFeedback("QR_ITEM_ARCHIVED");
    else if (!item) qrFeedback = getQrStatusFeedback("QR_ITEM_MISSING");
  }
  const [supplier, setSupplier] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [reason, setReason] = useState("");
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [isExpirationInputValid, setIsExpirationInputValid] = useState(true);
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const operationInFlight = useRef(false);
  const savedRestockResponse = useRef(null);
  const fieldsRef = useRef(null);
  const { feedback, showFeedback, clearFeedback } = useFeedback(
    getRestockInlineFeedback,
  );
  const fieldsDisabled = isSubmitting || hasSaved || isConfirmationOpen;
  const today = format(new Date(), "yyyy-MM-dd");
  const expirationLimits = useMemo(() => {
    const minDate = parseISO(today);
    return { minDate, maxDate: addYears(minDate, 10) };
  }, [today]);
  const maxExpirationDate = format(expirationLimits.maxDate, "yyyy-MM-dd");

  const currentStock = Number(selectedItem?.current_stock || 0);
  const numericQuantity = Number(quantity) || 0;
  const finalStock = currentStock + numericQuantity;
  const unit = selectedItem?.base_unit || "pcs";
  const isExpiryTracked = Boolean(selectedItem?.track_expiry);

  const validation = useMemo(() => {
    return validateStockLog({
      selectedItem,
      isExpirationInputValid,
      actionType: "restock",
      quantity,
      currentStock,
      totalCost,
      expirationDate,
      minExpirationDate: today,
      maxExpirationDate,
      isExpiryTracked: Boolean(selectedItem?.track_expiry),
      selectedBatchId: "",
      selectedBatchStock: 0,
      reason,
    });

  }, [currentStock, expirationDate, quantity, reason, selectedItem, totalCost, today, maxExpirationDate, isExpirationInputValid]);
  const { errors, isFormValid } = validation;

  // A saved stock change must only retry the read, never the stock mutation.
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
    const response = savedRestockResponse.current;
    const savedItem = response && response.item;
    const toastDetails = {
      quantity: Number(quantity),
      itemName: selectedItem.item_name,
      totalCost: Number(totalCost),
      totalStock: savedItem ? savedItem.current_stock : undefined,
      unit: savedItem ? savedItem.base_unit : unit,
    };
    let toastId;
    if (onRestockAgain) {
      toastDetails.onRestockAgain = () => {
        toast.close(toastId);
        onRestockAgain();
      };
    }
    toastId = toast.add(getRestockToastFeedback("RESTOCK_SAVED", toastDetails));
    onClose();

    // Preserve existing background consumers; this toast only confirms Inventory.
    Promise.allSettled([
      refreshAuditLogs(),
      refreshValuation(),
      refreshMenuManagement(),
      refreshPosManagement(),
    ]);
  };

  const validateForm = () => {
    setHasAttemptedSubmit(true);
    clearFeedback();

    if (!isFormValid) {
      requestAnimationFrame(() => {
        if (fieldsRef.current) {
          const firstInvalidField = fieldsRef.current.querySelector(
            '[aria-invalid="true"]',
          );
          if (firstInvalidField) firstInvalidField.focus();
        }
      });
      return false;
    }

    return true;
  };

  const handleReview = () => {
    if (operationInFlight.current || hasSaved || hasUnconfirmedSave) return;
    if (validateForm()) setIsConfirmationOpen(true);
  };

  const handleSave = async () => {
    if (operationInFlight.current || hasSaved || hasUnconfirmedSave) return;
    setIsConfirmationOpen(false);
    if (!validateForm()) return;

    operationInFlight.current = true;
    setIsSubmitting(true);

    try {
      try {
        savedRestockResponse.current = await restockInventoryItem(selectedItem.id, {
          origin: "inventory_restock",
          stockData: {
            quantity: Number(quantity),
            reason: reason.trim(),
            notes: supplier.trim() || null,
          },
          purchaseData: {
            total_cost: Number(totalCost) || 0,
            supplier: supplier.trim() || null,
            expiration_date: expirationDate || null,
          },
        });
      } catch (error) {
        const errorCode = getInventorySaveErrorCode(error);
        showFeedback(errorCode);
        // Do not repeat a stock write whose outcome is still unknown.
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

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved && !isConfirmationOpen) onClose();
  };

  const handleReasonChange = (nextReason) => {
    if (nextReason === "Others") {
      setIsCustomReason(true);
      setReason("");
      return;
    }

    setReason(nextReason);
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let blockingCode = "STOCK_SAVING";
  if (hasSaved) blockingCode = "INVENTORY_REFRESHING";
  if (isRefreshError) blockingCode = "INVENTORY_REFRESH_FAILED";
  const blockingFeedback = getRestockStatusFeedback(blockingCode);
  let blockingAction;

  if (isRefreshError) {
    blockingAction = {
      label: blockingFeedback.buttonLabel,
      onClick: handleRetryRefresh,
    };
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
        title="Restock Item"
        description="Add stock from delivery or purchase."
        iconClassName="bi bi-box-seam-fill"
        closeDisabled={fieldsDisabled}
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
        {showQrPlaceholder ? (
          <ModalContent>
            {qrFeedback ? <StatusFeedback feedback={qrFeedback} /> : (
              <div aria-busy="true" aria-label="Loading restock form" className="grid gap-[var(--app-gap-related)]">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="grid gap-[var(--app-space-2)]">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-nested)]" />
                  </div>
                ))}
              </div>
            )}
          </ModalContent>
        ) : (
        <ModalContent>
          <InlineFeedback feedback={feedback} id="restock-action-feedback" />
          <fieldset
            ref={fieldsRef}
            disabled={fieldsDisabled}
            aria-busy={isSubmitting}
            className="flex min-w-0 flex-col gap-[var(--app-gap-related)] border-0 p-0"
          >
            <Field data-invalid={hasAttemptedSubmit && Boolean(errors.item)}>
              <FieldLabel className={labelClassName}>
                Item Name
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>

              <Combobox
                items={inventoryItems}
                value={selectedItem}
                onValueChange={setSelectedItem}
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

            <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
              <Field>
                <FieldLabel
                  htmlFor="restock-supplier"
                  className={labelClassName}
                >
                  Supplier
                </FieldLabel>
                <Input
                  id="restock-supplier"
                  value={supplier}
                  onChange={(event) => setSupplier(event.target.value)}
                  placeholder="e.g., Bean Roasters Inc."
                  className={controlClassName}
                />
              </Field>

              <Field
                data-invalid={hasAttemptedSubmit && Boolean(errors.totalCost)}
              >
                <FieldLabel
                  htmlFor="restock-total-cost"
                  className={labelClassName}
                >
                  Total Cost
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                <InputGroup className="h-[var(--app-touch-target-min)] overflow-hidden rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] shadow-none focus-within:border-[var(--app-color-brand)] focus-within:ring-0">
                  <InputGroupAddon className="h-full border-r border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] !px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-brand-number)]">
                    ₱
                  </InputGroupAddon>
                  <InputGroupInput
                    id="restock-total-cost"
                    type="number"
                    min="1"
                    value={totalCost}
                    onChange={(event) => setTotalCost(event.target.value)}
                    placeholder="0.00"
                    aria-invalid={
                      hasAttemptedSubmit && Boolean(errors.totalCost)
                    }
                    className="h-full px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]"
                  />
                </InputGroup>
                {hasAttemptedSubmit && errors.totalCost && (
                  <FieldError className="text-[length:var(--app-font-size-caption)]">
                    {errors.totalCost}
                  </FieldError>
                )}
              </Field>

              <Field
                data-invalid={hasAttemptedSubmit && Boolean(errors.reason)}
              >
                <FieldLabel htmlFor="restock-reason" className={labelClassName}>
                  Reason
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>

                {isCustomReason ? (
                  <div className="flex gap-[var(--app-space-2)]">
                    <Input
                      id="restock-reason"
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
                      id="restock-reason"
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
                      {restockReasons.map((option) => (
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

              <Field
                data-invalid={
                  hasAttemptedSubmit && Boolean(errors.expirationDate)
                }
              >
                <FieldLabel
                  htmlFor="restock-expiration-date"
                  className={labelClassName}
                >
                  Expiration Date
                  {isExpiryTracked ? (
                    <span className="text-[var(--app-color-danger)]">*</span>
                  ) : (
                    <span className="font-normal text-[var(--app-color-text-subtle)]">
                      (Optional)
                    </span>
                  )}
                </FieldLabel>
                <DatePicker
                  id="restock-expiration-date"
                  editable
                  showValidationMessage={false}
                  aria-describedby={hasAttemptedSubmit && errors.expirationDate ? "restock-expiration-error" : undefined}
                  onValidityChange={setIsExpirationInputValid}
                  value={expirationDate}
                  onValueChange={setExpirationDate}
                  placeholder="MM/DD/YYYY"
                  minDate={expirationLimits.minDate}
                  maxDate={expirationLimits.maxDate}
                  disabled={fieldsDisabled}
                  invalid={
                    hasAttemptedSubmit && Boolean(errors.expirationDate)
                  }
                  triggerClassName={controlClassName}
                />
                {hasAttemptedSubmit && errors.expirationDate && (
                  <FieldError id="restock-expiration-error" className="text-[length:var(--app-font-size-caption)]">
                    {errors.expirationDate}
                  </FieldError>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-[var(--app-space-2)] sm:grid-cols-3">
              <Field>
                <FieldLabel
                  htmlFor="restock-stock-on-hand"
                  className={labelClassName}
                >
                  Stock on Hand
                </FieldLabel>
                <Input
                  id="restock-stock-on-hand"
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
                  htmlFor="restock-quantity"
                  className={labelClassName}
                >
                  Quantity Added
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                <Input
                  id="restock-quantity"
                  type="number"
                  min="1"
                  step={getQuantityRules(unit).step}
                  inputMode={getQuantityRules(unit).inputMode}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
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
                  htmlFor="restock-final-stock"
                  className={labelClassName}
                >
                  Final Stock
                </FieldLabel>
                <Input
                  id="restock-final-stock"
                  value={selectedItem ? `${finalStock} ${unit}` : "—"}
                  readOnly
                  aria-readonly="true"
                  className={`${controlClassName} ${readonlyClassName} ${numericQuantity > 0 ? "font-semibold !text-[var(--app-color-success)]" : ""}`}
                />
              </Field>
            </div>
          </fieldset>

          <div className="flex items-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] p-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
            <i
              className="bi bi-info-circle-fill shrink-0 text-[var(--app-color-brand)]"
              aria-hidden="true"
            />
            <span>Restocking also records an Inventory Purchase expense.</span>
          </div>
        </ModalContent>
        )}
      </ModalBody>

      <ModalFooter>
        {showQrPlaceholder ? (
          <>
            <Button type="button" variant="outline" onClick={handleClose} className="min-h-[var(--app-touch-target-min)] text-[length:var(--app-font-size-body-secondary)]">Close</Button>
            {!qrFeedback && <Button type="button" disabled className="min-h-[var(--app-touch-target-min)] bg-[var(--app-color-brand)] text-[length:var(--app-font-size-body-secondary)] text-white">Update Stock</Button>}
          </>
        ) : (
        <>
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
          aria-describedby={feedback ? "restock-action-feedback" : undefined}
          className="min-h-[var(--app-touch-target-min)] min-w-32 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {hasUnconfirmedSave && feedback ? feedback.buttonLabel : "Update Stock"}
        </Button>
        </>
        )}
      </ModalFooter>
    {/* Nest the alert under the parent Dialog so focus/dismissal stays on top. */}
    <ActionAlertDialog
      open={isConfirmationOpen}
      onOpenChange={setIsConfirmationOpen}
      type="small"
      title="Confirm restock?"
      description={
        <>
          Add <strong className="font-semibold">{quantity} {unit}</strong> to{" "}
          <strong className="font-semibold">{selectedItem && selectedItem.item_name}</strong> for{" "}
          <strong className="font-semibold">₱{Number(totalCost).toFixed(2)}</strong>?
          {" "}This also records an Inventory Purchase expense.
        </>
      }
      actions={[
        { key: "cancel", label: "Cancel", close: true },
        { key: "confirm", label: "Confirm", onClick: handleSave, disabled: isSubmitting },
      ]}
    />
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

const RestockModal = ({
  isOpen,
  onClose,
  onRestockAgain,
  refetchInventory,
  inventoryItems = [],
  item = null,
  qrItemId = null,
  archivedInventoryItems = [],
  isLoadingQr = false,
  qrLoadError = null,
}) => {
  if (!isOpen) return null;

  let restockItem = item;
  let isQrArchived = false;
  if (qrItemId !== null) {
    restockItem = inventoryItems.find((record) => record.id === qrItemId) || null;
    isQrArchived = archivedInventoryItems.some((record) => record.id === qrItemId) || Boolean(restockItem && restockItem.archived);
  }

  return (
    <RestockModalContent
      onClose={onClose}
      onRestockAgain={onRestockAgain}
      refetchInventory={refetchInventory}
      inventoryItems={inventoryItems}
      item={restockItem}
      qrItemId={qrItemId}
      isLoadingQr={isLoadingQr}
      qrLoadError={qrLoadError}
      isQrArchived={isQrArchived}
    />
  );
};

export default RestockModal;
