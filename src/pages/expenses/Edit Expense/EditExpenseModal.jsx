import React, { useState, useEffect, useRef } from 'react';
import './editExpenseModal.css';
import { updateExpense } from '../../../services/expenses/expenseService';

const EditExpenseModal = ({ isOpen, onClose, expenseData, categories, refetch }) => {
  const [formData, setFormData] = useState({
    category_id: '',
    expense_date: '',
    description: '',
    amount: '',
    vendor: '',
    payment_method: '',
    receipt_reference: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (isOpen && expenseData) {
      setFormData({
        category_id: expenseData.category_id || '',
        expense_date: expenseData.expense_date || '',
        description: expenseData.description || '',
        amount: expenseData.amount || '',
        vendor: expenseData.vendor || '',
        payment_method: expenseData.payment_method || '',
        receipt_reference: expenseData.receipt_reference || ''
      });
      setError(null);
      setErrors({});
      setHasAttemptedSubmit(false);
    }
  }, [isOpen, expenseData]);

  useEffect(() => {
    if (!isOpen) return;
    const newErrors = {};

    if (!formData.category_id) newErrors.category_id = 'Category is required.';
    if (!formData.expense_date) newErrors.expense_date = 'Date is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required.';
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be > 0.';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required.';
    }

    setErrors(newErrors);
  }, [formData, isOpen]);

  const isFormValid = Object.keys(errors).length === 0;

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid || isSubmitting) return;

    try {
      setError(null);
      setIsSubmitting(true);

      await updateExpense(expenseData.id, {
        category_id: formData.category_id,
        description: formData.description,
        amount: Number(formData.amount),
        vendor: formData.vendor || null,
        payment_method: formData.payment_method,
        receipt_reference: formData.receipt_reference || null,
        expense_date: formData.expense_date
      });

      await refetch();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="expense-modal-overlay">
      <div className="expense-modal-content">
        <div className="expense-modal-header">
          <h3>Edit Expense</h3>
          <button className="expense-modal-close" onClick={onClose} title="Close" disabled={isSubmitting}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="expense-modal-body">

          <div className="expense-form-grid expense-form-grid--2">
            <div className="expense-form-group">
              <label className="expense-form-label">Category *</label>
              <select
                className={`expense-form-select ${hasAttemptedSubmit && errors.category_id ? 'is-invalid' : ''}`}
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="" disabled>Select category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
              {hasAttemptedSubmit && errors.category_id && <p className="expense-modal-error-msg">{errors.category_id}</p>}
            </div>
            <div className="expense-form-group">
              <label className="expense-form-label">Date *</label>
              <input
                type="date"
                className={`expense-form-input ${hasAttemptedSubmit && errors.expense_date ? 'is-invalid' : ''}`}
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {hasAttemptedSubmit && errors.expense_date && <p className="expense-modal-error-msg">{errors.expense_date}</p>}
            </div>
          </div>

          <div className="expense-form-group">
            <label className="expense-form-label">Description *</label>
            <input
              type="text"
              className={`expense-form-input ${hasAttemptedSubmit && errors.description ? 'is-invalid' : ''}`}
              placeholder="e.g. Monthly Rent"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {hasAttemptedSubmit && errors.description && <p className="expense-modal-error-msg">{errors.description}</p>}
          </div>

          <div className="expense-form-grid expense-form-grid--2">
            <div className="expense-form-group">
              <label className="expense-form-label">Amount *</label>
              <div className="expense-amount-wrapper">
                <span className="expense-amount-symbol">₱</span>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  name="amount"
                  className={`${hasAttemptedSubmit && errors.amount ? 'is-invalid' : ''}`}
                  value={formData.amount}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              {hasAttemptedSubmit && errors.amount && <p className="expense-modal-error-msg">{errors.amount}</p>}
            </div>
            <div className="expense-form-group">
              <label className="expense-form-label">Vendor/Supplier</label>
              <input
                type="text"
                className="expense-form-input"
                placeholder="Optional"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="expense-form-group">
            <label className="expense-form-label">Payment Method *</label>
            <select
              className={`expense-form-select ${hasAttemptedSubmit && errors.payment_method ? 'is-invalid' : ''}`}
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="" disabled>Select payment method...</option>
              <option value="Cash">Cash</option>
              <option value="GCash">GCash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
            </select>
            {hasAttemptedSubmit && errors.payment_method && <p className="expense-modal-error-msg">{errors.payment_method}</p>}
          </div>

          <div className="expense-form-group">
            <label className="expense-form-label">Receipt Reference</label>
            <input
              type="text"
              className="expense-form-input"
              placeholder="Receipt # or URL"
              name="receipt_reference"
              value={formData.receipt_reference}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {error && <div style={{ color: '#dc3545', marginTop: '1rem', fontSize: '0.875rem', fontWeight: '500' }}>{error}</div>}
        </div>

        {hasAttemptedSubmit && !isFormValid && (
          <div style={{ color: '#dc3545', fontSize: '0.85rem', padding: '0 1.5rem', marginBottom: '1rem', textAlign: 'right', fontWeight: '500' }}>
            Please fill in all required fields (*)
          </div>
        )}

        <div className="expense-modal-footer">
          <button className="expense-modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button className="expense-modal-btn-save" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
