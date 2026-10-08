import { useMemo, useRef, useState } from "react";

import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getAddExpenseErrorCode, getAddExpenseInlineFeedback,
  getAddExpenseStatusFeedback, getAddExpenseToastFeedback,
} from "@/utils/expenses/feedback/addExpenseFeedback";

import Modal from "@/components/modals/Modal";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
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
import { useInventoryManagement } from "@/hooks/useInventoryManagement";
import { useRefreshInventoryAuditLogs } from "@/hooks/useInventoryAuditLogs";
import { useRefreshInventoryValuation } from "@/hooks/useInventoryValuation";
import { addExpense } from "@/services/expenses/expenseService";
import { restockInventoryItem } from "@/services/inventory/stock/restockService";
import { validateExpenseForm, getAddExpenseServerFieldErrors } from "@/utils/expenses/validation/addExpenseValidation";
import { getExpenseDateLimits, getPurchaseExpirationMinDate } from "@/utils/expenses/expenseDateLimits";
import { getQuantityRules } from "@/utils/inventory/quantityRules";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

const emptyForm = {
  category_id: "",
  expense_date: "",
  description: "",
  amount: "",
  vendor: "",
  payment_method: "",
  receipt_reference: "",
  inventory_item_id: "",
  quantity_to_add: "",
  expiration_date: "",
  notes: "",
  reason: "",
};

const vendorCategoryNames = new Set([
  "cleaning supplies",
  "equipment",
  "utilities",
  "maintenance",
]);

const paymentMethods = ["Cash", "GCash", "Bank Transfer", "Credit Card"];
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

const findInitialCategory = (categories, requestedCategoryName) => {
  const normalizedRequest = requestedCategoryName?.trim().toLowerCase();
  if (!normalizedRequest) return null;

  return (
    categories.find((category) => {
      const normalizedCategory = category.category_name.trim().toLowerCase();

      if (normalizedRequest === "salary") {
        return ["salary", "salaries"].includes(normalizedCategory);
      }

      return normalizedCategory === normalizedRequest;
    }) || null
  );
};

