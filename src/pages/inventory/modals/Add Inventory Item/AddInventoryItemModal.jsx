import React, { useState } from 'react';

import { addInventoryItem } from '../../../../services/inventory/inventoryItemsService';
import { validateAddInventoryItem } from '../../../../utils/validation/inventory/addInventoryValidation';
import AddInventoryBaseInfo from './components/AddInventoryBaseInfo';
import InitialPurchaseSection from './components/InitialPurchaseSection';
import ConversionUnitsSection from './components/ConversionUnitsSection';
import ExpiryAndNoteSection from './components/ExpiryAndNoteSection';

import './addInventoryItemModal.css';

const AddInventoryItemModal = ({ isOpen, onClose, existingItems = [], categories = [], units = [], refetchInventory }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [qtyPurchased, setQtyPurchased] = useState('');
  const [purchaseUnit, setPurchaseUnit] = useState('');
  const [purchaseMultiplier, setPurchaseMultiplier] = useState('1'); // Default to 1
  const [totalCost, setTotalCost] = useState('');
  const [minLevel, setMinLevel] = useState('');
  const [supplier, setSupplier] = useState('');

  const [conversions, setConversions] = useState([]);

  const [trackExpiry, setTrackExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [note, setNote] = useState('');

  // Track if user attempted to submit
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setItemName('');
      setUnit('');
      setCategory('');
      setQtyPurchased('');
      setPurchaseUnit('');
      setPurchaseMultiplier('1');
      setTotalCost('');
      setMinLevel('');
      setSupplier('');
      setConversions([]);
      setTrackExpiry(false);
      setExpiryDate('');
      setNote('');
      setHasAttemptedSubmit(false);
    }
  }, [isOpen]);

  const getStandardMultiplier = (base, purchase) => {
    if (!base || !purchase) return null;
    const b = base.toLowerCase();
    const p = purchase.toLowerCase();

    if (b === p || p === b + 's' || p === b + 'es') return '1';
    if (b === 'ml' && (p === 'l' || p === 'liter' || p === 'liters')) return '1000';
    if (b === 'g' && (p === 'kg' || p === 'kilo' || p === 'kilos' || p === 'kilogram')) return '1000';

    return null;
  };

  React.useEffect(() => {
    const std = getStandardMultiplier(unit, purchaseUnit);
    if (std) {
      setPurchaseMultiplier(std);
    }
  }, [unit, purchaseUnit]);

  if (!isOpen) return null;

  const handleExpiryToggle = (e) => {
    const isChecked = e.target.checked;
    setTrackExpiry(isChecked);
    if (!isChecked) {
      setExpiryDate('');
    }
  };

  const handleAddConversion = () => {
    setConversions([...conversions, { id: Date.now(), unit: '', equivalent: '' }]);
  };

  const handleRemoveConversion = (id) => {
    setConversions(conversions.filter(c => c.id !== id));
  };

  const handleConversionChange = (id, field, value) => {
    setConversions(conversions.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // ─── Validation Logic ───
  const validation = validateAddInventoryItem({
    itemName,
    existingItems,
    unit,
    category,
    qtyPurchased,
    purchaseUnit,
    purchaseMultiplier,
    totalCost,
    minLevel,
    conversions,
    trackExpiry,
    expiryDate
  });

  const {
    isNameEmpty,
    isDuplicateName,
    parsedQty,
    isQtyValid,
    parsedCost,
    isCostValid,
    isMinValid,
    parsedMultiplier,
    isMultiplierValid,
    isExpiryEmpty,
    hasValidFutureDate,
    isExpiryValid,
    isFormValid
  } = validation;

  // ─── Helpers for Computed Costs ───
  const getBaseQuantity = () => {
    if (!isQtyValid || !isMultiplierValid) return parsedQty;
    return parsedQty * parsedMultiplier;
  };

  const getBaseUnitCost = () => {
    if (!isQtyValid || !isCostValid || !isMultiplierValid) return null;
    const costPerPurchaseUnit = parsedCost / parsedQty;
    return costPerPurchaseUnit / parsedMultiplier;
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const computedCostPerUnit = parseFloat((parseFloat(totalCost) / getBaseQuantity()).toFixed(2));

      const validConversions = conversions.filter(c => c.unit !== '' && c.equivalent !== '');
      const conversionsData = validConversions.map(c => ({
        converted_unit: c.unit,
        equivalent_base_amount: parseFloat(c.equivalent)
      }));

      // Build one nested payload, like the Menu Add flow.
      const payload = {
        itemData: {
          item_name: itemName.trim(),
          category_id: category,
          base_unit: unit,
          minimum_level: parseFloat(minLevel),
          supplier: supplier.trim() || null,
          cost_per_unit: computedCostPerUnit,
          current_stock: getBaseQuantity(),
          track_expiry: trackExpiry
        },
        purchaseData: {
          quantity_purchased: parseFloat(qtyPurchased),
          purchase_unit: purchaseUnit,
          purchase_multiplier: parsedMultiplier,
          total_cost: parseFloat(totalCost),
          cost_per_unit: computedCostPerUnit,
          supplier: supplier.trim() || null,
          expiration_date: trackExpiry ? expiryDate : null,
          note: note.trim() || null
        },
        conversionsData
      };

      await addInventoryItem(payload);

      if (refetchInventory) await refetchInventory();
      onClose();
    } catch (error) {
      console.error("Error adding item:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inventory-modal-overlay">
      <div className="inventory-modal-content">
        <div className="inventory-modal-header">
          <h3>Add Inventory Item</h3>
          <button className="inventory-modal-close" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="inventory-modal-body">
          <AddInventoryBaseInfo
            itemName={itemName}
            setItemName={setItemName}
            unit={unit}
            setUnit={setUnit}
            category={category}
            setCategory={setCategory}
            units={units}
            categories={categories}
            hasAttemptedSubmit={hasAttemptedSubmit}
            isNameEmpty={isNameEmpty}
            isDuplicateName={isDuplicateName}
          />

          <InitialPurchaseSection
            qtyPurchased={qtyPurchased}
            setQtyPurchased={setQtyPurchased}
            purchaseUnit={purchaseUnit}
            setPurchaseUnit={setPurchaseUnit}
            totalCost={totalCost}
            setTotalCost={setTotalCost}
            purchaseMultiplier={purchaseMultiplier}
            setPurchaseMultiplier={setPurchaseMultiplier}
            minLevel={minLevel}
            setMinLevel={setMinLevel}
            supplier={supplier}
            setSupplier={setSupplier}
            unit={unit}
            getStandardMultiplier={getStandardMultiplier}
            hasAttemptedSubmit={hasAttemptedSubmit}
            isQtyValid={isQtyValid}
            isCostValid={isCostValid}
            isMinValid={isMinValid}
            isMultiplierValid={isMultiplierValid}
            getBaseUnitCost={getBaseUnitCost}
            parsedCost={parsedCost}
            parsedQty={parsedQty}
          />

          <ConversionUnitsSection
            conversions={conversions}
            handleAddConversion={handleAddConversion}
            handleRemoveConversion={handleRemoveConversion}
            handleConversionChange={handleConversionChange}
            unit={unit}
            getBaseUnitCost={getBaseUnitCost}
            hasAttemptedSubmit={hasAttemptedSubmit}
          />

          <ExpiryAndNoteSection
            trackExpiry={trackExpiry}
            handleExpiryToggle={handleExpiryToggle}
            expiryDate={expiryDate}
            setExpiryDate={setExpiryDate}
            note={note}
            setNote={setNote}
            hasAttemptedSubmit={hasAttemptedSubmit}
            isExpiryValid={isExpiryValid}
            isExpiryEmpty={isExpiryEmpty}
            hasValidFutureDate={hasValidFutureDate}
          />
        </div>

        {hasAttemptedSubmit && !isFormValid && (
          <div style={{ color: '#dc3545', fontSize: '0.85rem', padding: '0 1.5rem', marginBottom: '1rem', textAlign: 'right', fontWeight: '500' }}>
            Please fill in all required fields (*)
          </div>
        )}

        <div className="inventory-modal-footer">
          <button className="inventory-modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="inventory-modal-btn-save"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryItemModal;
