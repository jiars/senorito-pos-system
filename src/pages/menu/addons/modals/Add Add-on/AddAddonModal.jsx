import React, { useState } from 'react';
import './addAddonModal.css';

import { addAddon } from '../../../../../services/menu/addonsService';
import { fetchInventoryItems } from '../../../../../services/inventory/inventoryItemsService';
import { calculateEstCost, calculateProfit, calculateMargin } from '../../../../../utils/menu/pricingCalculations';

import AddAddonBaseInfo from './components/AddAddonBaseInfo';
import AddAddonIngredientRow from './components/AddAddonIngredientRow';

const AddAddonModal = ({ isOpen, onClose, refetchAddons, categories = [] }) => {
  const [addonName, setAddonName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [ingredients, setIngredients] = useState([
    { id: Date.now(), ingredientId: '', qty: '', unit: '' }
  ]);
  const [isAvailable, setIsAvailable] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbIngredients, setDbIngredients] = useState([]);
  
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    const loadInventory = async () => {
      try {
        const items = await fetchInventoryItems();
        setDbIngredients(items || []);
      } catch (error) {
        console.error("Failed to load inventory items:", error);
      }
    };
    if (isOpen) {
      setHasAttemptedSubmit(false);
      setErrors({});
      setErrorMessage('');
      setAddonName('');
      setSellingPrice('');
      setSelectedCategories([]);
      setIngredients([{ id: Date.now(), ingredientId: '', qty: '', unit: '' }]);
      setIsAvailable(true);
      loadInventory();
    }
  }, [isOpen]);

  /* ─── Math Helpers (from utils) ─── */
  const estCost = calculateEstCost(ingredients, dbIngredients);
  const profit = calculateProfit(sellingPrice, estCost);
  const margin = calculateMargin(profit, sellingPrice);

  /* ─── Validation ─── */
  React.useEffect(() => {
    if (!isOpen) return;
    const newErrors = {};

    if (!addonName.trim()) newErrors.addonName = 'Add-on name is required.';
    if (!sellingPrice) {
      newErrors.sellingPrice = 'Price required.';
    } else if (Number(sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Must be > 0.';
    }
    if (selectedCategories.length === 0) newErrors.categories = 'Select at least one category.';

    ingredients.forEach(ing => {
      if (!ing.ingredientId) newErrors[`ing_${ing.id}_id`] = 'Required.';
      if (!ing.qty) newErrors[`ing_${ing.id}_qty`] = 'Required.';
      if (!ing.unit) newErrors[`ing_${ing.id}_unit`] = 'Required.';
    });

    setErrors(newErrors);
  }, [addonName, sellingPrice, selectedCategories, ingredients, isOpen]);

  const isFormValid = Object.keys(errors).length === 0;

  /* ─── Handlers ─── */
  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSaveAddon = async () => {
    setHasAttemptedSubmit(true);
    if (isSubmitting || !isFormValid) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        base_info: {
          addon_name: addonName.trim(),
          selling_price: parseFloat(sellingPrice) || 0,
          estimated_cost: estCost,
          profit: profit,
          margin: margin,
          pos_status: isAvailable ? 'Available' : 'Unavailable',
          archived: false
        },
        categories: selectedCategories,
        recipes: ingredients
          .filter(ing => ing.ingredientId && ing.qty)
          .map(ing => {
            const ref = dbIngredients.find(i => i.id === ing.ingredientId);
            
            let equivalent = 1;
            if (ing.unit && ing.unit !== ref?.base_unit) {
              const conv = ref?.inventory_conversion_units?.find(cu => cu.converted_unit === ing.unit);
              if (conv) equivalent = Number(conv.equivalent_base_amount);
            }
            const baseQty = parseFloat(ing.qty) * equivalent;

            return {
              inventory_item_id: ing.ingredientId,
              quantity: parseFloat(ing.qty),
              unit: ing.unit || ref?.base_unit,
              estimated_cost: baseQty * (ref ? ref.cost_per_unit : 0)
            };
          })
      };

      await addAddon(payload);

      if (refetchAddons) {
        await refetchAddons();
      }

      // Reset form on success
      setAddonName('');
      setSellingPrice('');
      setSelectedCategories([]);
      setIngredients([{ id: Date.now(), ingredientId: '', qty: '', unit: '' }]);
      setIsAvailable(true);
      onClose();
    } catch (error) {
      console.error('Failed to add addon:', error);
      setErrorMessage(error.message || 'An error occurred while adding the addon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now(), ingredientId: '', qty: '', unit: '' }
    ]);
  };

  const removeIngredient = (id) => {
    if (ingredients.length <= 1) {
      setErrorMessage('At least one ingredient is required.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setErrorMessage('');
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredient = (id, field, value) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id !== id) return ing;
      const updated = { ...ing, [field]: value };
      if (field === 'ingredientId') {
        const ref = dbIngredients.find(i => i.id === value);
        if (ref) updated.unit = ref.base_unit;
      }
      return updated;
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="aao-modal-overlay">
      <div className="aao-modal-content">

        {/* Header */}
        <div className="aao-modal-header">
          <h3>Add Add-on</h3>
          <button className="aao-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="aao-modal-body">

          <AddAddonBaseInfo 
            addonName={addonName}
            setAddonName={setAddonName}
            isAvailable={isAvailable}
            setIsAvailable={setIsAvailable}
            categories={categories}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            sellingPrice={sellingPrice}
            setSellingPrice={setSellingPrice}
            estCost={estCost}
            profit={profit}
            margin={margin}
            errors={errors}
            hasAttemptedSubmit={hasAttemptedSubmit}
          />

          <div className="aao-bottom-section">
            <div className="aao-section">
              <label className="aao-label" style={{ fontSize: '1rem' }}>Recipe / Ingredient Deductions</label>
              <p className="aao-subtext">Select ingredients that will be deducted from inventory when sold.</p>

              <div className="aao-ingredients-table">
                <div className="aao-ingredient-row" style={{ marginBottom: '-0.25rem' }}>
                  <label className="aao-label" style={{ fontSize: '0.8rem' }}>Ingredient *</label>
                  <label className="aao-label" style={{ fontSize: '0.8rem' }}>Qty *</label>
                  <label className="aao-label" style={{ fontSize: '0.8rem' }}>Unit *</label>
                  <label className="aao-label" style={{ fontSize: '0.8rem' }}>Est. Cost</label>
                  <div></div>
                </div>
                {ingredients.map(ing => (
                  <AddAddonIngredientRow 
                    key={ing.id}
                    ing={ing}
                    dbIngredients={dbIngredients}
                    updateIngredient={updateIngredient}
                    removeIngredient={removeIngredient}
                    errors={errors}
                    hasAttemptedSubmit={hasAttemptedSubmit}
                  />
                ))}
              </div>

              <button
                className="menu-btn"
                style={{
                  marginTop: '1rem',
                  alignSelf: 'flex-start',
                  backgroundColor: '#ffffff',
                  border: '1px solid #D9C0AE',
                  color: '#5C3827',
                  fontWeight: '600'
                }}
                onClick={addIngredient}
              >
                <i className="bi bi-plus"></i> Add Ingredient
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        {errorMessage && (
          <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#F8D7DA', color: '#721C24', fontSize: '0.875rem' }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '0.5rem' }}></i>
            {errorMessage}
          </div>
        )}

        {hasAttemptedSubmit && !isFormValid && (
          <div style={{ color: '#dc3545', fontSize: '0.85rem', padding: '0 1.5rem', marginBottom: '1rem', textAlign: 'right', fontWeight: '500' }}>
            Please fill in all required fields (*)
          </div>
        )}

        <div className="aao-modal-footer">
          <button className="aao-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="aao-btn-save"
            disabled={isSubmitting}
            onClick={handleSaveAddon}
          >
            {isSubmitting ? 'Adding...' : 'Add Add-on'}
          </button>
        </div>


      </div>
    </div>
  );
};

export default AddAddonModal;
