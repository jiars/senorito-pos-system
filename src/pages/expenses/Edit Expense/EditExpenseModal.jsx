import React, { useState, useEffect, useRef } from 'react';
import './editExpenseModal.css';

const EditExpenseModal = ({ isOpen, onClose, expenseData }) => {
  const [fileName, setFileName] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    date: '',
    description: '',
    amount: '',
    vendor: '',
    paymentMethod: '',
    receiptRef: ''
  });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && expenseData) {
      setFormData({
        category: expenseData.category || '',
        date: expenseData.date || '',
        description: expenseData.description || '',
        amount: expenseData.amount ? expenseData.amount.replace('₱', '').replace(',', '') : '',
        vendor: expenseData.vendor || '',
        paymentMethod: expenseData.paymentMethod || '',
        receiptRef: expenseData.receiptRef || ''
      });
      setFileName(expenseData.receiptFile || '');
    }
  }, [isOpen, expenseData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="expense-modal-overlay">
      <div className="expense-modal-content">
        <div className="expense-modal-header">
          <h3>Edit Expense</h3>
          <button className="expense-modal-close" onClick={onClose} title="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="expense-modal-body">
          <div className="expense-form-grid expense-form-grid--2">
            <div className="expense-form-group">
              <label className="expense-form-label">Category</label>
              <select 
                className="expense-form-select" 
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="" disabled>Select category...</option>
                <option value="Rent">Rent</option>
                <option value="Inventory Purchase">Inventory Purchase</option>
                <option value="Utilities">Utilities</option>
                <option value="Salaries">Salaries</option>
              </select>
            </div>
            <div className="expense-form-group">
              <label className="expense-form-label">Date</label>
              <input 
                type="date" 
                className="expense-form-input" 
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="expense-form-group">
            <label className="expense-form-label">Description</label>
            <input 
              type="text" 
              className="expense-form-input" 
              placeholder="e.g. Monthly Rent" 
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="expense-form-grid expense-form-grid--2">
            <div className="expense-form-group">
              <label className="expense-form-label">Amount</label>
              <div className="expense-amount-wrapper">
                <span className="expense-amount-symbol">₱</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.01" 
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
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
              />
            </div>
          </div>

          <div className="expense-form-group">
            <label className="expense-form-label">Payment Method</label>
            <select 
              className="expense-form-select"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
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
              name="receiptRef"
              value={formData.receiptRef}
              onChange={handleChange}
            />
          </div>

          <div className="expense-form-group">
            <label className="expense-form-label">Receipt File</label>
            <div className="expense-file-wrapper">
              <div className="expense-file-btn" onClick={handleChooseFile}>Choose File</div>
              <div className="expense-file-name" style={{ color: fileName ? '#2C1810' : '#adb5bd' }}>
                {fileName || 'No file chosen'}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
            </div>
          </div>
        </div>

        <div className="expense-modal-footer">
          <button className="expense-modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="expense-modal-btn-save" onClick={onClose}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