const AddExpenseModalContent = ({
  onClose,
  categories,
  refetch,
  initialCategoryName,
}) => {
  const { inventoryItems, refetchInventoryManagement } =
    useInventoryManagement();
  const refreshAuditLogs = useRefreshInventoryAuditLogs();
  const refreshValuation = useRefreshInventoryValuation();

  const initialCategory = findInitialCategory(
    categories,
    initialCategoryName,
  );
  const [formData, setFormData] = useState(() => ({
    ...emptyForm,
    category_id: initialCategory?.id || "",
  }));
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [savedResult, setSavedResult] = useState(null);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getAddExpenseInlineFeedback);
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [dateLimits] = useState(() => getExpenseDateLimits());
  const [isExpenseDateInputValid, setIsExpenseDateInputValid] = useState(true);
  const [isExpirationInputValid, setIsExpirationInputValid] = useState(true);
  const [expenseDateInput, setExpenseDateInput] = useState("");
  const [expirationDateInput, setExpirationDateInput] = useState("");
  const purchaseExpirationMinDate = getPurchaseExpirationMinDate(
    formData.expense_date, dateLimits.minExpirationDate,
  );

  const selectedCategory = categories.find((category) => {
    return category.id === formData.category_id;
  });
  const normalizedCategoryName = selectedCategory
    ? selectedCategory.category_name.trim().toLowerCase()
    : "";
  const isPurchase = normalizedCategoryName === "inventory purchase";
  const showVendor = vendorCategoryNames.has(normalizedCategoryName);
  const selectedItem = inventoryItems.find((inventoryItem) => {
    return inventoryItem.id === formData.inventory_item_id;
  });
  const currentStock = Number(selectedItem?.current_stock || 0);
  const quantityToAdd = Number(formData.quantity_to_add) || 0;
  const finalStock = currentStock + quantityToAdd;
  const unit = selectedItem?.base_unit || "pcs";

  const validation = useMemo(() => {
    return validateExpenseForm(formData, { isPurchase, selectedItem, dateLimits, categories, paymentMethods, isExpenseDateInputValid, isExpirationInputValid, expenseDateInput, expirationDateInput });
  }, [formData, isPurchase, selectedItem, dateLimits, categories, isExpenseDateInputValid, isExpirationInputValid, expenseDateInput, expirationDateInput]);
  const errors = { ...serverFieldErrors, ...validation.errors };
  const isFormValid = validation.isFormValid && Object.keys(serverFieldErrors).length === 0;
  const formLocked = isSubmitting || isConfirmationOpen || Boolean(savedResult) || saveBlocked;

  const errorFor = (fieldName) => {
    if (!hasAttemptedSubmit) return "";
    return errors[fieldName] || "";
  };

  const updateField = (fieldName, value) => {
    if (operationInFlight.current || formLocked) return;
    clearFeedback();
    setServerFieldErrors({});
    setFormData((currentForm) => {
      return {
        ...currentForm,
        [fieldName]: value,
      };
    });
  };

  const handleCategoryChange = (category) => {
    if (operationInFlight.current || formLocked) return;
    const nextCategoryId = category ? category.id : "";
    setIsExpenseDateInputValid(true);
    setIsExpirationInputValid(true);

    setFormData((currentForm) => {
      return {
        ...emptyForm,
        category_id: nextCategoryId,
        expense_date: currentForm.expense_date,
      };
    });
    setHasAttemptedSubmit(false);
    clearFeedback();
    setServerFieldErrors({});
    setIsCustomReason(false);
  };

  const handleItemChange = (inventoryItem) => {
    const inventoryItemId = inventoryItem ? inventoryItem.id : "";
    updateField("inventory_item_id", inventoryItemId);
  };

  const handleReasonChange = (nextReason) => {
    if (operationInFlight.current || formLocked) return;
    if (nextReason === "Others") {
      setIsCustomReason(true);
      updateField("reason", "");
      return;
    }

    updateField("reason", nextReason);
  };

  const resetAndClose = () => {
    if (operationInFlight.current || savedResult || isConfirmationOpen) return;
    setFormData(emptyForm);
    setHasAttemptedSubmit(false);
    clearFeedback();
    setServerFieldErrors({});
    setIsCustomReason(false);
    onClose();
  };

  // A saved expense/purchase retries required reads only, never its write.
  const refreshSavedExpense = async (resultDetails) => {
    try {
      const requiredReads = [refetch()];
      if (resultDetails.isPurchase) requiredReads.push(refetchInventoryManagement());
      const results = await Promise.all(requiredReads);
      if (results.some((result) => result && (result.isError || result.error))) return;
    } catch {
      return;
    }
    if (resultDetails.isPurchase) {
      // Report caches refresh independently; they do not gate form readiness.
      void Promise.allSettled([refreshAuditLogs(), refreshValuation()]);
    }
    const code = resultDetails.isPurchase ? "PURCHASE_SAVED" : "EXPENSE_SAVED";
    toast.add(getAddExpenseToastFeedback(code, resultDetails));
    onClose();
  };

  const handleSubmit = () => {
    if (operationInFlight.current || savedResult || saveBlocked || isConfirmationOpen) return;
    setHasAttemptedSubmit(true);
    if (!isFormValid) {
      const fieldIds = {
        category_id: "add-expense-category", expense_date: "add-expense-date",
        description: isPurchase ? "add-expense-purchase-description" : "add-expense-description",
        amount: isPurchase ? "add-expense-purchase-cost" : "add-expense-amount",
        inventory_item_id: "add-expense-inventory-item", quantity_to_add: "add-expense-quantity",
        expiration_date: "add-expense-expiration-date", reason: "add-expense-purchase-reason",
        payment_method: "add-expense-payment-method",
      };
      const input = document.getElementById(fieldIds[Object.keys(errors)[0]]);
      if (input) input.focus();
      return;
    }
    clearFeedback();
    setIsConfirmationOpen(true);
  };

  const handleConfirmAdd = async () => {
    if (operationInFlight.current || savedResult || saveBlocked || !isConfirmationOpen) return;
    if (!isFormValid) {
      setIsConfirmationOpen(false);
      setHasAttemptedSubmit(true);
      return;
    }
    operationInFlight.current = true;
    setIsConfirmationOpen(false);
    setIsSubmitting(true);
    clearFeedback();
    const resultDetails = {
      isPurchase, description: formData.description.trim(), amount: Number(formData.amount),
      itemName: selectedItem ? selectedItem.item_name : "", quantity: quantityToAdd, unit,
    };
    try {
      try {
        if (isPurchase) {
          const purchaseNotes = [
            `Description: ${formData.description.trim()}`,
            formData.notes.trim() ? `Note: ${formData.notes.trim()}` : "",
          ]
            .filter(Boolean)
            .join(" | ");
          await restockInventoryItem(selectedItem.id, {
            origin: "expense_purchase",
            stockData: {
              quantity: Number(formData.quantity_to_add),
              reason: formData.reason.trim(),
              notes: purchaseNotes,
            },
            purchaseData: {
              total_cost: Number(formData.amount),
              supplier: formData.vendor.trim() || null,
              expiration_date: formData.expiration_date || null,
              expense_date: formData.expense_date,
              description: formData.description.trim(),
            },
          });
        } else {
          await addExpense({
            category_id: formData.category_id,
            expense_date: formData.expense_date,
            description: formData.description.trim(),
            amount: Number(formData.amount),
            vendor: formData.vendor.trim() || null,
            payment_method: formData.payment_method,
            receipt_reference: formData.receipt_reference.trim() || null,
          });
        }
      } catch (error) {
        const code = getAddExpenseErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "RECORD_CONFLICT") setSaveBlocked(true);
        if (code === "VALIDATION_FAILED" && error.response.data && error.response.data.errors) {
          setServerFieldErrors(getAddExpenseServerFieldErrors(error.response.data.errors));
        }
        return;
      }
      setSavedResult(resultDetails);
      await refreshSavedExpense(resultDetails);
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !savedResult) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    try {
      await refreshSavedExpense(savedResult);
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };
  const isRefreshError = Boolean(savedResult) && !isSubmitting;
  let statusCode = "EXPENSE_SAVING";
  if (savedResult) statusCode = "EXPENSES_REFRESHING";
  if (isRefreshError) statusCode = "EXPENSES_REFRESH_FAILED";
  const statusFeedback = getAddExpenseStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };

  return (
    <>
    <Modal
      isOpen={!isSubmitting && !savedResult}
      onClose={resetAndClose}
      maxWidth="32rem"
      maxHeight="min(90svh, 48rem)"
    >
      <ModalHeader
        title="Add Expense"
        description="Record a business expense or inventory purchase."
        iconClassName="bi bi-wallet2"
        closeDisabled={isSubmitting || isConfirmationOpen}
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
        <ModalContent>
          <InlineFeedback feedback={feedback} id="add-expense-feedback" />

          <fieldset disabled={formLocked} className="contents">
          <div className="flex flex-col gap-[var(--app-gap-related)]">
            <Field data-invalid={Boolean(errorFor("category_id"))}>
              <FieldLabel htmlFor="add-expense-category" className={labelClassName}>
                Category
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>

              <Combobox
                disabled={formLocked}
                items={categories}
                value={selectedCategory || null}
                onValueChange={handleCategoryChange}
                itemToStringLabel={(category) => {
                  return category?.category_name || "";
                }}
                itemToStringValue={(category) => {
                  return String(category?.id || "");
                }}
                isItemEqualToValue={(category, value) => {
                  return category?.id === value?.id;
                }}
              >
                <ComboboxInput
                  id="add-expense-category"
                  placeholder="Select an expense category"
                  aria-invalid={Boolean(errorFor("category_id"))}
                  className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] has-aria-invalid:border-[var(--app-color-danger)]"
                />
                <ComboboxContent
                  positionerClassName="!z-[1100]"
                  className="z-[1100] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)]  ring-0"
                >
                  <ComboboxEmpty>No expense category found.</ComboboxEmpty>
                  <ComboboxList>
                    {(category) => {
                      const isInventoryWastage =
                        category.category_name === "Inventory Wastage";

                      return (
                        <ComboboxItem
                          key={category.id}
                          value={category}
                          disabled={isInventoryWastage}
                          className="min-h-[var(--app-touch-target-min)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]"
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {category.category_name}
                          </span>
                          {isInventoryWastage && (
                            <em className="shrink-0 text-[length:var(--app-font-size-caption)] font-normal text-[var(--app-color-text-subtle)]">
                              Unavailable
                            </em>
                          )}
                        </ComboboxItem>
                      );
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              {errorFor("category_id") && (
                <FieldError className="text-[length:var(--app-font-size-caption)]">
                  {errorFor("category_id")}
                </FieldError>
              )}
            </Field>

            {isPurchase ? (
              <>
                <Field data-invalid={Boolean(errorFor("description"))}>
                  <FieldLabel
                    htmlFor="add-expense-purchase-description"
                    className={labelClassName}
                  >
                    Description
                    <span className="text-[var(--app-color-danger)]">*</span>
                  </FieldLabel>
                  <Input
                    id="add-expense-purchase-description"
                    value={formData.description}
                    onChange={(event) => {
                      updateField("description", event.target.value);
                    }}
                    placeholder="Describe the inventory purchase"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errorFor("description"))}
                    className={controlClassName}
                  />
                  {errorFor("description") && (
                    <FieldError className="text-[length:var(--app-font-size-caption)]">
                      {errorFor("description")}
                    </FieldError>
                  )}
                </Field>

                <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
                  <Field>
                    <FieldLabel
                      htmlFor="add-expense-purchase-note"
                      className={labelClassName}
                    >
                      Note
                    </FieldLabel>
                    <Input
                      id="add-expense-purchase-note"
                      value={formData.notes}
                      onChange={(event) => {
                        updateField("notes", event.target.value);
                      }}
                      placeholder="Optional note"
                      disabled={isSubmitting}
                      className={controlClassName}
                    />
                  </Field>

                  <Field data-invalid={Boolean(errorFor("expense_date"))}>
                    <FieldLabel
                      htmlFor="add-expense-date"
                      className={labelClassName}
                    >
                      Date
                      <span className="text-[var(--app-color-danger)]">*</span>
                    </FieldLabel>
                    <DatePicker
                      id="add-expense-date"
                      editable
                      showValidationMessage={false}
                      onValidityChange={setIsExpenseDateInputValid}
                      onInputValueChange={setExpenseDateInput}
                      minDate={dateLimits.minExpenseDate}
                      maxDate={dateLimits.maxExpenseDate}
                      defaultMonth={dateLimits.minExpirationDate}
                      value={formData.expense_date}
                      onValueChange={(value) => {
                        updateField("expense_date", value);
                      }}
                      placeholder="MM/DD/YYYY"
                      disabled={isSubmitting}
                      invalid={Boolean(errorFor("expense_date"))}
                      triggerClassName={controlClassName}
                    />
                    {errorFor("expense_date") && (
                      <FieldError className="text-[length:var(--app-font-size-caption)]">
                        {errorFor("expense_date")}
                      </FieldError>
                    )}
                  </Field>
                </div>

                <div className="relative pl-[var(--app-space-6)]">
                  <span
                    className="absolute inset-y-[var(--app-space-2)] left-0 w-1 rounded-full bg-[var(--app-color-brand-soft)]"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-[var(--app-gap-related)]">
                    <Field
                      data-invalid={Boolean(errorFor("inventory_item_id"))}
                    >
                  <FieldLabel className={labelClassName}>
                    Item Name
                    <span className="text-[var(--app-color-danger)]">*</span>
                  </FieldLabel>
                  <Combobox
                    disabled={formLocked}
                    items={inventoryItems}
                    value={selectedItem || null}
                    onValueChange={handleItemChange}
                    itemToStringLabel={(inventoryItem) => {
                      return inventoryItem?.item_name || "";
                    }}
                    itemToStringValue={(inventoryItem) => {
                      return String(inventoryItem?.id || "");
                    }}
                    isItemEqualToValue={(inventoryItem, value) => {
                      return inventoryItem?.id === value?.id;
                    }}
                  >
                    <ComboboxInput
                      id="add-expense-inventory-item"
                      placeholder="Select an inventory item"
                      aria-invalid={Boolean(errorFor("inventory_item_id"))}
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
                  {errorFor("inventory_item_id") && (
                    <FieldError className="text-[length:var(--app-font-size-caption)]">
                      {errorFor("inventory_item_id")}
                    </FieldError>
                  )}
                    </Field>

                <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
                  <Field>
                    <FieldLabel
                      htmlFor="add-expense-vendor"
                      className={labelClassName}
                    >
                      Vendor / Supplier
                    </FieldLabel>
                    <Input
                      id="add-expense-vendor"
                      value={formData.vendor}
                      onChange={(event) => {
                        updateField("vendor", event.target.value);
                      }}
                      placeholder="e.g., Local supplier"
                      disabled={isSubmitting}
                      className={controlClassName}
                    />
                  </Field>

                  <Field data-invalid={Boolean(errorFor("amount"))}>
                    <FieldLabel
                      htmlFor="add-expense-purchase-cost"
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
                        id="add-expense-purchase-cost"
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.amount}
                        onChange={(event) => {
                          updateField("amount", event.target.value);
                        }}
                        placeholder="0.00"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(errorFor("amount"))}
                        className="h-full px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]"
                      />
                    </InputGroup>
                    {errorFor("amount") && (
                      <FieldError className="text-[length:var(--app-font-size-caption)]">
                        {errorFor("amount")}
                      </FieldError>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
                  <Field data-invalid={Boolean(errorFor("reason"))}>
                    <FieldLabel
                      htmlFor="add-expense-purchase-reason"
                      className={labelClassName}
                    >
                      Reason
                      <span className="text-[var(--app-color-danger)]">*</span>
                    </FieldLabel>

                    {isCustomReason ? (
                      <div className="flex gap-[var(--app-space-2)]">
                        <Input
                          id="add-expense-purchase-reason"
                          value={formData.reason}
                          onChange={(event) => {
                            updateField("reason", event.target.value);
                          }}
                          placeholder="Please specify"
                          autoFocus
                          disabled={isSubmitting}
                          aria-invalid={Boolean(errorFor("reason"))}
                          className={controlClassName}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-[var(--app-touch-target-min)] shrink-0 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)]"
                          onClick={() => {
                            setIsCustomReason(false);
                            updateField("reason", "");
                          }}
                          disabled={isSubmitting}
                          aria-label="Choose a predefined reason"
                        >
                          <i className="bi bi-arrow-left" aria-hidden="true" />
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={formData.reason || null}
                        onValueChange={handleReasonChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          id="add-expense-purchase-reason"
                          aria-invalid={Boolean(errorFor("reason"))}
                          className={`data-[size=default]:!h-[var(--app-touch-target-min)] w-full ${controlClassName}`}
                        >
                          <span>{formData.reason || "Select reason"}</span>
                        </SelectTrigger>
                        <SelectContent
                          positionerClassName="!z-[1100]"
                          className="z-[1100]"
                        >
                          {restockReasons.map((restockReason) => (
                            <SelectItem
                              key={restockReason}
                              value={restockReason}
                            >
                              {restockReason}
                            </SelectItem>
                          ))}
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {errorFor("reason") && (
                      <FieldError className="text-[length:var(--app-font-size-caption)]">
                        {errorFor("reason")}
                      </FieldError>
                    )}
                  </Field>

                  <Field data-invalid={Boolean(errorFor("expiration_date"))}>
                    <FieldLabel
                      htmlFor="add-expense-expiration-date"
                      className={labelClassName}
                    >
                      Expiration Date
                      {selectedItem?.track_expiry ? (
                        <span className="text-[var(--app-color-danger)]">
                          *
                        </span>
                      ) : (
                        <span className="font-normal text-[var(--app-color-text-subtle)]">
                          (Optional)
                        </span>
                      )}
                    </FieldLabel>
                    <DatePicker
                      id="add-expense-expiration-date"
                      editable
                      showValidationMessage={false}
                      onValidityChange={setIsExpirationInputValid}
                      onInputValueChange={setExpirationDateInput}
                      minDate={purchaseExpirationMinDate}
                      defaultMonth={purchaseExpirationMinDate}
                      maxDate={dateLimits.maxExpirationDate}
                      value={formData.expiration_date}
                      onValueChange={(value) => {
                        updateField("expiration_date", value);
                      }}
                      placeholder="MM/DD/YYYY"
                      disabled={isSubmitting || !selectedItem}
                      invalid={Boolean(errorFor("expiration_date"))}
                      triggerClassName={controlClassName}
                    />
                    {errorFor("expiration_date") && (
                      <FieldError className="text-[length:var(--app-font-size-caption)]">
                        {errorFor("expiration_date")}
                      </FieldError>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-3">
                  <Field>
                    <FieldLabel
                      htmlFor="add-expense-stock-on-hand"
                      className={labelClassName}
                    >
                      Stock on Hand
                    </FieldLabel>
                    <Input
                      id="add-expense-stock-on-hand"
                      value={selectedItem ? `${currentStock} ${unit}` : "—"}
                      readOnly
                      aria-readonly="true"
                      className={`${controlClassName} ${readonlyClassName}`}
                    />
                  </Field>

                  <Field data-invalid={Boolean(errorFor("quantity_to_add"))}>
                    <FieldLabel
                      htmlFor="add-expense-quantity"
                      className={labelClassName}
                    >
                      Qty Added
                      <span className="text-[var(--app-color-danger)]">*</span>
                    </FieldLabel>
                    <Input
                      id="add-expense-quantity"
                      type="number"
                      min={getQuantityRules(unit).wholeNumbersOnly ? "1" : "0.01"}
                      step={getQuantityRules(unit).step}
                      inputMode={getQuantityRules(unit).inputMode}
                      value={formData.quantity_to_add}
                      onChange={(event) => {
                        updateField("quantity_to_add", event.target.value);
                      }}
                      placeholder="0"
                      disabled={isSubmitting || !selectedItem}
                      aria-invalid={Boolean(errorFor("quantity_to_add"))}
                      className={controlClassName}
                    />
                    {errorFor("quantity_to_add") && (
                      <FieldError className="text-[length:var(--app-font-size-caption)]">
                        {errorFor("quantity_to_add")}
                      </FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor="add-expense-final-stock"
                      className={labelClassName}
                    >
                      Final Stock
                    </FieldLabel>
                    <Input
                      id="add-expense-final-stock"
                      value={selectedItem ? `${finalStock} ${unit}` : "—"}
                      readOnly
                      aria-readonly="true"
                      className={`${controlClassName} ${readonlyClassName} ${quantityToAdd > 0 ? "font-semibold !text-[var(--app-color-success)]" : ""}`}
                    />
                  </Field>
                </div>

                <div className="flex items-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] p-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
                  <i
                    className="bi bi-info-circle-fill shrink-0 text-[var(--app-color-brand)]"
                    aria-hidden="true"
                  />
                  <span>
                    This expense will also create a new inventory batch and
                    update the selected item&apos;s stock.
                  </span>
                </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Field data-invalid={Boolean(errorFor("description"))}>
                  <FieldLabel
                    htmlFor="add-expense-description"
                    className={labelClassName}
                  >
                    Description
                    <span className="text-[var(--app-color-danger)]">*</span>
                  </FieldLabel>
                  <Input
                    id="add-expense-description"
                    value={formData.description}
                    onChange={(event) => {
                      updateField("description", event.target.value);
                    }}
                    placeholder="Describe the expense"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errorFor("description"))}
                    className={controlClassName}
                  />
                  {errorFor("description") && (
                    <FieldError className="text-[length:var(--app-font-size-caption)]">
                      {errorFor("description")}
                    </FieldError>
                  )}
                </Field>

                <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
                  <Field data-invalid={Boolean(errorFor("amount"))}>
                    <FieldLabel
                      htmlFor="add-expense-amount"
                      className={labelClassName}
                    >
                      Amount
                      <span className="text-[var(--app-color-danger)]">*</span>
                    </FieldLabel>
                    <InputGroup className="h-[var(--app-touch-target-min)] overflow-hidden rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] shadow-none focus-within:border-[var(--app-color-brand)] focus-within:ring-0">
                      <InputGroupAddon className="h-full border-r border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] !px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-brand-number)]">
                        ₱
                      </InputGroupAddon>
                      <InputGroupInput
                        id="add-expense-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.amount}
                        onChange={(event) => {
                          updateField("amount", event.target.value);
                        }}
                        placeholder="0.00"
                        disabled={isSubmitting}
                        aria-invalid={Boolean(errorFor("amount"))}
                        className="h-full px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]"
                      />
                    </InputGroup>
                    {errorFor("amount") && (
                      <FieldError className="text-[length:var(--app-font-size-caption)]">
                        {errorFor("amount")}
                      </FieldError>
                    )}
                  </Field>

                  <Field data-invalid={Boolean(errorFor("expense_date"))}>
                    <FieldLabel
                      htmlFor="add-expense-date"
                      className={labelClassName}
                    >
                      Date
                      <span className="text-[var(--app-color-danger)]">*</span>
                    </FieldLabel>
                    <DatePicker
                      id="add-expense-date"
                      editable
                      showValidationMessage={false}
                      onValidityChange={setIsExpenseDateInputValid}
                      onInputValueChange={setExpenseDateInput}
                      minDate={dateLimits.minExpenseDate}
                      maxDate={dateLimits.maxExpenseDate}
                      defaultMonth={dateLimits.minExpirationDate}
                      value={formData.expense_date}
                      onValueChange={(value) => {
                        updateField("expense_date", value);
                      }}
                      placeholder="MM/DD/YYYY"
                      disabled={isSubmitting}
                      invalid={Boolean(errorFor("expense_date"))}
                      triggerClassName={controlClassName}
                    />
                    {errorFor("expense_date") && (
                      <FieldError className="text-[length:var(--app-font-size-caption)]">
                        {errorFor("expense_date")}
                      </FieldError>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
                  <Field data-invalid={Boolean(errorFor("payment_method"))}>
                    <FieldLabel
                      htmlFor="add-expense-payment-method"
                      className={labelClassName}
                    >
                      Payment Method
                      <span className="text-[var(--app-color-danger)]">*</span>
                    </FieldLabel>
                    <Select
                      value={formData.payment_method || null}
                      onValueChange={(value) => {
                        updateField("payment_method", value);
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id="add-expense-payment-method"
                        aria-invalid={Boolean(errorFor("payment_method"))}
                        className={`data-[size=default]:!h-[var(--app-touch-target-min)] w-full ${controlClassName}`}
                      >
                        <span>
                          {formData.payment_method || "Select payment method"}
                        </span>
                      </SelectTrigger>
                      <SelectContent
                        positionerClassName="!z-[1100]"
                        className="z-[1100]"
                      >
                        {paymentMethods.map((paymentMethod) => (
                          <SelectItem key={paymentMethod} value={paymentMethod}>
                            {paymentMethod}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errorFor("payment_method") && (
                      <FieldError className="text-[length:var(--app-font-size-caption)]">
                        {errorFor("payment_method")}
                      </FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor="add-expense-receipt"
                      className={labelClassName}
                    >
                      Receipt
                    </FieldLabel>
                    <Input
                      id="add-expense-receipt"
                      value={formData.receipt_reference}
                      onChange={(event) => {
                        updateField("receipt_reference", event.target.value);
                      }}
                      placeholder="Receipt number or reference"
                      disabled={isSubmitting}
                      className={controlClassName}
                    />
                  </Field>
                </div>

                {showVendor && (
                  <Field>
                    <FieldLabel
                      htmlFor="add-expense-vendor"
                      className={labelClassName}
                    >
                      Vendor / Supplier
                    </FieldLabel>
                    <Input
                      id="add-expense-vendor"
                      value={formData.vendor}
                      onChange={(event) => {
                        updateField("vendor", event.target.value);
                      }}
                      placeholder="Optional"
                      disabled={isSubmitting}
                      className={controlClassName}
                    />
                  </Field>
                )}
              </>
            )}

          </div>
          </fieldset>
        </ModalContent>
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={resetAndClose}
          className="min-h-[var(--app-touch-target-min)] min-w-24 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-border-subtle)]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={formLocked}
          onClick={handleSubmit}
          className="min-h-[var(--app-touch-target-min)] min-w-32 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {isSubmitting ? "Saving..." : "Add Expense"}
        </Button>
      </ModalFooter>
      <ActionAlertDialog
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        type="small"
        title="Add expense?"
        description={
          isPurchase ? (
            <>Record a purchase of <span className="font-semibold text-[var(--app-color-text)]">{quantityToAdd} {unit}</span> to <span className="font-semibold text-[var(--app-color-text)] [overflow-wrap:anywhere]">{selectedItem?.item_name}</span> with the price of <span className="font-semibold text-[var(--app-color-text)]">{formatCurrency(formData.amount)}</span>?</>
          ) : (
            <>Record a purchase of <span className="font-semibold text-[var(--app-color-text)] [overflow-wrap:anywhere]">{formData.description.trim()}</span> as a <span className="font-semibold text-[var(--app-color-text)]">{selectedCategory?.category_name}</span> expense of <span className="font-semibold text-[var(--app-color-text)]">{formatCurrency(formData.amount)}</span>?</>
          )
        }
        actions={[
          { key: "cancel", label: "Cancel", close: true },
          { key: "confirm", label: "Confirm", tone: "success", onClick: handleConfirmAdd, disabled: isSubmitting },
        ]}
      />
    </Modal>
    <BlockingFeedback
      open={isSubmitting || Boolean(savedResult)}
      status={isRefreshError ? "error" : "loading"}
      title={statusFeedback.title}
      message={statusFeedback.message}
      action={blockingAction}
    />
    </>
  );
};

const AddExpenseModal = ({
  isOpen,
  onClose,
  categories = [],
  refetch,
  initialCategoryName,
}) => {
  if (!isOpen) return null;

  return (
    <AddExpenseModalContent
      onClose={onClose}
      categories={categories}
      refetch={refetch}
      initialCategoryName={initialCategoryName}
    />
  );
};

export default AddExpenseModal;
