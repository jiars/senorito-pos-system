import { useMemo, useRef, useState } from "react";

import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
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
import {
  getInventoryInlineFeedback,
  getInventoryToastFeedback,
} from "@/utils/inventory/inventoryFeedback";
import { validateStockLog } from "@/utils/validation/inventory/stockLogValidation";

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
  refetchInventory,
  inventoryItems,
  item,
}) => {
  const refreshAuditLogs = useRefreshInventoryAuditLogs();
  const refreshValuation = useRefreshInventoryValuation();
  const refreshMenuManagement = useRefreshMenuManagement();
  const refreshPosManagement = useRefreshPosManagement();
  const [selectedItem, setSelectedItem] = useState(item ?? null);
  const [supplier, setSupplier] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [reason, setReason] = useState("");
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const operationInFlight = useRef(false);
  const fieldsRef = useRef(null);
  const { feedback, showFeedback, clearFeedback } = useFeedback(
    getInventoryInlineFeedback,
  );
  const fieldsDisabled = isSubmitting || hasSaved;

  const currentStock = Number(selectedItem?.current_stock || 0);
  const numericQuantity = Number(quantity) || 0;
  const finalStock = currentStock + numericQuantity;
  const unit = selectedItem?.base_unit || "pcs";
  const isExpiryTracked = Boolean(selectedItem?.track_expiry);

  const errors = useMemo(() => {
    const nextErrors = validateStockLog({
      actionType: "restock",
      quantity,
      currentStock,
      totalCost,
      expirationDate,
      isExpiryTracked: Boolean(selectedItem?.track_expiry),
      selectedBatchId: "",
      selectedBatchStock: 0,
      reason,
    });

    if (!selectedItem) {
      nextErrors.item = "Please select an inventory item.";
    }

    return nextErrors;
  }, [currentStock, expirationDate, quantity, reason, selectedItem, totalCost]);

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
    toast.add(getInventoryToastFeedback("RESTOCK_SAVED"));
    onClose();

    // Preserve existing background consumers; this toast only confirms Inventory.
    Promise.allSettled([
      refreshAuditLogs(),
      refreshValuation(),
      refreshMenuManagement(),
      refreshPosManagement(),
    ]);
  };

  const handleSave = async () => {
    if (operationInFlight.current || hasSaved) return;
    setHasAttemptedSubmit(true);
    clearFeedback();

    if (Object.keys(errors).length > 0 || !selectedItem) {
      requestAnimationFrame(() => {
        if (fieldsRef.current) {
          const firstInvalidField = fieldsRef.current.querySelector(
            '[aria-invalid="true"]',
          );
          if (firstInvalidField) firstInvalidField.focus();
        }
      });
      return;
    }

    operationInFlight.current = true;
    setIsSubmitting(true);

    try {
      try {
        await restockInventoryItem(selectedItem.id, {
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
      } catch {
        showFeedback("SAVE_FAILED");
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
    if (!operationInFlight.current && !hasSaved) onClose();
  };

  const handleReasonChange = (nextReason) => {
    if (nextReason === "Others") {
      setIsCustomReason(true);
      setReason("");
      return;
    }

    setReason(nextReason);
  };

  return (
    <Modal
      isOpen={true}
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
                  value={expirationDate}
                  onValueChange={setExpirationDate}
                  placeholder="MM/DD/YYYY"
                  disabled={fieldsDisabled}
                  invalid={
                    hasAttemptedSubmit && Boolean(errors.expirationDate)
                  }
                  triggerClassName={controlClassName}
                />
                {hasAttemptedSubmit && errors.expirationDate && (
                  <FieldError className="text-[length:var(--app-font-size-caption)]">
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
          disabled={isSubmitting}
          onClick={hasSaved ? handleRetryRefresh : handleSave}
          aria-describedby={feedback ? "restock-action-feedback" : undefined}
          className="min-h-[var(--app-touch-target-min)] min-w-32 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {isSubmitting && (hasSaved ? "Refreshing..." : "Saving...")}
          {!isSubmitting && (hasSaved ? "Retry refresh" : "Update Stock")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const RestockModal = ({
  isOpen,
  onClose,
  refetchInventory,
  inventoryItems = [],
  item = null,
}) => {
  if (!isOpen) return null;

  return (
    <RestockModalContent
      onClose={onClose}
      refetchInventory={refetchInventory}
      inventoryItems={inventoryItems}
      item={item}
    />
  );
};

export default RestockModal;
