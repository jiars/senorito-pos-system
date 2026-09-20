const FieldError = ({ message }) =>
  message ? <p className="expense-modal-error-msg">{message}</p> : null;

const InventoryExpenseFields = ({
  formData,
  errors,
  showErrors,
  inventoryItems,
  selectedItem,
  isPurchase,
  isSubmitting,
  onChange,
}) => {
  if (!isPurchase) return null;

  const errorFor = (field) => (showErrors ? errors[field] : "");
  const quantity = Number(formData.quantity_to_add) || 0;
  const currentStock = Number(selectedItem?.current_stock || 0);
  const newStock = currentStock + quantity;
  const newCostPerUnit = quantity > 0
    ? (Number(formData.amount || 0) / quantity).toFixed(2)
    : "0.00";

  return (
    <div className="expense-inventory-section">
      <div className="expense-form-group">
        <label className="expense-form-label">Inventory Item *</label>
        <select
          className={`expense-form-select ${errorFor("inventory_item_id") ? "is-invalid" : ""}`}
          name="inventory_item_id"
          value={formData.inventory_item_id}
          onChange={onChange}
          disabled={isSubmitting}
        >
          <option value="" disabled>Select item to restock...</option>
          {inventoryItems.map((item) => (
            <option key={item.id} value={item.id}>{item.item_name}</option>
          ))}
        </select>
        <FieldError message={errorFor("inventory_item_id")} />
      </div>

      <div className="expense-form-grid expense-form-grid--2">
        <div className="expense-form-group">
          <label className="expense-form-label">Quantity to Add *</label>
          <input
            type="number"
            className={`expense-form-input ${errorFor("quantity_to_add") ? "is-invalid" : ""}`}
            name="quantity_to_add"
            value={formData.quantity_to_add}
            onChange={onChange}
            min="0.01"
            step="0.01"
            placeholder="0"
            disabled={isSubmitting}
          />
          <FieldError message={errorFor("quantity_to_add")} />
        </div>

        <div className="expense-form-group">
          <label className="expense-form-label">New Stock (preview)</label>
          <input
            type="text"
            className="expense-form-input"
            value={`${newStock} ${selectedItem?.base_unit || ""}`}
            disabled
          />
        </div>
      </div>

      <div className="expense-form-grid expense-form-grid--2">
        <div className="expense-form-group">
          <label className="expense-form-label">Total Purchase Cost *</label>
          <div className="expense-amount-wrapper">
            <span className="expense-amount-symbol">₱</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={onChange}
              min="1"
              step="0.01"
              placeholder="0.00"
              className={errorFor("amount") ? "is-invalid" : ""}
              disabled={isSubmitting}
            />
          </div>
          <FieldError message={errorFor("amount")} />
        </div>

        <div className="expense-form-group">
          <label className="expense-form-label">New Cost per Unit</label>
          <div className="expense-amount-wrapper">
            <span className="expense-amount-symbol">₱</span>
            <input type="text" value={newCostPerUnit} disabled />
          </div>
        </div>
      </div>

      <div className="expense-form-group expense-expiry-field">
        <label className="expense-form-label">
          Expiration Date {selectedItem?.track_expiry ? "*" : "(Optional)"}
        </label>
        <input
          type="date"
          className={`expense-form-input ${errorFor("expiration_date") ? "is-invalid" : ""}`}
          name="expiration_date"
          value={formData.expiration_date}
          onChange={onChange}
          disabled={isSubmitting}
        />
        <FieldError message={errorFor("expiration_date")} />
        {!errorFor("expiration_date") && (
          <small className="expense-field-help">
            {selectedItem?.track_expiry
              ? "Required for expiry-tracked items"
              : "Optional"}
          </small>
        )}
      </div>

      <div className="expense-inventory-notice">
        <i className="bi bi-info-circle-fill" />
        <span>
          Recording an inventory purchase expense will automatically update
          the inventory with a new restock. The updated cost per unit will take
          effect once the new batch is utilized.
        </span>
      </div>
    </div>
  );
};

export default InventoryExpenseFields;
