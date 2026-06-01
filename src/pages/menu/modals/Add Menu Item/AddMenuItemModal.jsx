import React, { useState, useEffect } from 'react';
import './addMenuItemModal.css';

/* ─── Placeholder Data ─── */
const CATEGORIES = [
  'Frappuccino', 'Non-coffee', 'Pastry', 'Hot Coffee', 'Rice Meal', 'Iced Coffee'
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

const AddMenuItemModal = ({ isOpen, onClose }) => {
  /* ─── State ─── */
  const [pricingMode, setPricingMode] = useState('single'); // 'single' or 'variants'

  const [baseInfo, setBaseInfo] = useState({
    name: '',
    category: '',
    description: '',
    isAvailable: false,
    image: null
  });

  const [singleRecipe, setSingleRecipe] = useState({
    sellingPrice: '',
    ingredients: [
      { id: Date.now(), ingredientId: '', qty: '', unit: '' }
    ]
  });

  const [variants, setVariants] = useState([
    {
      id: Date.now(),
      name: '',
      isAvailable: true,
      sellingPrice: '',
      ingredients: [
        { id: Date.now() + 1, ingredientId: '', qty: '', unit: '' }
      ]
    }
  ]);

  /* ─── Reset State on Open ─── */
  useEffect(() => {
    if (isOpen) {
      setPricingMode('single');
      setBaseInfo({ name: '', category: '', description: '', isAvailable: false, image: null });
      setSingleRecipe({
        sellingPrice: '',
        ingredients: [{ id: Date.now(), ingredientId: '', qty: '', unit: '' }]
      });
      setVariants([{
        id: Date.now(), name: '', isAvailable: true, sellingPrice: '',
        ingredients: [{ id: Date.now() + 1, ingredientId: '', qty: '', unit: '' }]
      }]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /* ─── Math Helpers ─── */
  const calculateEstCost = (ingredients) => {
    return ingredients.reduce((total, ing) => {
      if (!ing.ingredientId || !ing.qty) return total;
      const ref = INGREDIENTS.find(i => i.id === ing.ingredientId);
      if (!ref) return total;
      
      // Simple qty * cost logic (ignoring complex unit conversions for placeholder)
      const parsedQty = parseFloat(ing.qty) || 0;
      return total + (parsedQty * ref.cost);
    }, 0);
  };

  const calculateProfit = (sellingPrice, estCost) => {
    const sp = parseFloat(sellingPrice) || 0;
    return sp - estCost;
  };

  const calculateMargin = (profit, sellingPrice) => {
    const sp = parseFloat(sellingPrice) || 0;
    if (sp === 0) return 0;
    return (profit / sp) * 100;
  };

  /* ─── Validation Helpers ─── */
  const isBaseInfoValid = baseInfo.name.trim() !== '' && baseInfo.category !== '';

  const areIngredientsValid = (ingredients) => {
    if (ingredients.length === 0) return true; // allow 0 ingredients
    return ingredients.every(ing => ing.ingredientId !== '' && ing.qty !== '');
  };

  const isFormValid = () => {
    if (!isBaseInfoValid) return false;

    if (pricingMode === 'single') {
      const sp = parseFloat(singleRecipe.sellingPrice);
      if (isNaN(sp) || sp <= 0) return false;
      return areIngredientsValid(singleRecipe.ingredients);
    } else {
      if (variants.length === 0) return false;
      return variants.every(v => {
        const sp = parseFloat(v.sellingPrice);
        const nameValid = v.name.trim() !== '';
        const spValid = !isNaN(sp) && sp > 0;
        const ingValid = areIngredientsValid(v.ingredients);
        return nameValid && spValid && ingValid;
      });
    }
  };

  /* ─── Handlers: Single Recipe ─── */
  const addSingleIngredient = () => {
    setSingleRecipe({
      ...singleRecipe,
      ingredients: [...singleRecipe.ingredients, { id: Date.now(), ingredientId: '', qty: '', unit: '' }]
    });
  };

  const removeSingleIngredient = (id) => {
    setSingleRecipe({
      ...singleRecipe,
      ingredients: singleRecipe.ingredients.filter(ing => ing.id !== id)
    });
  };

  const updateSingleIngredient = (id, field, value) => {
    const newIngredients = singleRecipe.ingredients.map(ing => {
      if (ing.id !== id) return ing;
      const updated = { ...ing, [field]: value };
      if (field === 'ingredientId') {
        const ref = INGREDIENTS.find(i => i.id === value);
        if (ref) updated.unit = ref.defaultUnit;
      }
      return updated;
    });
    setSingleRecipe({ ...singleRecipe, ingredients: newIngredients });
  };

  /* ─── Handlers: Variants ─── */
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: Date.now(),
        name: '',
        isAvailable: true,
        sellingPrice: '',
        ingredients: [{ id: Date.now() + 1, ingredientId: '', qty: '', unit: '' }]
      }
    ]);
  };

  const removeVariant = (vid) => {
    setVariants(variants.filter(v => v.id !== vid));
  };

  const updateVariant = (vid, field, value) => {
    setVariants(variants.map(v => v.id === vid ? { ...v, [field]: value } : v));
  };

  const addVariantIngredient = (vid) => {
    setVariants(variants.map(v => {
      if (v.id !== vid) return v;
      return {
        ...v,
        ingredients: [...v.ingredients, { id: Date.now(), ingredientId: '', qty: '', unit: '' }]
      };
    }));
  };

  const removeVariantIngredient = (vid, iid) => {
    setVariants(variants.map(v => {
      if (v.id !== vid) return v;
      return {
        ...v,
        ingredients: v.ingredients.filter(ing => ing.id !== iid)
      };
    }));
  };

  const updateVariantIngredient = (vid, iid, field, value) => {
    setVariants(variants.map(v => {
      if (v.id !== vid) return v;
      const newIngs = v.ingredients.map(ing => {
        if (ing.id !== iid) return ing;
        const updated = { ...ing, [field]: value };
        if (field === 'ingredientId') {
          const ref = INGREDIENTS.find(i => i.id === value);
          if (ref) updated.unit = ref.defaultUnit;
        }
        return updated;
      });
      return { ...v, ingredients: newIngs };
    }));
  };

  /* ─── Shared Render: Ingredient Row ─── */
  const renderIngredientRow = (ing, onUpdate, onRemove) => {
    let rowCost = 0;
    if (ing.ingredientId && ing.qty) {
      const ref = INGREDIENTS.find(i => i.id === ing.ingredientId);
      if (ref) {
        rowCost = (parseFloat(ing.qty) || 0) * ref.cost;
      }
    }

    return (
      <div className="ami-ingredient-row" key={ing.id}>
        <div className="ami-section">
          <select 
            className="ami-select" 
            value={ing.ingredientId} 
            onChange={(e) => onUpdate('ingredientId', e.target.value)}
          >
            <option value="">Select ingredient</option>
            {INGREDIENTS.map(i => (
              <option key={i.id} value={i.id}>{i.label}</option>
            ))}
          </select>
        </div>
        <div className="ami-section">
          <input 
            type="number" 
            className="ami-input" 
            placeholder="Qty"
            value={ing.qty}
            onChange={(e) => onUpdate('qty', e.target.value)}
            min="0" step="any"
          />
        </div>
        <div className="ami-section">
          <select 
            className="ami-select"
            value={ing.unit}
            onChange={(e) => onUpdate('unit', e.target.value)}
          >
            <option value="">-</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="ami-section ami-currency-wrapper">
          <span className="ami-currency-symbol">₱</span>
          <input 
            type="text" 
            className="ami-input" 
            readOnly 
            value={rowCost > 0 ? rowCost.toFixed(2) : '0.00'} 
          />
        </div>
        <button 
          className="ami-btn-remove-ing" 
          onClick={onRemove}
          title="Remove ingredient"
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="ami-modal-overlay">
      <div className="ami-modal-content">
        
        {/* Header */}
        <div className="ami-modal-header">
          <h3>Add Menu Item</h3>
          <button className="ami-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="ami-modal-body">
          
          {/* Base Info with Image Upload */}
          <div className="ami-flex-row">
            <div className="ami-image-upload-container">
              <label className="ami-label">Item Image</label>
              <div className="ami-image-upload-box">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="ami-image-input" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setBaseInfo({...baseInfo, image: e.target.files[0]});
                    }
                  }} 
                />
                {baseInfo.image ? (
                  <img src={URL.createObjectURL(baseInfo.image)} alt="Preview" className="ami-image-preview" />
                ) : (
                  <div className="ami-image-placeholder">
                    <i className="bi bi-camera"></i>
                    <span>Upload</span>
                  </div>
                )}
              </div>
            </div>

            <div className="ami-flex-fields">
              <div className="ami-section" style={{marginBottom: 0}}>
                <label className="ami-label">Item Name</label>
                <input 
                  type="text" 
                  className="ami-input" 
                  placeholder="Enter menu item name"
                  value={baseInfo.name}
                  onChange={(e) => setBaseInfo({...baseInfo, name: e.target.value})}
                />
              </div>
              <div className="ami-section" style={{marginBottom: 0}}>
                <label className="ami-label">Category</label>
                <select 
                  className="ami-select"
                  value={baseInfo.category}
                  onChange={(e) => setBaseInfo({...baseInfo, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="ami-row">
            <label className="ami-toggle-container">
              <input 
                type="checkbox" 
                style={{display:'none'}}
                checked={baseInfo.isAvailable}
                onChange={(e) => setBaseInfo({...baseInfo, isAvailable: e.target.checked})}
              />
              <span className="ami-toggle-switch">
                <span className="ami-toggle-slider"></span>
              </span>
              <span className="ami-toggle-label">Available for sale</span>
            </label>
          </div>

          <div className="ami-row ami-pricing-mode">
            <label className="ami-label" style={{marginRight: '1rem'}}>Pricing</label>
            <div className="ami-segmented-control">
              <button 
                className={`ami-segment-btn ${pricingMode === 'single' ? 'active' : ''}`}
                onClick={() => setPricingMode('single')}
              >
                Single Price
              </button>
              <button 
                className={`ami-segment-btn ${pricingMode === 'variants' ? 'active' : ''}`}
                onClick={() => setPricingMode('variants')}
              >
                Sizes/Variants
              </button>
            </div>
          </div>

          {/* Single Price Mode */}
          {pricingMode === 'single' && (() => {
            const estCost = calculateEstCost(singleRecipe.ingredients);
            const profit = calculateProfit(singleRecipe.sellingPrice, estCost);
            const margin = calculateMargin(profit, singleRecipe.sellingPrice);

            return (
              <>
                <div className="ami-row">
                  <div className="ami-section">
                    <label className="ami-label">Selling Price</label>
                    <div className="ami-currency-wrapper">
                      <span className="ami-currency-symbol">₱</span>
                      <input 
                        type="number" 
                        className="ami-input" 
                        placeholder="0.00"
                        value={singleRecipe.sellingPrice}
                        onChange={(e) => setSingleRecipe({...singleRecipe, sellingPrice: e.target.value})}
                        min="0" step="any"
                      />
                    </div>
                  </div>
                  <div className="ami-section">
                    <label className="ami-label">Est. Cost</label>
                    <div className="ami-currency-wrapper">
                      <span className="ami-currency-symbol">₱</span>
                      <input type="text" className="ami-input" readOnly value={estCost.toFixed(2)} />
                    </div>
                  </div>
                  <div className="ami-section">
                    <label className="ami-label">Profit</label>
                    <div className="ami-currency-wrapper">
                      <span className="ami-currency-symbol">₱</span>
                      <input type="text" className="ami-input" readOnly value={profit.toFixed(2)} />
                    </div>
                  </div>
                  <div className="ami-section">
                    <label className="ami-label">Margin</label>
                    <input type="text" className="ami-input" readOnly value={`${margin.toFixed(2)}%`} />
                  </div>
                </div>

                <hr className="ami-divider" />

                <div className="ami-section">
                  <label className="ami-label">Recipe / Ingredient Deductions</label>
                  <p className="ami-subtext">Select ingredients that will be deducted from inventory when sold.</p>
                  
                  <div className="ami-ingredients-table">
                    <div className="ami-ingredient-row" style={{marginBottom: '-0.25rem'}}>
                      <label className="ami-label">Ingredient</label>
                      <label className="ami-label">Qty</label>
                      <label className="ami-label">Unit</label>
                      <label className="ami-label">Est. Cost</label>
                      <div></div>
                    </div>
                    {singleRecipe.ingredients.map(ing => renderIngredientRow(
                      ing,
                      (f, v) => updateSingleIngredient(ing.id, f, v),
                      () => removeSingleIngredient(ing.id)
                    ))}
                  </div>

                  <button className="ami-btn-add-ing" onClick={addSingleIngredient}>
                    <i className="bi bi-plus"></i> Add Ingredient
                  </button>
                </div>
              </>
            );
          })()}

          {/* Variants Mode */}
          {pricingMode === 'variants' && (
            <div className="ami-variants-list">
              {variants.map((v, index) => {
                const estCost = calculateEstCost(v.ingredients);
                const profit = calculateProfit(v.sellingPrice, estCost);
                const margin = calculateMargin(profit, v.sellingPrice);

                return (
                  <div className="ami-variant-card" key={v.id}>
                    <div className="ami-variant-header">
                      <div className="ami-section">
                        <label className="ami-label">Size/ Variant Name</label>
                        <input 
                          type="text" 
                          className="ami-input" 
                          placeholder="e.g. 16oz"
                          value={v.name}
                          onChange={(e) => updateVariant(v.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="ami-section" style={{alignSelf: 'center', marginTop: '1.25rem'}}>
                        <label className="ami-toggle-container">
                          <input 
                            type="checkbox" 
                            style={{display:'none'}}
                            checked={v.isAvailable}
                            onChange={(e) => updateVariant(v.id, 'isAvailable', e.target.checked)}
                          />
                          <span className="ami-toggle-switch">
                            <span className="ami-toggle-slider"></span>
                          </span>
                          <span className="ami-toggle-label" style={{fontSize: '0.75rem'}}>Available for sale</span>
                        </label>
                      </div>
                      <button 
                        className="ami-btn-remove-variant" 
                        onClick={() => removeVariant(v.id)}
                        disabled={variants.length === 1}
                        title={variants.length === 1 ? "At least one variant required" : "Remove variant"}
                        style={{opacity: variants.length === 1 ? 0.5 : 1}}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>

                    <div className="ami-row">
                      <div className="ami-section">
                        <label className="ami-label">Selling Price</label>
                        <div className="ami-currency-wrapper">
                          <span className="ami-currency-symbol">₱</span>
                          <input 
                            type="number" 
                            className="ami-input" 
                            placeholder="0.00"
                            value={v.sellingPrice}
                            onChange={(e) => updateVariant(v.id, 'sellingPrice', e.target.value)}
                            min="0" step="any"
                          />
                        </div>
                      </div>
                      <div className="ami-section">
                        <label className="ami-label">Est. Cost</label>
                        <div className="ami-currency-wrapper">
                          <span className="ami-currency-symbol">₱</span>
                          <input type="text" className="ami-input" readOnly value={estCost.toFixed(2)} />
                        </div>
                      </div>
                      <div className="ami-section">
                        <label className="ami-label">Profit</label>
                        <div className="ami-currency-wrapper">
                          <span className="ami-currency-symbol">₱</span>
                          <input type="text" className="ami-input" readOnly value={profit.toFixed(2)} />
                        </div>
                      </div>
                      <div className="ami-section">
                        <label className="ami-label">Margin</label>
                        <input type="text" className="ami-input" readOnly value={`${margin.toFixed(2)}%`} />
                      </div>
                    </div>

                    <div className="ami-section">
                      <label className="ami-label">Recipe / Ingredient Deductions</label>
                      <p className="ami-subtext">Select ingredients that will be deducted from inventory when sold.</p>
                      
                      <div className="ami-ingredients-table">
                        <div className="ami-ingredient-row" style={{marginBottom: '-0.25rem'}}>
                          <label className="ami-label">Ingredient</label>
                          <label className="ami-label">Qty</label>
                          <label className="ami-label">Unit</label>
                          <label className="ami-label">Est. Cost</label>
                          <div></div>
                        </div>
                        {v.ingredients.map(ing => renderIngredientRow(
                          ing,
                          (f, val) => updateVariantIngredient(v.id, ing.id, f, val),
                          () => removeVariantIngredient(v.id, ing.id)
                        ))}
                      </div>

                      <button className="ami-btn-add-ing" onClick={() => addVariantIngredient(v.id)}>
                        <i className="bi bi-plus"></i> Add Ingredient
                      </button>
                    </div>
                  </div>
                );
              })}
              
              <button className="ami-btn-add-variant" onClick={addVariant}>
                Add Variant/Size
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="ami-modal-footer">
          <button className="ami-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="ami-btn-save" 
            disabled={!isFormValid()}
            onClick={() => {
              console.log("Saving Item...", { baseInfo, pricingMode, singleRecipe, variants });
              onClose();
            }}
          >
            Add Menu Item
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddMenuItemModal;
