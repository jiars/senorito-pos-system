import React, { useState, useEffect } from 'react';
import './editMenuItemModal.css';
import { fetchMenuCategories } from '../../../../services/menu/menuCategoriesService';
import { syncMenuItem } from '../../../../services/menu/menuItemsService';
import { useInventory } from '../../../../hooks/useInventory';
import { uploadMenuImage } from '../../../../utils/imageUploadHelper';
import { calculateEstCost, calculateProfit, calculateMargin } from '../../../../utils/menu/pricingCalculations';
import EditMenuBaseInfo from './components/EditMenuBaseInfo';
import EditMenuSinglePrice from './components/EditMenuSinglePrice';
import EditMenuVariants from './components/EditMenuVariants';

const getInitialBaseInfo = () => ({ name: '', category: '', isAvailable: false, image: null });
const getInitialSingleRecipe = () => ({ id: null, sellingPrice: '', ingredients: [{ id: Date.now(), ingredientId: '', qty: '', unit: '' }] });
const getInitialVariant = () => ({ id: Date.now(), name: '', isAvailable: true, sellingPrice: '', ingredients: [{ id: Date.now() + 1, ingredientId: '', qty: '', unit: '' }] });

const EditMenuItemModal = ({ isOpen, onClose, item, refetchMenu }) => {
  const { inventoryItems } = useInventory();
  /* ─── State ─── */
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState({});

  const [pricingMode, setPricingMode] = useState('single');

  const [baseInfo, setBaseInfo] = useState(getInitialBaseInfo());
  const [singleRecipe, setSingleRecipe] = useState(getInitialSingleRecipe());
  const [variants, setVariants] = useState([getInitialVariant()]);

  /* ─── Populate State on Open ─── */
  useEffect(() => {
    if (!isOpen) return;

    // Reset validations and loading state
    setErrorMessage('');
    setIsSubmitting(false);
    setHasAttemptedSubmit(false);
    setErrors({});

    // Load categories
    fetchMenuCategories().then(setCategories);

    if (item) {
      // 1. Populate Base Info
      setBaseInfo({
        name: item.item_name || '',
        category: item.category_id || '',
        isAvailable: item.pos_status === 'Available',
        image: null
      });

      // 2. Populate Pricing & Recipes
      const isVariants = item.pricing_type === 'Variants' || (item.menu_prices && item.menu_prices.length > 1) || (item.menu_prices && item.menu_prices[0]?.variant_name !== 'Regular');
      
      if (isVariants) {
        setPricingMode('variants');
        if (item.menu_prices && item.menu_prices.length > 0) {
          setVariants(item.menu_prices.map((p, idx) => {
            const variantRecipes = (item.menu_recipes || []).filter(r => r.menu_item_price_id === p.id);
            const ingredients = variantRecipes.length > 0
              ? variantRecipes.map((r, rIdx) => ({
                  id: r.id || Date.now() + 100 + idx + rIdx,
                  ingredientId: r.inventory_item_id,
                  qty: r.quantity.toString(),
                  unit: r.unit || ''
                }))
              : [{ id: Date.now() + 10 + idx, ingredientId: '', qty: '', unit: '' }];

            return {
              id: p.id || Date.now() + idx,
              name: p.variant_name || '',
              isAvailable: p.pos_status !== 'Unavailable',
              sellingPrice: p.selling_price ? p.selling_price.toString() : '',
              ingredients
            };
          }));
        } else {
          setVariants([getInitialVariant()]);
        }
      } else {
        setPricingMode('single');
        const singleRecipes = item.menu_recipes || [];
        const ingredients = singleRecipes.length > 0
          ? singleRecipes.map((r, idx) => ({
              id: r.id || Date.now() + 200 + idx,
              ingredientId: r.inventory_item_id,
              qty: r.quantity.toString(),
              unit: r.unit || ''
            }))
          : [{ id: Date.now(), ingredientId: '', qty: '', unit: '' }];

        setSingleRecipe({
          id: item.menu_prices?.[0]?.id || null,
          sellingPrice: item.menu_prices?.[0]?.selling_price?.toString() || '0',
          ingredients
        });
      }
    } else {
      // Reset if no item is provided
      setPricingMode('single');
      setBaseInfo(getInitialBaseInfo());
      setSingleRecipe(getInitialSingleRecipe());
      setVariants([getInitialVariant()]);
    }
  }, [isOpen, item]);

  /* ─── Validation Helpers ─── */
  useEffect(() => {
    if (!isOpen) return;
    const newErrors = {};

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

  const handleSaveEdit = async () => {
    setHasAttemptedSubmit(true);
    if (!item || !isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let finalImageUrl = item.image_url;
      if (baseInfo.image) {
        const selectedCat = categories.find(c => c.id === baseInfo.category);
        const categoryName = selectedCat ? selectedCat.category_name : 'Uncategorized';
        finalImageUrl = await uploadMenuImage(baseInfo.image, baseInfo.name, categoryName);
      }

      // 2. Build the giant nested JSON payload for Declarative Sync
      const payload = {
        base_info: {
          item_name: baseInfo.name.trim(),
          category_id: baseInfo.category,
          recipe_status: item.recipe_status || 'Complete',
          pos_status: baseInfo.isAvailable ? 'Available' : 'Unavailable',
          pricing_type: pricingMode === 'single' ? 'Fixed' : 'Variants',
          image_url: finalImageUrl
        },
        prices: []
      };

      const processIngredients = (ingredients) => {
        const recipes = [];
        ingredients.forEach(ing => {
          if (ing.ingredientId && ing.qty) {
            const ref = inventoryItems.find(i => i.id === ing.ingredientId);
            let equivalent = 1;
            if (ing.unit && ing.unit !== ref?.base_unit) {
              const conv = ref?.inventory_conversion_units?.find(cu => cu.converted_unit === ing.unit);
              if (conv) equivalent = Number(conv.equivalent_base_amount);
            }
            const baseQty = parseFloat(ing.qty) * equivalent;

            recipes.push({
              id: String(ing.id).includes('-') ? ing.id : null,
              inventory_item_id: ing.ingredientId,
              quantity: parseFloat(ing.qty),
              unit: ing.unit || ref?.base_unit,
              estimated_cost: baseQty * (ref ? ref.cost_per_unit : 0)
            });
          }
        });
        return recipes;
      };

      if (pricingMode === 'single') {
        const estCost = calculateEstCost(singleRecipe.ingredients, inventoryItems);
        const profit = calculateProfit(singleRecipe.sellingPrice, estCost);
        const margin = calculateMargin(profit, singleRecipe.sellingPrice);

        payload.prices.push({
          id: singleRecipe.id,
          variant_name: 'Regular',
          selling_price: parseFloat(singleRecipe.sellingPrice) || 0,
          estimated_cost: estCost,
          profit: profit,
          margin: margin,
          item_code: `${item.item_code}-R`,
          pos_status: 'Available',
          recipes: processIngredients(singleRecipe.ingredients)
        });
      } else {
        variants.forEach(v => {
          const vEstCost = calculateEstCost(v.ingredients, inventoryItems);
          const vProfit = calculateProfit(v.sellingPrice, vEstCost);
          const vMargin = calculateMargin(vProfit, v.sellingPrice);

          payload.prices.push({
            id: String(v.id).includes('-') ? v.id : null,
            variant_name: v.name.trim(),
            selling_price: parseFloat(v.sellingPrice) || 0,
            estimated_cost: vEstCost,
            profit: vProfit,
            margin: vMargin,
            item_code: `${item.item_code}-${v.name.trim().substring(0, 3).toUpperCase()}`,
            pos_status: v.isAvailable ? 'Available' : 'Unavailable',
            recipes: processIngredients(v.ingredients)
          });
        });
      }

      // 3. Send single API request!
      await syncMenuItem(item.id, payload);

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
          <EditMenuBaseInfo
            baseInfo={baseInfo}
            setBaseInfo={setBaseInfo}
            item={item}
            categories={categories}
            hasAttemptedSubmit={hasAttemptedSubmit}
            errors={errors}
          />

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
          {pricingMode === 'single' && (
            <EditMenuSinglePrice
              singleRecipe={singleRecipe}
              setSingleRecipe={setSingleRecipe}
              setErrorMessage={setErrorMessage}
              hasAttemptedSubmit={hasAttemptedSubmit}
              errors={errors}
              inventoryItems={inventoryItems}
            />
          )}

          {/* Variants Mode */}
          {pricingMode === 'variants' && (
            <EditMenuVariants
              variants={variants}
              setVariants={setVariants}
              setErrorMessage={setErrorMessage}
              hasAttemptedSubmit={hasAttemptedSubmit}
              errors={errors}
              inventoryItems={inventoryItems}
            />
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

        <div className="emi-modal-footer">
          <button className="emi-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="emi-btn-save"
            disabled={isSubmitting}
            onClick={handleSaveEdit}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditMenuItemModal;