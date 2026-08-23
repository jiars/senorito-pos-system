import React, { useState, useEffect } from 'react';
import './addExpenseModal.css';
import { addExpense } from '../../../services/expenses/expenseService';
import { fetchInventoryItems } from '../../../services/inventory/inventoryItemsService';
import { logStockAdjustment, fetchItemBatches } from '../../../services/inventory/inventoryStockService';
import { useAuth } from '../../../hooks/useAuth';

const AddExpenseModal = ({ isOpen, onClose, categories, refetch }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    category_id: '',
    expense_date: '',
    description: '',
    amount: '',
    vendor: '',
    payment_method: '',
    receipt_reference: '',
    // New inventory fields
    inventory_item_id: '',
    quantity_to_add: '',
    expiration_date: '',
    quantity_to_deduct: '',
    wastage_reason: 'Expired',
    other_wastage_reason: '',
    selected_batch_id: ''
  });

  const [inventoryItems, setInventoryItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Check if selected category is Inventory Purchase or Wastage
  const selectedCategoryName = categories.find(c => c.id === formData.category_id)?.category_name;
  const isInventoryPurchase = selectedCategoryName === 'Inventory Purchase';
  const isInventoryWastage = selectedCategoryName === 'Inventory Wastage';

  // Get selected inventory item for preview calculations
  const selectedInventoryItem = inventoryItems.find(item => item.id === formData.inventory_item_id);

  useEffect(() => {
    if (isOpen) {
      const loadInventoryItems = async () => {
        try {
          const items = await fetchInventoryItems();
          setInventoryItems(items);
        } catch (err) {
          console.error("Failed to load inventory items", err);
        }
      };
      loadInventoryItems();

      // Clear error when opening
      setError(null);
    }
  }, [isOpen]);

  // Fetch batches when item is selected for wastage
  useEffect(() => {
    if (isInventoryWastage && formData.inventory_item_id) {
      fetchItemBatches(formData.inventory_item_id)
        .then(data => {
          const sorted = [...(data || [])].sort((a, b) => {
            if ((a.quantity > 0 && b.quantity > 0) || (a.quantity <= 0 && b.quantity <= 0)) return 0;
            return a.quantity > 0 ? -1 : 1;
          });
          setBatches(sorted);
          if (sorted.length > 0 && !formData.selected_batch_id) {
            setFormData(prev => ({ ...prev, selected_batch_id: sorted[0].id }));
          }
        })
        .catch(err => console.error("Error fetching batches:", err));
    } else {
      setBatches([]);
    }
  }, [formData.inventory_item_id, isInventoryWastage]);

  // Auto-calculate amount for Wastage
  useEffect(() => {
    if (isInventoryWastage && formData.selected_batch_id && formData.quantity_to_deduct) {
      const batch = batches.find(b => b.id === formData.selected_batch_id);
      const qty = Number(formData.quantity_to_deduct);
      if (batch && !isNaN(qty)) {
        const cost = Number(batch.unit_cost) || Number(selectedInventoryItem?.cost_per_unit) || 0;
        const loss = (qty * cost).toFixed(2);
        if (formData.amount !== loss) {
          setFormData(prev => ({ ...prev, amount: loss }));
        }
      }
    } else if (isInventoryWastage && (!formData.quantity_to_deduct || !formData.selected_batch_id)) {
      if (formData.amount !== '') {
        setFormData(prev => ({ ...prev, amount: '' }));
      }
    }
  }, [isInventoryWastage, formData.selected_batch_id, formData.quantity_to_deduct, batches, selectedInventoryItem]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      // Base Validation
      if (!formData.category_id || !formData.expense_date || !formData.description || !formData.amount || (!isInventoryWastage && !formData.payment_method)) {
        throw new Error("Please fill in all required fields.");
      }

      if (Number(formData.amount) <= 0) {
        throw new Error("Amount must be greater than 0.");
      }

      // Inventory Purchase Validation
      if (isInventoryPurchase) {
        if (!formData.inventory_item_id) {
          throw new Error("Please select an inventory item.");
        }
        if (!formData.quantity_to_add || Number(formData.quantity_to_add) <= 0) {
          throw new Error("Quantity to add must be greater than 0.");
        }
        if (selectedInventoryItem?.track_expiry && !formData.expiration_date) {
          throw new Error("Expiration date is required for this item.");
        }
      }

      // Inventory Wastage Validation
      if (isInventoryWastage) {
        if (!formData.inventory_item_id) {
          throw new Error("Please select an inventory item.");
        }
        if (!formData.selected_batch_id) {
          throw new Error("Please select a batch.");
        }
        const qtyToDeduct = Number(formData.quantity_to_deduct);
        if (!formData.quantity_to_deduct || qtyToDeduct <= 0) {
          throw new Error("Quantity to waste must be greater than 0.");
        }
        const selectedBatch = batches.find(b => b.id === formData.selected_batch_id);
        if (selectedBatch && qtyToDeduct > Number(selectedBatch.quantity)) {
          throw new Error(`Cannot waste more than current batch stock (${selectedBatch.quantity}).`);
        }
        if (formData.wastage_reason === 'Other' && !formData.other_wastage_reason.trim()) {
          throw new Error("Please specify the wastage reason.");
        }
      }

      setIsSubmitting(true);

      if (isInventoryPurchase) {
        const quantityChange = Number(formData.quantity_to_add);
        const currentStock = Number(selectedInventoryItem.current_stock || 0);
        const newTotalStock = currentStock + quantityChange;

        await logStockAdjustment({
          item: selectedInventoryItem,
          actionType: 'restock',
          quantityChange: quantityChange,
          newTotalStock: newTotalStock,
          userId: user.id,
          reason: "Purchase via Expense Module",
          notes: formData.description,
          totalCost: Number(formData.amount),
          supplier: formData.vendor || null,
          expirationDate: formData.expiration_date || null,
          expenseDate: formData.expense_date,
          paymentMethod: formData.payment_method,
          receiptReference: formData.receipt_reference || null,
          source: 'Expense Page'
        });

      } else if (isInventoryWastage) {
        const quantityChange = -Math.abs(Number(formData.quantity_to_deduct));
        const currentStock = Number(selectedInventoryItem.current_stock || 0);
        const newTotalStock = Math.max(0, currentStock + quantityChange);

        await logStockAdjustment({
          item: selectedInventoryItem,
          actionType: 'wastage',
          quantityChange: quantityChange,
          newTotalStock: newTotalStock,
          userId: user.id,
          reason: formData.wastage_reason === 'Other' ? formData.other_wastage_reason.trim() : formData.wastage_reason,
          notes: formData.description,
          totalCost: Number(formData.amount), // Automatically calculated earlier
          supplier: formData.vendor || null,
          expirationDate: null,
          selectedBatchId: formData.selected_batch_id,
          expenseDate: formData.expense_date,
          paymentMethod: 'N/A (Loss)',
          receiptReference: null,
          source: 'Expense Page'
        });

      } else {
        await addExpense({
          category_id: formData.category_id,
          description: formData.description,
          amount: Number(formData.amount),
          vendor: formData.vendor || null,
          payment_method: formData.payment_method,
          receipt_reference: formData.receipt_reference || null,
          expense_date: formData.expense_date,
          recorded_by: user.id
        });
      }

      // Reset form
      setFormData({
        category_id: '',
        expense_date: '',
        description: '',
        amount: '',
        vendor: '',
        payment_method: '',
        receipt_reference: '',
        inventory_item_id: '',
        quantity_to_add: '',
        expiration_date: '',
        quantity_to_deduct: '',
        wastage_reason: 'Expired',
        other_wastage_reason: '',
        selected_batch_id: ''
      });

      await refetch();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations for previews
  const quantityAdded = Number(formData.quantity_to_add) || 0;
  const quantityDeducted = Number(formData.quantity_to_deduct) || 0;
  const currentStock = selectedInventoryItem ? Number(selectedInventoryItem.current_stock) : 0;
  const newStockPreview = currentStock + quantityAdded;
  const newStockPreviewWastage = Math.max(0, currentStock - quantityDeducted);
  const baseUnit = selectedInventoryItem ? selectedInventoryItem.base_unit : '';

  const amountVal = Number(formData.amount) || 0;
  const newCostPerUnit = quantityAdded > 0 ? (amountVal / quantityAdded).toFixed(2) : '0.00';

  return (
    <div className="expense-modal-overlay">
      <div className="expense-modal-content">
        <div className="expense-modal-header">
          <h3>Add Expense</h3>
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
            {!isInventoryPurchase && (
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
                    disabled={isSubmitting || isInventoryWastage}
                    title={isInventoryWastage ? "Amount is automatically calculated from batch cost" : ""}
                  />
                </div>
                {isInventoryWastage && (
                  <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.25rem' }}>
                    Auto-calculated from batch cost
                  </div>
                )}
              </div>
            )}
            <div className="expense-form-group" style={isInventoryPurchase ? { gridColumn: 'span 2' } : {}}>
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

          {/* DYNAMIC INVENTORY FIELDS */}
          {(isInventoryPurchase || isInventoryWastage) && (
            <div className="expense-inventory-section" style={{ borderLeft: '4px solid #D9C0AE', paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <div className="expense-form-group" style={{ marginBottom: '1rem' }}>
                <label className="expense-form-label">Inventory Item *</label>
                <select
                  className="expense-form-select"
                  name="inventory_item_id"
                  value={formData.inventory_item_id}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="" disabled>
                    {isInventoryWastage ? 'Select item to waste...' : 'Select item to restock...'}
                  </option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>{item.item_name}</option>
                  ))}
                </select>
                {selectedInventoryItem && (
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.35rem' }}>
                    Current stock: <strong style={{ color: '#2C1810' }}>{selectedInventoryItem.current_stock} {selectedInventoryItem.base_unit}</strong>
                  </div>
                )}
              </div>

              {/* WASTAGE SPECIFIC FIELDS */}
              {isInventoryWastage ? (
                <>
                  <div className="expense-form-group" style={{ marginBottom: '1rem' }}>
                    <label className="expense-form-label">Select Batch *</label>
                    <select
                      className="expense-form-select"
                      name="selected_batch_id"
                      value={formData.selected_batch_id}
                      onChange={handleChange}
                      disabled={isSubmitting || batches.length === 0}
                    >
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.batch_number} ({b.quantity} left) {b.expiration_date ? `- Exp: ${b.expiration_date}` : ''}
                        </option>
                      ))}
                      {batches.length === 0 && (
                        <option value="" disabled>No batches available</option>
                      )}
                    </select>
                  </div>

                  <div className="expense-form-grid expense-form-grid--2" style={{ marginBottom: '1rem' }}>
                    <div className="expense-form-group">
                      <label className="expense-form-label">Quantity to Remove *</label>
                      <input
                        type="number"
                        className="expense-form-input"
                        name="quantity_to_deduct"
                        value={formData.quantity_to_deduct}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="0"
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    <div className="expense-form-group">
                      <label className="expense-form-label">New Stock (preview)</label>
                      <input
                        type="text"
                        className="expense-form-input"
                        value={`${newStockPreviewWastage} ${baseUnit}`}
                        disabled
                        style={{ backgroundColor: '#FAFAFA', color: '#6c757d', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div className="expense-form-grid expense-form-grid--2" style={{ marginBottom: '1rem' }}>
                    <div className="expense-form-group">
                      <label className="expense-form-label">Reason *</label>
                      <select
                        className="expense-form-select"
                        name="wastage_reason"
                        value={formData.wastage_reason}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      >
                        <option value="Expired">Expired</option>
                        <option value="Spilled">Spilled</option>
                        <option value="Spoiled/Damaged">Spoiled/Damaged</option>
                        <option value="Quality Issue">Quality Issue</option>
                        <option value="Theft/Lost">Theft/Lost</option>
                        <option value="Other">Other (Please specify)</option>
                      </select>
                    </div>
                    <div className="expense-form-group">
                      <label className="expense-form-label">
                        {formData.wastage_reason === 'Other' ? 'Specify Reason *' : 'Notes (Optional)'}
                      </label>
                      <input
                        type="text"
                        className="expense-form-input"
                        name={formData.wastage_reason === 'Other' ? "other_wastage_reason" : "description"}
                        value={formData.wastage_reason === 'Other' ? formData.other_wastage_reason : formData.description}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder={formData.wastage_reason === 'Other' ? "Specify reason..." : "Enter details..."}
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* RESTOCK SPECIFIC FIELDS */
                <>
                  <div className="expense-form-grid expense-form-grid--2" style={{ marginBottom: '1rem' }}>
                    <div className="expense-form-group">
                      <label className="expense-form-label">Quantity to Add *</label>
                      <input
                        type="number"
                        className="expense-form-input"
                        name="quantity_to_add"
                        value={formData.quantity_to_add}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="0"
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <div className="expense-form-group">
                      <label className="expense-form-label">New Stock (preview)</label>
                      <input
                        type="text"
                        className="expense-form-input"
                        value={`${newStockPreview} ${baseUnit}`}
                        disabled
                        style={{ backgroundColor: '#FAFAFA', color: '#6c757d', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div className="expense-form-grid expense-form-grid--2" style={{ marginBottom: '1rem' }}>
                    <div className="expense-form-group">
                      <label className="expense-form-label">Total Purchase Cost *</label>
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
                      <label className="expense-form-label">New Cost per Unit</label>
                      <div className="expense-amount-wrapper" style={{ backgroundColor: '#FAFAFA', cursor: 'not-allowed' }}>
                        <span className="expense-amount-symbol" style={{ backgroundColor: '#FAFAFA' }}>₱</span>
                        <input
                          type="text"
                          value={newCostPerUnit}
                          disabled
                          style={{ color: '#6c757d', cursor: 'not-allowed' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="expense-form-grid expense-form-grid--2">
                    <div className="expense-form-group">
                      <label className="expense-form-label">
                        Expiration Date {selectedInventoryItem?.track_expiry && '*'}
                      </label>
                      <input
                        type="date"
                        className="expense-form-input"
                        name="expiration_date"
                        value={formData.expiration_date}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                      <small style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '0.25rem' }}>
                        {selectedInventoryItem?.track_expiry ? 'Required for expiry-tracked items' : 'Optional'}
                      </small>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FAFAFA', border: '1px solid #E9ECEF', borderRadius: '8px', fontSize: '0.8rem', color: '#495057', display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                    <i className="bi bi-info-circle-fill" style={{ color: '#7A4B35', marginTop: '0.1rem' }}></i>
                    <span>Recording an inventory purchase expense will automatically update the inventory with a new restock. The updated cost per unit will take effect once the new batch is utilized.</span>
                  </div>
                </>
              )}
            </div>
          )}

          {!isInventoryWastage && (
            <>
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
            </>
          )}

          {error && <div style={{ color: '#dc3545', marginTop: '1rem', fontSize: '0.875rem', fontWeight: '500' }}>{error}</div>}
        </div>

        <div className="expense-modal-footer">
          <button className="expense-modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button className="expense-modal-btn-save" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
