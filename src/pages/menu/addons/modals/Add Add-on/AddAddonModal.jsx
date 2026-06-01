import React, { useState } from 'react';
import './addAddonModal.css';

/* ─── Placeholder Data ─── */
const CATEGORIES = [
  'Hot Coffee', 'Iced Coffee', 'Pastry', 'Non-coffee', 'Rice Meal', 'Frappuccino'
];

const UNITS = ['g', 'ml', 'pc', 'pump', 'cup'];

const INGREDIENTS = [
  { id: 'i1', label: 'Chocolate chips (g) - ₱0.35/g', cost: 0.35, defaultUnit: 'g' },
  { id: 'i2', label: 'Milk (ml) - ₱0.50/ml', cost: 0.50, defaultUnit: 'ml' },
  { id: 'i3', label: 'Frappe base (ml) - ₱0.12/ml', cost: 0.12, defaultUnit: 'ml' },
  { id: 'i4', label: 'Chocolate sauce (pump) - ₱1.00/pump', cost: 1.00, defaultUnit: 'pump' },
  { id: 'i5', label: 'Ice (g) - ₱0.01/g', cost: 0.01, defaultUnit: 'g' },
  { id: 'i6', label: '22oz cup (pcs) - ₱3.50/pc', cost: 3.50, defaultUnit: 'pc' },
  { id: 'i7', label: 'Straw (pcs) - ₱0.20/pc', cost: 0.20, defaultUnit: 'pc' },
  { id: 'i8', label: '16oz cup (pcs) - ₱2.50/pc', cost: 2.50, defaultUnit: 'pc' }
];

