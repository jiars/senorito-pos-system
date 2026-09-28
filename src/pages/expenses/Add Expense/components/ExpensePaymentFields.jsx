const ExpensePaymentFields = ({
  formData,
  paymentError,
  showError,
  isSubmitting,
  onChange,
}) => (
  <>
    <div className="expense-form-group">
      <label className="expense-form-label">Payment Method *</label>
      <select
        className={`expense-form-select ${showError && paymentError ? "is-invalid" : ""}`}
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
      {showError && paymentError && (
        <p className="expense-modal-error-msg">{paymentError}</p>
      )}
    </div>

    <div className="expense-form-group">
      <label className="expense-form-label">Receipt Reference</label>
      <input
        type="text"
        className="expense-form-input"
        name="receipt_reference"
        value={formData.receipt_reference}
        onChange={onChange}
        placeholder="Receipt # or URL"
        disabled={isSubmitting}
      />
    </div>
  </>
);

export default ExpensePaymentFields;
