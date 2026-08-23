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
    }
  }, [isOpen, expenseData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      if (!formData.category_id || !formData.expense_date || !formData.description || !formData.amount || !formData.payment_method) {
        throw new Error("Please fill in all required fields.");
      }

      if (Number(formData.amount) <= 0) {
        throw new Error("Amount must be greater than 0.");
      }

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
                className="expense-form-select"
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
            </div>
            <div className="expense-form-group">
              <label className="expense-form-label">Date *</label>
              <input
                type="date"
                className="expense-form-input"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="expense-form-group">
            <label className="expense-form-label">Description *</label>
            <input
              type="text"
              className="expense-form-input"
              placeholder="e.g. Monthly Rent"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
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
                  value={formData.amount}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
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
              className="expense-form-select"
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
