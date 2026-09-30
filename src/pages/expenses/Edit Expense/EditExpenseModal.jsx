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
import { updateExpense } from "@/services/expenses/expenseService";
import { validateExpenseForm } from "@/utils/validation/expenses/expenseValidation";

const vendorCategoryNames = new Set([
  "cleaning supplies",
  "equipment",
  "utilities",
  "maintenance",
]);

const paymentMethods = ["Cash", "GCash", "Bank Transfer", "Credit Card"];

const labelClassName =
  "text-[length:var(--app-font-size-caption)] font-semibold leading-[var(--app-line-height-caption)] text-[var(--app-color-text)]";
const controlClassName =
  "h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0";

const normalizeDateValue = (value) => {
  const dateValue = String(value || "");
  const dateMatch = dateValue.match(/^\d{4}-\d{2}-\d{2}/);
  return dateMatch ? dateMatch[0] : "";
};

const createExpenseForm = (expenseData) => ({
  category_id: expenseData.category_id || "",
  expense_date: normalizeDateValue(expenseData.expense_date),
  description: expenseData.description || "",
  amount: expenseData.amount || "",
  vendor: expenseData.vendor || "",
  payment_method: expenseData.payment_method || "",
  receipt_reference: expenseData.receipt_reference || "",
});

const EditExpenseModalContent = ({
  onClose,
  expenseData,
  categories,
  refetch,
}) => {
  const [formData, setFormData] = useState(() => {
    return createExpenseForm(expenseData);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const selectedCategory = categories.find((category) => {
    return String(category.id) === String(formData.category_id);
  });
  const normalizedCategoryName = selectedCategory
    ? selectedCategory.category_name.trim().toLowerCase()
    : "";
  const showVendor =
    vendorCategoryNames.has(normalizedCategoryName) || Boolean(formData.vendor);

  const errors = useMemo(() => {
    return validateExpenseForm(formData);
  }, [formData]);
  const isFormValid = Object.keys(errors).length === 0;

  const errorFor = (fieldName) => {
    if (!hasAttemptedSubmit) return "";
    return errors[fieldName] || "";
  };

  const updateField = (fieldName, value) => {
    setFormData((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
  };

  const handleCategoryChange = (category) => {
    updateField("category_id", category?.id || "");
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setApiError("");

      await updateExpense(expenseData.id, {
        category_id: formData.category_id,
        expense_date: formData.expense_date,
        description: formData.description.trim(),
        amount: Number(formData.amount),
        vendor: formData.vendor.trim() || null,
        payment_method: formData.payment_method,
        receipt_reference: formData.receipt_reference.trim() || null,
      });

      await refetch();
      onClose();
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="32rem"
      maxHeight="min(90svh, 48rem)"
    >
      <ModalHeader
        title="Edit Expense"
        description="Update the selected expense record."
        iconClassName="bi bi-pencil-square"
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
                  return String(category?.id) === String(value?.id);
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
                    {(category) => (
                      <ComboboxItem
                        key={category.id}
                        value={category}
                        className="min-h-[var(--app-touch-target-min)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {category.category_name}
                        </span>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              {errorFor("category_id") && (
                <FieldError className="text-[length:var(--app-font-size-caption)]">
                  {errorFor("category_id")}
                </FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(errorFor("description"))}>
              <FieldLabel
                htmlFor="edit-expense-description"
                className={labelClassName}
              >
                Description
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>
              <Input
                id="edit-expense-description"
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
                  htmlFor="edit-expense-amount"
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
                    id="edit-expense-amount"
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
                  htmlFor="edit-expense-date"
                  className={labelClassName}
                >
                  Date
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                <DatePicker
                  id="edit-expense-date"
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
                  htmlFor="edit-expense-payment-method"
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
                    id="edit-expense-payment-method"
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
                  htmlFor="edit-expense-receipt"
                  className={labelClassName}
                >
                  Receipt
                </FieldLabel>
                <Input
                  id="edit-expense-receipt"
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
                  htmlFor="edit-expense-vendor"
                  className={labelClassName}
                >
                  Vendor / Supplier
                </FieldLabel>
                <Input
                  id="edit-expense-vendor"
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
          onClick={onClose}
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
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const EditExpenseModal = ({
  isOpen,
  onClose,
  expenseData,
  categories = [],
  refetch,
}) => {
  if (!isOpen || !expenseData) return null;

  return (
    <EditExpenseModalContent
      key={expenseData.id}
      onClose={onClose}
      expenseData={expenseData}
      categories={categories}
      refetch={refetch}
    />
  );
};

export default EditExpenseModal;