const AddAddonModal = ({ isOpen, onClose }) => {
  /* ─── State ─── */
  const [addonName, setAddonName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ingredients, setIngredients] = useState([
    { id: Date.now(), ingredientId: '', qty: '', unit: '' }
  ]);

  if (!isOpen) return null;

  /* ─── Math Helpers ─── */
  const calculateEstCost = () => {
    return ingredients.reduce((total, ing) => {
      if (!ing.ingredientId || !ing.qty) return total;
      const ref = INGREDIENTS.find(i => i.id === ing.ingredientId);
      if (!ref) return total;
      
      const parsedQty = parseFloat(ing.qty) || 0;
      return total + (parsedQty * ref.cost);
    }, 0);
  };

  const estCost = calculateEstCost();
  
  const calculateProfit = () => {
    const sp = parseFloat(sellingPrice) || 0;
    return sp - estCost;
  };

  const profit = calculateProfit();

  const calculateMargin = () => {
    const sp = parseFloat(sellingPrice) || 0;
    if (sp === 0) return 0;
    return (profit / sp) * 100;
  };

  const margin = calculateMargin();

  /* ─── Validation ─── */
  const areIngredientsValid = () => {
    if (ingredients.length === 0) return true;
    return ingredients.every(ing => ing.ingredientId !== '' && ing.qty !== '');
  };

  const isFormValid = () => {
    const sp = parseFloat(sellingPrice);
    const spValid = !isNaN(sp) && sp > 0;
    return addonName.trim() !== '' && spValid && selectedCategories.length > 0 && areIngredientsValid();
  };

  /* ─── Handlers ─── */
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now(), ingredientId: '', qty: '', unit: '' }
    ]);
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const updateIngredient = (id, field, value) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id !== id) return ing;
      const updated = { ...ing, [field]: value };
      if (field === 'ingredientId') {
        const ref = INGREDIENTS.find(i => i.id === value);
        if (ref) updated.unit = ref.defaultUnit;
      }
      return updated;
    }));
  };

  /* ─── Renderers ─── */
  const renderIngredientRow = (ing) => {
    let rowCost = 0;
    if (ing.ingredientId && ing.qty) {
      const ref = INGREDIENTS.find(i => i.id === ing.ingredientId);
      if (ref) {
        rowCost = (parseFloat(ing.qty) || 0) * ref.cost;
      }
    }

    return (
      <div className="aao-ingredient-row" key={ing.id}>
        <div>
          <select 
            className="aao-select" 
            value={ing.ingredientId} 
            onChange={(e) => updateIngredient(ing.id, 'ingredientId', e.target.value)}
          >
            <option value="">Select ingredient</option>
            {INGREDIENTS.map(i => (
              <option key={i.id} value={i.id}>{i.label}</option>
            ))}
          </select>
        </div>
        <div>
          <input 
            type="number" 
            className="aao-input" 
            placeholder="Qty"
            value={ing.qty}
            onChange={(e) => updateIngredient(ing.id, 'qty', e.target.value)}
            min="0" step="any"
          />
        </div>
        <div>
          <select 
            className="aao-select"
            value={ing.unit}
            onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
          >
            <option value="">-</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="aao-currency-wrapper">
          <span className="aao-currency-symbol">₱</span>
          <input 
            type="text" 
            className="aao-input" 
            readOnly 
            value={rowCost > 0 ? rowCost.toFixed(2) : '0.00'} 
          />
        </div>
        <button 
          className="aao-btn-remove-ing" 
          onClick={() => removeIngredient(ing.id)}
          title="Remove ingredient"
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
    );
  };

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
          
          <div className="aao-top-grid">
            
            {/* Left Column */}
            <div>
              <div className="aao-section">
                <label className="aao-label">Add-on Name</label>
                <input 
                  type="text" 
                  className="aao-input" 
                  placeholder="e.g. Extra Shot"
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                />
              </div>

              <div className="aao-section">
                <label className="aao-label">Apply to Categories</label>
                <div className="aao-categories-list">
                  {CATEGORIES.map(cat => (
                    <label className="aao-checkbox-label" key={cat}>
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="aao-section">
                <label className="aao-label">Selling Price</label>
                <div className="aao-currency-wrapper">
                  <span className="aao-currency-symbol">₱</span>
                  <input 
                    type="number" 
                    className="aao-input" 
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    min="0" step="any"
                  />
                </div>
              </div>

              <div className="aao-section">
                <label className="aao-label">Est. Cost</label>
                <div className="aao-currency-wrapper">
                  <span className="aao-currency-symbol">₱</span>
                  <input type="text" className="aao-input" readOnly value={estCost.toFixed(2)} />
                </div>
              </div>

              <div className="aao-section">
                <label className="aao-label">Profit</label>
                <div className="aao-currency-wrapper">
                  <span className="aao-currency-symbol">₱</span>
                  <input type="text" className="aao-input" readOnly value={profit.toFixed(2)} />
                </div>
              </div>

              <div className="aao-section">
                <label className="aao-label">Margin</label>
                <input type="text" className="aao-input" readOnly value={`${margin.toFixed(2)}%`} />
              </div>
            </div>

          </div>

          <div className="aao-bottom-section">
            <div className="aao-section">
              <label className="aao-label" style={{fontSize: '1rem'}}>Recipe / Ingredient Deductions</label>
              <p className="aao-subtext">Select ingredients that will be deducted from inventory when sold.</p>
              
              <div className="aao-ingredients-table">
                <div className="aao-ingredient-row" style={{marginBottom: '-0.25rem'}}>
                  <label className="aao-label" style={{fontSize: '0.8rem'}}>Ingredient</label>
                  <label className="aao-label" style={{fontSize: '0.8rem'}}>Qty</label>
                  <label className="aao-label" style={{fontSize: '0.8rem'}}>Unit</label>
                  <label className="aao-label" style={{fontSize: '0.8rem'}}>Est. Cost</label>
                  <div></div>
                </div>
                {ingredients.map(ing => renderIngredientRow(ing))}
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
        <div className="aao-modal-footer">
          <button 
            className="aao-btn-save" 
            disabled={!isFormValid()}
            onClick={() => {
              console.log("Saving Add-on...", { addonName, sellingPrice, selectedCategories, ingredients });
              onClose();
            }}
          >
            Add Add-on
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddAddonModal;
