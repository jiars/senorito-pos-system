import { useState } from "react";
import { updateExpense } from "../../../services/expenses/expenseService";
import EditExpenseFields from "./components/EditExpenseFields";
import EditExpenseFooter from "./components/EditExpenseFooter";
import EditExpenseHeader from "./components/EditExpenseHeader";
import "./editExpenseModal.css";
import { validateExpenseForm } from "../../../utils/validation/expenses/expenseValidation";

const createExpenseForm = (expenseData) => ({
  category_id: expenseData.category_id || "",
  expense_date: expenseData.expense_date || "",
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
  const [formData, setFormData] = useState(() =>
    createExpenseForm(expenseData),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const errors = validateExpenseForm(formData);
  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
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
    <div className="expense-modal-overlay">
      <div className="expense-modal-content">
        <EditExpenseHeader onClose={onClose} isSubmitting={isSubmitting} />

        <div className="expense-modal-body">
          <EditExpenseFields
            formData={formData}
            errors={errors}
            showErrors={hasAttemptedSubmit}
            categories={categories}
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

        <EditExpenseFooter
          onClose={onClose}
          onSave={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

const EditExpenseModal = ({
  isOpen,
  onClose,
  expenseData,
  categories,
  refetch,
}) => {
  if (!isOpen || !expenseData) {
    return null;
  }

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
