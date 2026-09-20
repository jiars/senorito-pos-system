import { useState } from "react";
import { useInventoryManagement } from "../../../hooks/useInventoryManagement";
import { useRefreshInventoryAuditLogs } from "../../../hooks/useInventoryAuditLogs";
import { useRefreshInventoryValuation } from "../../../hooks/useInventoryValuation";
import { addExpense } from "../../../services/expenses/expenseService";
import { restockInventoryItem } from "../../../services/inventory/stock/restockService";
import AddExpenseFields from "./components/AddExpenseFields";
import AddExpenseFooter from "./components/AddExpenseFooter";
import AddExpenseHeader from "./components/AddExpenseHeader";
import ExpensePaymentFields from "./components/ExpensePaymentFields";
import InventoryExpenseFields from "./components/InventoryExpenseFields";
import { validateExpenseForm } from "../../../utils/validation/expenses/expenseValidation";
import "./addExpenseModal.css";

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
};

const AddExpenseModalContent = ({ onClose, categories, refetch }) => {
  const {
    inventoryItems,
    refetchInventoryManagement,
  } = useInventoryManagement();
  const refreshAuditLogs = useRefreshInventoryAuditLogs();
  const refreshValuation = useRefreshInventoryValuation();

  const [formData, setFormData] = useState(emptyForm);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const visibleCategories = categories.filter(
    (category) => category.category_name !== "Inventory Wastage",
  );
  const selectedCategory = visibleCategories.find(
    (category) => category.id === formData.category_id,
  );
  const isPurchase = selectedCategory?.category_name === "Inventory Purchase";
  const selectedItem = inventoryItems.find(
    (item) => item.id === formData.inventory_item_id,
  );
  const errors = validateExpenseForm(formData, { isPurchase, selectedItem });
  const isFormValid = Object.keys(errors).length === 0;

  const resetAndClose = () => {
    setFormData(emptyForm);
    setHasAttemptedSubmit(false);
    setApiError("");
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => {
      if (name === "category_id") {
        return { ...emptyForm, category_id: value, expense_date: current.expense_date };
      }
      return { ...current, [name]: value };
    });
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setApiError("");

      if (isPurchase) {
        await restockInventoryItem(selectedItem.id, {
          stockData: {
            quantity: Number(formData.quantity_to_add),
            reason: "Purchase via Expense Module",
            notes: formData.description.trim(),
          },
          purchaseData: {
            total_cost: Number(formData.amount),
            supplier: formData.vendor.trim() || null,
            expiration_date: formData.expiration_date || null,
            expense_date: formData.expense_date,
            payment_method: formData.payment_method,
            receipt_reference: formData.receipt_reference.trim() || null,
          },
        });
        // Refresh the current Expense page before closing the modal.
        await refetch();
        resetAndClose();

        // Refresh Inventory-related pages in the background.
        Promise.allSettled([
          refetchInventoryManagement(),
          refreshAuditLogs(),
          refreshValuation(),
        ]);
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
        await refetch();
        resetAndClose();
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="expense-modal-overlay">
      <div className="expense-modal-content">
        <AddExpenseHeader
          onClose={resetAndClose}
          isSubmitting={isSubmitting}
        />

        <div className="expense-modal-body">
          <AddExpenseFields
            formData={formData}
            errors={errors}
            showErrors={hasAttemptedSubmit}
            categories={visibleCategories}
            isSubmitting={isSubmitting}
            isPurchase={isPurchase}
            onChange={handleChange}
          />

          <InventoryExpenseFields
            formData={formData}
            errors={errors}
            showErrors={hasAttemptedSubmit}
            inventoryItems={inventoryItems}
            selectedItem={selectedItem}
            isPurchase={isPurchase}
            isSubmitting={isSubmitting}
            onChange={handleChange}
          />

          <ExpensePaymentFields
            formData={formData}
            paymentError={errors.payment_method}
            showError={hasAttemptedSubmit}
            isSubmitting={isSubmitting}
            onChange={handleChange}
          />

          {apiError && <p className="expense-modal-error-msg">{apiError}</p>}
        </div>

        {hasAttemptedSubmit && !isFormValid && (
          <p className="expense-modal-form-error">
            Please fill in all required fields (*).
          </p>
        )}

        <AddExpenseFooter
          onClose={resetAndClose}
          onSave={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

const AddExpenseModal = ({ isOpen, onClose, categories, refetch }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <AddExpenseModalContent
      onClose={onClose}
      categories={categories}
      refetch={refetch}
    />
  );
};

export default AddExpenseModal;
