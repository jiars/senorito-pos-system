import React from "react";

const FieldError = ({ message }) =>
  message ? <p className="expense-modal-error-msg">{message}</p> : null;

const EditExpenseFields = ({
  formData,
  errors,
  showErrors,
  categories,
  isSubmitting,
  onChange,
}) => {
  const errorFor = (field) => (showErrors ? errors[field] : "");

  return (
    <>
      <div className="expense-form-grid expense-form-grid--2">
        <div className="expense-form-group">
          <label className="expense-form-label">Category *</label>
          <select
            className={`expense-form-select ${errorFor("category_id") ? "is-invalid" : ""}`}
            name="category_id"
            value={formData.category_id}
            onChange={onChange}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select category...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
          <FieldError message={errorFor("category_id")} />
        </div>

        <div className="expense-form-group">
          <label className="expense-form-label">Date *</label>
          <input
            type="date"
            className={`expense-form-input ${errorFor("expense_date") ? "is-invalid" : ""}`}
            name="expense_date"
            value={formData.expense_date}
            onChange={onChange}
            disabled={isSubmitting}
          />
          <FieldError message={errorFor("expense_date")} />
        </div>
      </div>

      <div className="expense-form-group">
        <label className="expense-form-label">Description *</label>
        <input
          type="text"
          className={`expense-form-input ${errorFor("description") ? "is-invalid" : ""}`}
          name="description"
          value={formData.description}
          onChange={onChange}
          disabled={isSubmitting}
        />
        <FieldError message={errorFor("description")} />
      </div>

      <div className="expense-form-grid expense-form-grid--2">
        <div className="expense-form-group">
          <label className="expense-form-label">Amount *</label>
          <div className="expense-amount-wrapper">
            <span className="expense-amount-symbol">₱</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={onChange}
              min="0.01"
              step="0.01"
              className={errorFor("amount") ? "is-invalid" : ""}
              disabled={isSubmitting}
            />
          </div>
          <FieldError message={errorFor("amount")} />
        </div>

        <div className="expense-form-group">
          <label className="expense-form-label">Vendor/Supplier</label>
          <input
            type="text"
            className="expense-form-input"
            name="vendor"
            value={formData.vendor}
            onChange={onChange}
            placeholder="Optional"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="expense-form-group">
        <label className="expense-form-label">Payment Method *</label>
        <select
          className={`expense-form-select ${errorFor("payment_method") ? "is-invalid" : ""}`}
          name="payment_method"
          value={formData.payment_method}
          onChange={onChange}
          disabled={isSubmitting}
        >
          <option value="" disabled>Select payment method...</option>
          <option value="Cash">Cash</option>
          <option value="GCash">GCash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Credit Card">Credit Card</option>
        </select>
        <FieldError message={errorFor("payment_method")} />
      </div>

      <div className="expense-form-group">
        <label className="expense-form-label">Receipt Reference</label>
        <input
          type="text"
          className="expense-form-input"
          name="receipt_reference"
          value={formData.receipt_reference}
          onChange={onChange}
          placeholder="Receipt number or URL"
          disabled={isSubmitting}
        />
      </div>
    </>
  );
};

export default EditExpenseFields;
