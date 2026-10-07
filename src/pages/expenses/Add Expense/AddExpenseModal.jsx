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
import { validateExpenseForm } from "@/utils/validation/expenses/expenseValidation";
import { getExpenseDateLimits } from "@/utils/expenses/expenseDateLimits";

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
  const [apiError, setApiError] = useState("");
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [dateLimits] = useState(() => getExpenseDateLimits());

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

  const errors = useMemo(() => {
    return validateExpenseForm(formData, { isPurchase, selectedItem, dateLimits });
  }, [formData, isPurchase, selectedItem, dateLimits]);
  const isFormValid = Object.keys(errors).length === 0;

  const errorFor = (fieldName) => {
    if (!hasAttemptedSubmit) return "";
    return errors[fieldName] || "";
  };

  const updateField = (fieldName, value) => {
    setFormData((currentForm) => {
      return {
        ...currentForm,
        [fieldName]: value,
      };
    });
  };

  const handleCategoryChange = (category) => {
    const nextCategoryId = category ? category.id : "";

    setFormData((currentForm) => {
      return {
        ...emptyForm,
        category_id: nextCategoryId,
        expense_date: currentForm.expense_date,
      };
    });
    setHasAttemptedSubmit(false);
    setApiError("");
    setIsCustomReason(false);
  };

  const handleItemChange = (inventoryItem) => {
    const inventoryItemId = inventoryItem ? inventoryItem.id : "";
    updateField("inventory_item_id", inventoryItemId);
  };

  const handleReasonChange = (nextReason) => {
    if (nextReason === "Others") {
      setIsCustomReason(true);
      updateField("reason", "");
      return;
    }

    updateField("reason", nextReason);
  };

  const resetAndClose = () => {
    setFormData(emptyForm);
    setHasAttemptedSubmit(false);
    setApiError("");
    setIsCustomReason(false);
    onClose();
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);

    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setApiError("");

      if (isPurchase) {
        const purchaseNotes = [
          `Description: ${formData.description.trim()}`,
          formData.notes.trim() ? `Note: ${formData.notes.trim()}` : "",
        ]
          .filter(Boolean)
          .join(" | ");

        await restockInventoryItem(selectedItem.id, {
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
          },
        });

        await refetch();
        resetAndClose();

        Promise.allSettled([
          refetchInventoryManagement(),
          refreshAuditLogs(),
          refreshValuation(),
        ]);
        return;
      }

      await addExpense({
        category_id: formData.category_id,
        expense_date: formData.expense_date,
        description: formData.description.trim(),
        amount: Number(formData.amount),
        vendor: formData.vendor.trim() || null,
        payment_method: formData.payment_method,
        receipt_reference: formData.receipt_reference.trim() || null,
      });
      await refetch();
      resetAndClose();
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={resetAndClose}
      maxWidth="32rem"
      maxHeight="min(90svh, 48rem)"
    >
      <ModalHeader
        title="Add Expense"
        description="Record a business expense or inventory purchase."
        iconClassName="bi bi-wallet2"
        closeDisabled={isSubmitting}
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
        <ModalContent>
          {apiError && (
            <p
              className="rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger-surface)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
              role="alert"
            >
              {apiError}
            </p>
          )}

          <div className="flex flex-col gap-[var(--app-gap-related)]">
            <Field data-invalid={Boolean(errorFor("category_id"))}>
              <FieldLabel className={labelClassName}>
                Category
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>

              <Combobox
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
                      minDate={dateLimits.minExpenseDate}
                      maxDate={dateLimits.maxExpenseDate}
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
                      minDate={dateLimits.minExpirationDate}
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
                      min="0.01"
                      step="0.01"
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
                      minDate={dateLimits.minExpenseDate}
                      maxDate={dateLimits.maxExpenseDate}
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

            {hasAttemptedSubmit && !isFormValid && (
              <p
                className="text-right text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
                role="alert"
              >
                Please fill in all required fields (*).
              </p>
            )}
          </div>
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
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="min-h-[var(--app-touch-target-min)] min-w-32 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {isSubmitting ? "Saving..." : "Add Expense"}
        </Button>
      </ModalFooter>
    </Modal>
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
