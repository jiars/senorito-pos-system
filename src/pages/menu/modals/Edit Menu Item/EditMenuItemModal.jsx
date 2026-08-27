import React, { useState, useEffect } from 'react';
import './editMenuItemModal.css';
import { fetchMenuCategories } from '../../../../services/menu/menuCategoriesService';
import { updateMenuItem } from '../../../../services/menu/menuItemsService';
import { addMenuItemPrices, deleteMenuItemPrices } from '../../../../services/menu/menuPricesService';
import { addMenuRecipes, deleteMenuRecipes } from '../../../../services/menu/menuRecipesService';
import { useInventory } from '../../../../hooks/useInventory';
import { uploadMenuImage } from '../../../../utils/imageUploadHelper';

const EditMenuItemModal = ({ isOpen, onClose, item, refetchMenu }) => {
  const { inventoryItems } = useInventory();
  /* ─── State ─── */
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [pricingMode, setPricingMode] = useState('single');

  const [baseInfo, setBaseInfo] = useState({
    name: '',
    category: '',
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

  /* ─── Populate State on Open ─── */
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setIsSubmitting(false);

      const loadCategories = async () => {
        const cats = await fetchMenuCategories();
        setCategories(cats);
      };
      loadCategories();

      if (item) {
        setBaseInfo({
          name: item.item_name || '',
          category: item.category_id || '',
          isAvailable: item.pos_status === 'Available',
          image: null
        });

        if (item.pricing_type === 'Variants' || (item.prices && item.prices.length > 1) || (item.prices && item.prices[0] && item.prices[0].variant_name !== 'Regular')) {
          setPricingMode('variants');
          if (item.prices && item.prices.length > 0) {
            setVariants(item.prices.map((p, idx) => {
              const variantRecipes = (item.recipes || []).filter(r => r.menu_item_price_id === p.id);
              let initialIngredients = [{ id: Date.now() + 10 + idx, ingredientId: '', qty: '', unit: '' }];
              if (variantRecipes.length > 0) {
                initialIngredients = variantRecipes.map((r, rIdx) => ({
                  id: Date.now() + 100 + idx + rIdx,
                  ingredientId: r.inventory_item_id,
                  qty: r.quantity.toString(),
                  unit: r.unit || ''
                }));
              }

              return {
                id: p.id || Date.now() + idx,
                name: p.variant_name || '',
                isAvailable: p.pos_status !== 'Unavailable',
                sellingPrice: p.selling_price ? p.selling_price.toString() : '',
                ingredients: initialIngredients
              };
            }));
          } else {
            setVariants([{
              id: Date.now(), name: '', isAvailable: true, sellingPrice: '',
              ingredients: [{ id: Date.now() + 1, ingredientId: '', qty: '', unit: '' }]
            }]);
          }
        } else {
          setPricingMode('single');
          const singleRecipes = item.recipes || [];
          let initialIngredients = [{ id: Date.now(), ingredientId: '', qty: '', unit: '' }];
          if (singleRecipes.length > 0) {
            initialIngredients = singleRecipes.map((r, idx) => ({
              id: Date.now() + 200 + idx,
              ingredientId: r.inventory_item_id,
              qty: r.quantity.toString(),
              unit: r.unit || ''
            }));
          }

          setSingleRecipe({
            sellingPrice: (item.prices && item.prices[0]) ? item.prices[0].selling_price.toString() : '0',
            ingredients: initialIngredients
          });
        }
      } else {
        setPricingMode('single');
        setBaseInfo({ name: '', category: '', isAvailable: false, image: null });
        setSingleRecipe({
          sellingPrice: '',
          ingredients: [{ id: Date.now(), ingredientId: '', qty: '', unit: '' }]
        });
        setVariants([{
          id: Date.now(), name: '', isAvailable: true, sellingPrice: '',
          ingredients: [{ id: Date.now() + 1, ingredientId: '', qty: '', unit: '' }]
        }]);
      }
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

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
  const isFormValid = () => {
    const isBaseValid = baseInfo.name.trim() !== '' && baseInfo.category !== '';
    if (!isBaseValid) return false;

    const hasValidIngredients = (ingredients) => {
      return ingredients.some(ing => ing.ingredientId !== '' && ing.qty !== '' && Number(ing.qty) > 0);
    };

    if (pricingMode === 'single') {
      return singleRecipe.sellingPrice !== '' && hasValidIngredients(singleRecipe.ingredients);
    } else {
      return variants.length > 0 && variants.every(v => v.name.trim() !== '' && v.sellingPrice !== '' && hasValidIngredients(v.ingredients));
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
          const ref = inventoryItems.find(i => i.id === value);
          if (ref) updated.unit = ref.base_unit;
        }
        return updated;
      });
      return { ...v, ingredients: newIngs };
    }));
  };

  /* ─── Shared Render: Ingredient Row ─── */
  const renderIngredientRow = (ing, onUpdate, onRemove) => {
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
      <div className="emi-ingredient-row" key={ing.id}>
        <div className="emi-section">
          <select
            className="emi-select"
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
        </div>
        <div className="emi-section">
          <input
            type="number"
            className="emi-input"
            placeholder="Qty"
            value={ing.qty}
            onChange={(e) => onUpdate('qty', e.target.value)}
            min="0" step="any"
          />
        </div>
        <div className="emi-section">
          {availableUnits.length > 0 ? (
            <select
              className="emi-select"
              value={ing.unit}
              onChange={(e) => onUpdate('unit', e.target.value)}
            >
              {availableUnits.map(u => (
                <option key={u.unit} value={u.unit}>{u.label}</option>
              ))}
            </select>
          ) : (
            <div className="emi-input" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center' }}>
              -
            </div>
          )}
        </div>
        <div className="emi-section emi-currency-wrapper">
          <span className="emi-currency-symbol">₱</span>
          <input
            type="text"
            className="emi-input"
            readOnly
            value={rowCost > 0 ? rowCost.toFixed(2) : '0.00'}
          />
        </div>
        <button
          className="emi-btn-remove-ing"
          onClick={onRemove}
          title="Remove ingredient"
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
    );
  };

  /* ─── Save Edited Item to Database ─── */
  const handleSaveEdit = async () => {
    if (!item || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Upload new image if exists, else keep old
      let finalImageUrl = item.image_url;
      if (baseInfo.image) {
        const selectedCat = categories.find(c => c.id === baseInfo.category);
        const categoryName = selectedCat ? selectedCat.category_name : 'Uncategorized';
        finalImageUrl = await uploadMenuImage(baseInfo.image, baseInfo.name, categoryName);
      }

      // 2. Update base item in menu_items table
      await updateMenuItem(item.id, {
        item_name: baseInfo.name.trim(),
        category_id: baseInfo.category,
        recipe_status: item.recipe_status || 'Complete',
        pos_status: baseInfo.isAvailable ? 'Available' : 'Unavailable',
        pricing_type: pricingMode === 'single' ? 'Fixed' : 'Variants',
        image_url: finalImageUrl
      });

      // 3. Re-save variant prices in menu_item_prices table
      await deleteMenuItemPrices(item.id);

      let pricesArray = [];
      if (pricingMode === 'single') {
        const estCost = calculateEstCost(singleRecipe.ingredients);
        const profit = calculateProfit(singleRecipe.sellingPrice, estCost);
        const margin = calculateMargin(profit, singleRecipe.sellingPrice);

        pricesArray.push({
          menu_item_id: item.id,
          variant_name: 'Regular',
          selling_price: parseFloat(singleRecipe.sellingPrice) || 0,
          estimated_cost: estCost,
          profit: profit,
          margin: margin,
          item_code: `${item.item_code}-R`,
          pos_status: 'Available'
        });
      } else {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          const vEstCost = calculateEstCost(v.ingredients);
          const vProfit = calculateProfit(v.sellingPrice, vEstCost);
          const vMargin = calculateMargin(vProfit, v.sellingPrice);

          pricesArray.push({
            menu_item_id: item.id,
            variant_name: v.name.trim(),
            selling_price: parseFloat(v.sellingPrice) || 0,
            estimated_cost: vEstCost,
            profit: vProfit,
            margin: vMargin,
            item_code: `${item.item_code}-${v.name.trim().substring(0, 3).toUpperCase()}`,
            pos_status: v.isAvailable ? 'Available' : 'Unavailable'
          });
        }
      }

      const savedPrices = await addMenuItemPrices(pricesArray);

      // 4. Update Recipes
      await deleteMenuRecipes(item.id);

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
              menu_item_id: item.id,
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
                  menu_item_id: item.id,
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
      console.error('Failed to update menu item:', error);
      setErrorMessage(error.message || 'Error updating item in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="emi-modal-overlay">
      <div className="emi-modal-content">

        {/* Header */}
        <div className="emi-modal-header">
          <h3>Edit Menu Item</h3>
          <button className="emi-modal-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="emi-modal-body">

          {/* Base Info with Image Upload */}
          <div className="emi-flex-row">
            <div className="emi-image-upload-container">
              <label className="emi-label">Item Image</label>
              <div className="emi-image-upload-box">
                <input
                  type="file"
                  accept="image/*"
                  className="emi-image-input"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setBaseInfo({ ...baseInfo, image: e.target.files[0] });
                    }
                  }}
                />
                {baseInfo.image ? (
                  <img src={URL.createObjectURL(baseInfo.image)} alt="Preview" className="emi-image-preview" />
                ) : item?.image_url ? (
                  <img src={item.image_url} alt="Current" className="emi-image-preview" />
                ) : null}
                
                <div className={`emi-image-placeholder ${(baseInfo.image || item?.image_url) ? 'has-image' : ''}`}>
                  <i className="bi bi-camera"></i>
                  <span>{(baseInfo.image || item?.image_url) ? 'Change Image' : 'Upload'}</span>
                </div>
              </div>
            </div>

            <div className="emi-flex-fields">
              <div className="emi-section" style={{ marginBottom: 0 }}>
                <label className="emi-label">Item Name</label>
                <input
                  type="text"
                  className="emi-input"
                  placeholder="Enter menu item name"
                  value={baseInfo.name}
                  onChange={(e) => setBaseInfo({ ...baseInfo, name: e.target.value })}
                />
              </div>
              <div className="emi-section" style={{ marginBottom: 0 }}>
                <label className="emi-label">Category</label>
                <select
                  className="emi-select"
                  value={baseInfo.category}
                  onChange={(e) => setBaseInfo({ ...baseInfo, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
              </div>
              <div className="emi-section" style={{ marginBottom: 0, marginTop: '0.5rem' }}>
                <label className="emi-toggle-container">
                  <input
                    type="checkbox"
                    style={{ display: 'none' }}
                    checked={baseInfo.isAvailable}
                    onChange={(e) => setBaseInfo({ ...baseInfo, isAvailable: e.target.checked })}
                  />
                  <span className="emi-toggle-switch">
                    <span className="emi-toggle-slider"></span>
                  </span>
                  <span className="emi-toggle-label">Available for sale</span>
                </label>
              </div>
            </div>
          </div>

          <div className="emi-row emi-pricing-mode">
            <label className="emi-label" style={{ marginRight: '1rem' }}>Pricing</label>
            <div className="emi-segmented-control">
              <button
                className={`emi-segment-btn ${pricingMode === 'single' ? 'active' : ''}`}
                onClick={() => setPricingMode('single')}
              >
                Single Price
              </button>
              <button
                className={`emi-segment-btn ${pricingMode === 'variants' ? 'active' : ''}`}
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
                <div className="emi-row">
                  <div className="emi-section">
                    <label className="emi-label">Selling Price</label>
                    <div className="emi-currency-wrapper">
                      <span className="emi-currency-symbol">₱</span>
                      <input
                        type="number"
                        className="emi-input"
                        placeholder="0.00"
                        value={singleRecipe.sellingPrice}
                        onChange={(e) => setSingleRecipe({ ...singleRecipe, sellingPrice: e.target.value })}
                        min="0" step="any"
                      />
                    </div>
                  </div>
                  <div className="emi-section">
                    <label className="emi-label">Est. Cost</label>
                    <div className="emi-currency-wrapper">
                      <span className="emi-currency-symbol">₱</span>
                      <input type="text" className="emi-input" readOnly value={estCost.toFixed(2)} />
                    </div>
                  </div>
                  <div className="emi-section">
                    <label className="emi-label">Profit</label>
                    <div className="emi-currency-wrapper">
                      <span className="emi-currency-symbol">₱</span>
                      <input type="text" className="emi-input" readOnly value={profit.toFixed(2)} />
                    </div>
                  </div>
                  <div className="emi-section">
                    <label className="emi-label">Margin</label>
                    <input type="text" className="emi-input" readOnly value={`${margin.toFixed(2)}%`} />
                  </div>
                </div>

                <hr className="emi-divider" />

                <div className="emi-section">
                  <label className="emi-label">Recipe / Ingredient Deductions</label>
                  <p className="emi-subtext">Select ingredients that will be deducted from inventory when sold.</p>

                  <div className="emi-ingredients-table">
                    <div className="emi-ingredient-row" style={{ marginBottom: '-0.25rem' }}>
                      <label className="emi-label">Ingredient</label>
                      <label className="emi-label">Qty</label>
                      <label className="ami-label">Unit</label>
                      <label className="emi-label">Est. Cost</label>
                      <div></div>
                    </div>
                    {singleRecipe.ingredients.map(ing => renderIngredientRow(
                      ing,
                      (f, v) => updateSingleIngredient(ing.id, f, v),
                      () => removeSingleIngredient(ing.id)
                    ))}
                  </div>

                  <button className="emi-btn-add-ing" onClick={addSingleIngredient}>
                    <i className="bi bi-plus"></i> Add Ingredient
                  </button>
                </div>
              </>
            );
          })()}

          {/* Variants Mode */}
          {pricingMode === 'variants' && (
            <div className="emi-variants-list">
              {variants.map((v, index) => {
                const estCost = calculateEstCost(v.ingredients);
                const profit = calculateProfit(v.sellingPrice, estCost);
                const margin = calculateMargin(profit, v.sellingPrice);

                return (
                  <div className="emi-variant-card" key={v.id}>
                    <div className="emi-variant-header">
                      <div className="emi-section">
                        <label className="emi-label">Size/ Variant Name</label>
                        <input
                          type="text"
                          className="emi-input"
                          placeholder="e.g. 16oz"
                          value={v.name}
                          onChange={(e) => updateVariant(v.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="emi-section" style={{ alignSelf: 'center', marginTop: '1.25rem' }}>
                        <label className="emi-toggle-container">
                          <input
                            type="checkbox"
                            style={{ display: 'none' }}
                            checked={v.isAvailable}
                            onChange={(e) => updateVariant(v.id, 'isAvailable', e.target.checked)}
                          />
                          <span className="emi-toggle-switch">
                            <span className="emi-toggle-slider"></span>
                          </span>
                          <span className="emi-toggle-label" style={{ fontSize: '0.75rem' }}>Available for sale</span>
                        </label>
                      </div>
                      <button
                        className="emi-btn-remove-variant"
                        onClick={() => removeVariant(v.id)}
                        disabled={variants.length === 1}
                        title={variants.length === 1 ? "At least one variant required" : "Remove variant"}
                        style={{ opacity: variants.length === 1 ? 0.5 : 1 }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>

                    <div className="emi-row">
                      <div className="emi-section">
                        <label className="emi-label">Selling Price</label>
                        <div className="emi-currency-wrapper">
                          <span className="emi-currency-symbol">₱</span>
                          <input
                            type="number"
                            className="emi-input"
                            placeholder="0.00"
                            value={v.sellingPrice}
                            onChange={(e) => updateVariant(v.id, 'sellingPrice', e.target.value)}
                            min="0" step="any"
                          />
                        </div>
                      </div>
                      <div className="emi-section">
                        <label className="emi-label">Est. Cost</label>
                        <div className="emi-currency-wrapper">
                          <span className="emi-currency-symbol">₱</span>
                          <input type="text" className="emi-input" readOnly value={estCost.toFixed(2)} />
                        </div>
                      </div>
                      <div className="emi-section">
                        <label className="emi-label">Profit</label>
                        <div className="emi-currency-wrapper">
                          <span className="emi-currency-symbol">₱</span>
                          <input type="text" className="emi-input" readOnly value={profit.toFixed(2)} />
                        </div>
                      </div>
                      <div className="emi-section">
                        <label className="emi-label">Margin</label>
                        <input type="text" className="emi-input" readOnly value={`${margin.toFixed(2)}%`} />
                      </div>
                    </div>

                    <div className="emi-section">
                      <label className="emi-label">Recipe / Ingredient Deductions</label>
                      <p className="emi-subtext">Select ingredients that will be deducted from inventory when sold.</p>

                      <div className="emi-ingredients-table">
                        <div className="emi-ingredient-row" style={{ marginBottom: '-0.25rem' }}>
                          <label className="emi-label">Ingredient</label>
                          <label className="emi-label">Qty</label>
                          <label className="emi-label">Unit</label>
                          <label className="emi-label">Est. Cost</label>
                          <div></div>
                        </div>
                        {v.ingredients.map(ing => renderIngredientRow(
                          ing,
                          (f, val) => updateVariantIngredient(v.id, ing.id, f, val),
                          () => removeVariantIngredient(v.id, ing.id)
                        ))}
                      </div>

                      <button className="emi-btn-add-ing" onClick={() => addVariantIngredient(v.id)}>
                        <i className="bi bi-plus"></i> Add Ingredient
                      </button>
                    </div>
                  </div>
                );
              })}

              <button className="emi-btn-add-variant" onClick={addVariant}>
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
        <div className="emi-modal-footer">
          <button className="emi-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="emi-btn-save"
            disabled={!isFormValid() || isSubmitting}
            onClick={handleSaveEdit}
          >
            {isSubmitting ? 'Saving...' : 'Save Menu Item'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditMenuItemModal;
