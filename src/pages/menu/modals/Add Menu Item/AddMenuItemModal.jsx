import React, { useState, useEffect } from 'react';
import './addMenuItemModal.css';
import { fetchMenuCategories } from '../../../../services/menu/menuCategoriesService';
import { addMenuItem } from '../../../../services/menu/menuItemsService';
import { addMenuItemPrices } from '../../../../services/menu/menuPricesService';
import { addMenuRecipes } from '../../../../services/menu/menuRecipesService';
import { useInventory } from '../../../../hooks/useInventory';
import { uploadMenuImage } from '../../../../utils/imageUploadHelper';

const AddMenuItemModal = ({ isOpen, onClose, refetchMenu }) => {
  const { inventoryItems } = useInventory();
  /* ─── State ─── */
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState({});

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

  /* ─── Load Categories & Reset State on Open ─── */
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setIsSubmitting(false);
      setHasAttemptedSubmit(false);
      setErrors({});
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

      const loadCategories = async () => {
        const cats = await fetchMenuCategories();
        setCategories(cats);
      };
      loadCategories();
    }
  }, [isOpen]);

  /* ─── Math Helpers ─── */
  const calculateEstCost = (ingredients) => {
    return ingredients.reduce((total, ing) => {
      if (!ing.ingredientId || !ing.qty) return total;
      const ref = inventoryItems.find(i => i.id === ing.ingredientId);
      if (!ref) return total;

      let equivalent = 1;
      if (ing.unit && ing.unit !== ref.base_unit) {
        const conv = ref.inventory_conversion_units?.find(cu => cu.converted_unit === ing.unit);
        if (conv) equivalent = Number(conv.equivalent_base_amount);
      }

      const parsedQty = parseFloat(ing.qty) || 0;
      const baseQty = parsedQty * equivalent;
      return total + (baseQty * ref.cost_per_unit);
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
  useEffect(() => {
    if (!isOpen) return;
    const newErrors = {};

    if (!baseInfo.image) newErrors.image = 'Image is required.';
    if (!baseInfo.name.trim()) newErrors.name = 'Item name is required.';
    if (!baseInfo.category) newErrors.category = 'Category is required.';

    if (pricingMode === 'single') {
      if (!singleRecipe.sellingPrice) {
        newErrors.sellingPrice = 'Selling price is required.';
      } else if (Number(singleRecipe.sellingPrice) <= 0) {
        newErrors.sellingPrice = 'Price must be > 0.';
      }
      
      singleRecipe.ingredients.forEach(ing => {
        if (!ing.ingredientId) newErrors[`single_ing_${ing.id}_id`] = 'Required.';
        if (!ing.qty) newErrors[`single_ing_${ing.id}_qty`] = 'Required.';
        if (!ing.unit) newErrors[`single_ing_${ing.id}_unit`] = 'Required.';
      });
    } else {
      variants.forEach(v => {
        if (!v.name.trim()) newErrors[`variant_${v.id}_name`] = 'Variant name required.';
        if (!v.sellingPrice) {
          newErrors[`variant_${v.id}_price`] = 'Price required.';
        } else if (Number(v.sellingPrice) <= 0) {
          newErrors[`variant_${v.id}_price`] = 'Must be > 0.';
        }
        
        v.ingredients.forEach(ing => {
          if (!ing.ingredientId) newErrors[`var_${v.id}_ing_${ing.id}_id`] = 'Required.';
          if (!ing.qty) newErrors[`var_${v.id}_ing_${ing.id}_qty`] = 'Required.';
          if (!ing.unit) newErrors[`var_${v.id}_ing_${ing.id}_unit`] = 'Required.';
        });
      });
    }

    setErrors(newErrors);
  }, [baseInfo, pricingMode, singleRecipe, variants, isOpen]);

  const isFormValid = Object.keys(errors).length === 0;

  if (!isOpen) return null;

  /* ─── Handlers: Single Recipe ─── */
  const addSingleIngredient = () => {
    setSingleRecipe({
      ...singleRecipe,
      ingredients: [...singleRecipe.ingredients, { id: Date.now(), ingredientId: '', qty: '', unit: '' }]
    });
  };

  const removeSingleIngredient = (id) => {
    if (singleRecipe.ingredients.length <= 1) {
      setErrorMessage('At least one ingredient is required.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setErrorMessage('');
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
        const ref = inventoryItems.find(i => i.id === value);
        if (ref) updated.unit = ref.base_unit;
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
    if (variants.length <= 1) {
      setErrorMessage('At least one variant/size is required.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setErrorMessage('');
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
    const variant = variants.find(v => v.id === vid);
    if (variant && variant.ingredients.length <= 1) {
      setErrorMessage('At least one ingredient is required per variant.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setErrorMessage('');
    
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
          const ref = inventoryItems.find(i => i.id === value);
          if (ref) updated.unit = ref.base_unit;
        }
        return updated;
      });
      return { ...v, ingredients: newIngs };
    }));
  };

  /* ─── Shared Render: Ingredient Row ─── */
  const renderIngredientRow = (ing, onUpdate, onRemove, idPrefix) => {
    let rowCost = 0;
    let availableUnits = [];
    let selectedUnitData = null;

    if (ing.ingredientId) {
      const ref = inventoryItems.find(i => i.id === ing.ingredientId);
      if (ref) {
        // Collect available units
        availableUnits.push({ unit: ref.base_unit, equivalent: 1, label: `${ref.base_unit} (Base)` });
        if (ref.inventory_conversion_units) {
          ref.inventory_conversion_units.forEach(cu => {
            availableUnits.push({ unit: cu.converted_unit, equivalent: Number(cu.equivalent_base_amount), label: cu.converted_unit });
          });
        }
        
        // Find selected unit for calculation
        selectedUnitData = availableUnits.find(u => u.unit === ing.unit) || availableUnits[0];

        if (ing.qty) {
          const baseQty = (parseFloat(ing.qty) || 0) * (selectedUnitData ? selectedUnitData.equivalent : 1);
          rowCost = baseQty * ref.cost_per_unit;
        }
      }
    }

    return (
      <div className="ami-ingredient-row" key={ing.id}>
        <div className="ami-section">
          <select
            className={`ami-select ${hasAttemptedSubmit && errors[idPrefix + '_id'] ? 'is-invalid' : ''}`}
            value={ing.ingredientId}
            onChange={(e) => onUpdate('ingredientId', e.target.value)}
          >
            <option value="">Select ingredient</option>
            {inventoryItems.map(i => (
              <option key={i.id} value={i.id}>
                {i.item_name} - ₱{i.cost_per_unit}/{i.base_unit}
              </option>
            ))}
          </select>
          {hasAttemptedSubmit && errors[idPrefix + '_id'] && <p className="ami-error-text" style={{ fontSize: '0.65rem' }}>{errors[idPrefix + '_id']}</p>}
        </div>
        <div className="ami-section">
          <input
            type="number"
            className={`ami-input ${hasAttemptedSubmit && errors[idPrefix + '_qty'] ? 'is-invalid' : ''}`}
            placeholder="Qty"
            value={ing.qty}
            onChange={(e) => onUpdate('qty', e.target.value)}
            min="0" step="any"
          />
          {hasAttemptedSubmit && errors[idPrefix + '_qty'] && <p className="ami-error-text" style={{ fontSize: '0.65rem' }}>{errors[idPrefix + '_qty']}</p>}
        </div>
        <div className="ami-section">
          {availableUnits.length > 0 ? (
            <select
              className={`ami-select ${hasAttemptedSubmit && errors[idPrefix + '_unit'] ? 'is-invalid' : ''}`}
              value={ing.unit}
              onChange={(e) => onUpdate('unit', e.target.value)}
            >
              {availableUnits.map(u => (
                <option key={u.unit} value={u.unit}>{u.label}</option>
              ))}
            </select>
          ) : (
            <div className="ami-input" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center' }}>
              -
            </div>
          )}
          {hasAttemptedSubmit && errors[idPrefix + '_unit'] && <p className="ami-error-text" style={{ fontSize: '0.65rem' }}>{errors[idPrefix + '_unit']}</p>}
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

  const handleSaveItem = async () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Upload image if exists
      let uploadedImageUrl = null;
      if (baseInfo.image) {
        const selectedCat = categories.find(c => c.id === baseInfo.category);
        const categoryName = selectedCat ? selectedCat.category_name : 'Uncategorized';
        uploadedImageUrl = await uploadMenuImage(baseInfo.image, baseInfo.name, categoryName);
      }

      // 2. Save base item into menu_items table
      const createdItem = await addMenuItem({
        item_name: baseInfo.name.trim(),
        category_id: baseInfo.category,
        recipe_status: 'Complete',
        pos_status: baseInfo.isAvailable ? 'Available' : 'Unavailable',
        pricing_type: pricingMode === 'single' ? 'Fixed' : 'Variants',
        image_url: uploadedImageUrl
      });

      // 3. Save variant prices into menu_item_prices table
      let pricesArray = [];
      if (pricingMode === 'single') {
        const estCost = calculateEstCost(singleRecipe.ingredients);
        const profit = calculateProfit(singleRecipe.sellingPrice, estCost);
        const margin = calculateMargin(profit, singleRecipe.sellingPrice);

        pricesArray.push({
          menu_item_id: createdItem.id,
          variant_name: 'Regular',
          selling_price: parseFloat(singleRecipe.sellingPrice) || 0,
          estimated_cost: estCost,
          profit: profit,
          margin: margin,
          item_code: `${createdItem.item_code}-R`,
          pos_status: 'Available'
        });
      } else {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          const vEstCost = calculateEstCost(v.ingredients);
          const vProfit = calculateProfit(v.sellingPrice, vEstCost);
          const vMargin = calculateMargin(vProfit, v.sellingPrice);

          pricesArray.push({
            menu_item_id: createdItem.id,
            variant_name: v.name.trim(),
            selling_price: parseFloat(v.sellingPrice) || 0,
            estimated_cost: vEstCost,
            profit: vProfit,
            margin: vMargin,
            item_code: `${createdItem.item_code}-${v.name.trim().substring(0, 3).toUpperCase()}`,
            pos_status: v.isAvailable ? 'Available' : 'Unavailable'
          });
        }
      }

      const savedPrices = await addMenuItemPrices(pricesArray);

      // 4. Save Recipes linked to each specific Variant!
      let recipesArray = [];

      if (pricingMode === 'single') {
        const variantId = savedPrices[0].id;
        singleRecipe.ingredients.forEach(ing => {
          if (ing.ingredientId && ing.qty) {
            const ref = inventoryItems.find(i => i.id === ing.ingredientId);
            let equivalent = 1;
            if (ing.unit && ing.unit !== ref?.base_unit) {
              const conv = ref?.inventory_conversion_units?.find(cu => cu.converted_unit === ing.unit);
              if (conv) equivalent = Number(conv.equivalent_base_amount);
            }
            const baseQty = parseFloat(ing.qty) * equivalent;
            
            recipesArray.push({
              menu_item_id: createdItem.id,
              menu_item_price_id: variantId,
              inventory_item_id: ing.ingredientId,
              quantity: parseFloat(ing.qty),
              unit: ing.unit || ref?.base_unit,
              estimated_cost: baseQty * (ref ? ref.cost_per_unit : 0)
            });
          }
        });
      } else {
        variants.forEach(v => {
          const matchedPrice = savedPrices.find(p => p.variant_name === v.name.trim());
          if (matchedPrice) {
            v.ingredients.forEach(ing => {
              if (ing.ingredientId && ing.qty) {
                const ref = inventoryItems.find(i => i.id === ing.ingredientId);
                let equivalent = 1;
                if (ing.unit && ing.unit !== ref?.base_unit) {
                  const conv = ref?.inventory_conversion_units?.find(cu => cu.converted_unit === ing.unit);
                  if (conv) equivalent = Number(conv.equivalent_base_amount);
                }
                const baseQty = parseFloat(ing.qty) * equivalent;

                recipesArray.push({
                  menu_item_id: createdItem.id,
                  menu_item_price_id: matchedPrice.id,
                  inventory_item_id: ing.ingredientId,
                  quantity: parseFloat(ing.qty),
                  unit: ing.unit || ref?.base_unit,
                  estimated_cost: baseQty * (ref ? ref.cost_per_unit : 0)
                });
              }
            });
          }
        });
      }

      if (recipesArray.length > 0) {
        await addMenuRecipes(recipesArray);
      }

      // 5. Refresh menu list and close modal
      if (refetchMenu) {
        await refetchMenu();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save menu item:', error);
      setErrorMessage(error.message || 'Error saving item to database.');
    } finally {
      setIsSubmitting(false);
    }
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
              <label className="ami-label">Item Image *</label>
              <div className={`ami-image-upload-box ${hasAttemptedSubmit && errors.image ? 'is-invalid-border' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  className="ami-image-input"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setBaseInfo({ ...baseInfo, image: e.target.files[0] });
                    }
                  }}
                />
                {baseInfo.image && (
                  <img src={URL.createObjectURL(baseInfo.image)} alt="Preview" className="ami-image-preview" />
                )}
                <div className={`ami-image-placeholder ${baseInfo.image ? 'has-image' : ''}`}>
                  <i className="bi bi-camera"></i>
                  <span>{baseInfo.image ? 'Change Image' : 'Upload'}</span>
                </div>
              </div>
              {hasAttemptedSubmit && errors.image && <p className="ami-error-text" style={{ marginTop: '0.25rem' }}>{errors.image}</p>}
            </div>

            <div className="ami-flex-fields">
              <div className="ami-section" style={{ marginBottom: 0 }}>
                <label className="ami-label">Item Name *</label>
                <input
                  type="text"
                  className={`ami-input ${hasAttemptedSubmit && errors.name ? 'is-invalid' : ''}`}
                  placeholder="Enter menu item name"
                  value={baseInfo.name}
                  onChange={(e) => setBaseInfo({ ...baseInfo, name: e.target.value })}
                />
                {hasAttemptedSubmit && errors.name && <p className="ami-error-text">{errors.name}</p>}
              </div>
              <div className="ami-section" style={{ marginBottom: 0 }}>
                <label className="ami-label">Category *</label>
                <select
                  className={`ami-select ${hasAttemptedSubmit && errors.category ? 'is-invalid' : ''}`}
                  value={baseInfo.category}
                  onChange={(e) => setBaseInfo({ ...baseInfo, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
                {hasAttemptedSubmit && errors.category && <p className="ami-error-text">{errors.category}</p>}
              </div>
              <div className="ami-section" style={{ marginBottom: 0, marginTop: '0.5rem' }}>
                <label className="ami-toggle-container">
                  <input
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={baseInfo.isAvailable}
                    onChange={(e) => setBaseInfo({ ...baseInfo, isAvailable: e.target.checked })}
                  />
                  <span className="ami-toggle-switch">
                    <span className="ami-toggle-slider"></span>
                  </span>
                  <span className="ami-toggle-label">Available for sale</span>
                </label>
              </div>
            </div>
          </div>

          <div className="ami-row ami-pricing-mode">
            <label className="ami-label" style={{ marginRight: '1rem' }}>Pricing</label>
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
                    <label className="ami-label">Selling Price *</label>
                    <div className={`ami-currency-wrapper ${hasAttemptedSubmit && errors.sellingPrice ? 'is-invalid-border' : ''}`}>
                      <span className="ami-currency-symbol">₱</span>
                      <input
                        type="number"
                        className="ami-input"
                        placeholder="0.00"
                        value={singleRecipe.sellingPrice}
                        onChange={(e) => setSingleRecipe({ ...singleRecipe, sellingPrice: e.target.value })}
                        min="0" step="any"
                      />
                    </div>
                    {hasAttemptedSubmit && errors.sellingPrice && <p className="ami-error-text">{errors.sellingPrice}</p>}
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
                    <div className="ami-ingredient-row" style={{ marginBottom: '-0.25rem' }}>
                      <label className="ami-label">Ingredient *</label>
                      <label className="ami-label">Qty *</label>
                      <label className="ami-label">Unit *</label>
                      <label className="ami-label">Est. Cost</label>
                      <div></div>
                    </div>
                    {singleRecipe.ingredients.map(ing => renderIngredientRow(
                      ing,
                      (f, v) => updateSingleIngredient(ing.id, f, v),
                      () => removeSingleIngredient(ing.id),
                      `single_ing_${ing.id}`
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
                        <label className="ami-label">Size/ Variant Name *</label>
                        <input
                          type="text"
                          className={`ami-input ${hasAttemptedSubmit && errors[`variant_${v.id}_name`] ? 'is-invalid' : ''}`}
                          placeholder="e.g. 16oz"
                          value={v.name}
                          onChange={(e) => updateVariant(v.id, 'name', e.target.value)}
                        />
                        {hasAttemptedSubmit && errors[`variant_${v.id}_name`] && <p className="ami-error-text">{errors[`variant_${v.id}_name`]}</p>}
                      </div>
                      <div className="ami-section" style={{ alignSelf: 'center', marginTop: '1.25rem' }}>
                        <label className="ami-toggle-container">
                          <input
                            type="checkbox"
                            style={{ display: 'none' }}
                            checked={v.isAvailable}
                            onChange={(e) => updateVariant(v.id, 'isAvailable', e.target.checked)}
                          />
                          <span className="ami-toggle-switch">
                            <span className="ami-toggle-slider"></span>
                          </span>
                          <span className="ami-toggle-label" style={{ fontSize: '0.75rem' }}>Available for sale</span>
                        </label>
                      </div>
                      <button
                        className="ami-btn-remove-variant"
                        onClick={() => removeVariant(v.id)}
                        disabled={variants.length === 1}
                        title={variants.length === 1 ? "At least one variant required" : "Remove variant"}
                        style={{ opacity: variants.length === 1 ? 0.5 : 1 }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>

                    <div className="ami-row">
                      <div className="ami-section">
                        <label className="ami-label">Selling Price *</label>
                        <div className={`ami-currency-wrapper ${hasAttemptedSubmit && errors[`variant_${v.id}_price`] ? 'is-invalid-border' : ''}`}>
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
                        {hasAttemptedSubmit && errors[`variant_${v.id}_price`] && <p className="ami-error-text">{errors[`variant_${v.id}_price`]}</p>}
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
                        <div className="ami-ingredient-row" style={{ marginBottom: '-0.25rem' }}>
                          <label className="ami-label">Ingredient *</label>
                          <label className="ami-label">Qty *</label>
                          <label className="ami-label">Unit *</label>
                          <label className="ami-label">Est. Cost</label>
                          <div></div>
                        </div>
                        {v.ingredients.map(ing => renderIngredientRow(
                          ing,
                          (f, val) => updateVariantIngredient(v.id, ing.id, f, val),
                          () => removeVariantIngredient(v.id, ing.id),
                          `var_${v.id}_ing_${ing.id}`
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

        <div className="ami-modal-footer">
          <button className="ami-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="ami-btn-save"
            disabled={isSubmitting}
            onClick={handleSaveItem}
          >
            {isSubmitting ? 'Saving...' : 'Add Menu Item'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddMenuItemModal;