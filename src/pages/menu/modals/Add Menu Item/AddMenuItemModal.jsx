import React, { useState, useEffect } from 'react';
import './addMenuItemModal.css';
import { addMenuItem } from '../../../../services/menu/menuItemsService';
import { uploadMenuImage } from '../../../../utils/imageUploadHelper';
import { calculateEstCost, calculateProfit, calculateMargin } from '../../../../utils/menu/pricingCalculations';
import { validateMenuItemForm } from '../../../../utils/validation/menuValidation';

import AddMenuBaseInfo from './components/AddMenuBaseInfo';
import AddMenuSinglePrice from './components/AddMenuSinglePrice';
import AddMenuVariants from './components/AddMenuVariants';

const getInitialBaseInfo = () => ({ name: '', category: '', description: '', isAvailable: false, image: null });
const getInitialSingleRecipe = () => ({ sellingPrice: '', ingredients: [{ id: Date.now(), ingredientId: '', qty: '', unit: '' }] });
const getInitialVariant = () => ({ id: Date.now(), name: '', isAvailable: true, sellingPrice: '', ingredients: [{ id: Date.now() + 1, ingredientId: '', qty: '', unit: '' }] });

const AddMenuItemModal = ({ isOpen, onClose, refetchMenu, categories, inventoryItems = [] }) => {
  /* ─── State ─── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState({});

  const [pricingMode, setPricingMode] = useState('single'); // 'single' or 'variants'

  const [baseInfo, setBaseInfo] = useState(getInitialBaseInfo());
  const [singleRecipe, setSingleRecipe] = useState(getInitialSingleRecipe());
  const [variants, setVariants] = useState([getInitialVariant()]);

  /* ─── Load Categories & Reset State on Open ─── */
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setIsSubmitting(false);
      setHasAttemptedSubmit(false);
      setErrors({});
      setPricingMode('single');
      setBaseInfo(getInitialBaseInfo());
      setSingleRecipe(getInitialSingleRecipe());
      setVariants([getInitialVariant()]);
    }
  }, [isOpen]);

  /* ─── Validation Helpers ─── */
  useEffect(() => {
    if (!isOpen) return;
    const newErrors = validateMenuItemForm(baseInfo, pricingMode, singleRecipe, variants);
    setErrors(newErrors);
  }, [baseInfo, pricingMode, singleRecipe, variants, isOpen]);

  const isFormValid = Object.keys(errors).length === 0;

  if (!isOpen) return null;

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

      // 2. Build the Giant JSON Payload
      const payload = {
        base_info: {
          item_name: baseInfo.name.trim(),
          category_id: baseInfo.category,
          recipe_status: 'Complete',
          pos_status: baseInfo.isAvailable ? 'Available' : 'Unavailable',
          pricing_type: pricingMode === 'single' ? 'Fixed' : 'Variants',
          image_url: uploadedImageUrl
        },
        prices: []
      };

      if (pricingMode === 'single') {
        const estCost = calculateEstCost(singleRecipe.ingredients, inventoryItems);
        const profit = calculateProfit(singleRecipe.sellingPrice, estCost);
        const margin = calculateMargin(profit, singleRecipe.sellingPrice);

        const singlePriceData = {
          variant_name: 'Regular',
          selling_price: parseFloat(singleRecipe.sellingPrice) || 0,
          estimated_cost: estCost,
          profit: profit,
          margin: margin,
          item_code: null, // Will be generated in backend if needed
          pos_status: 'Available',
          recipes: []
        };

        singleRecipe.ingredients.forEach(ing => {
          if (ing.ingredientId && ing.qty) {
            const ref = inventoryItems.find(i => i.id === ing.ingredientId);
            let equivalent = 1;
            if (ing.unit && ing.unit !== ref?.base_unit) {
              const conv = ref?.inventory_conversion_units?.find(cu => cu.converted_unit === ing.unit);
              if (conv) equivalent = Number(conv.equivalent_base_amount);
            }
            const baseQty = parseFloat(ing.qty) * equivalent;
            
            singlePriceData.recipes.push({
              inventory_item_id: ing.ingredientId,
              quantity: parseFloat(ing.qty),
              unit: ing.unit || ref?.base_unit,
              estimated_cost: baseQty * (ref ? ref.cost_per_unit : 0)
            });
          }
        });

        payload.prices.push(singlePriceData);

      } else {
        variants.forEach(v => {
          const vEstCost = calculateEstCost(v.ingredients, inventoryItems);
          const vProfit = calculateProfit(v.sellingPrice, vEstCost);
          const vMargin = calculateMargin(vProfit, v.sellingPrice);

          const variantData = {
            variant_name: v.name.trim(),
            selling_price: parseFloat(v.sellingPrice) || 0,
            estimated_cost: vEstCost,
            profit: vProfit,
            margin: vMargin,
            item_code: null, // Will be generated in backend if needed
            pos_status: v.isAvailable ? 'Available' : 'Unavailable',
            recipes: []
          };

          v.ingredients.forEach(ing => {
            if (ing.ingredientId && ing.qty) {
              const ref = inventoryItems.find(i => i.id === ing.ingredientId);
              let equivalent = 1;
              if (ing.unit && ing.unit !== ref?.base_unit) {
                const conv = ref?.inventory_conversion_units?.find(cu => cu.converted_unit === ing.unit);
                if (conv) equivalent = Number(conv.equivalent_base_amount);
              }
              const baseQty = parseFloat(ing.qty) * equivalent;

              variantData.recipes.push({
                inventory_item_id: ing.ingredientId,
                quantity: parseFloat(ing.qty),
                unit: ing.unit || ref?.base_unit,
                estimated_cost: baseQty * (ref ? ref.cost_per_unit : 0)
              });
            }
          });

          payload.prices.push(variantData);
        });
      }

      // 3. Send Single API Request
      await addMenuItem(payload);

      // 4. Refresh menu list and close modal
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
          <AddMenuBaseInfo
            baseInfo={baseInfo}
            setBaseInfo={setBaseInfo}
            categories={categories}
            hasAttemptedSubmit={hasAttemptedSubmit}
            errors={errors}
          />

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
          {pricingMode === 'single' && (
            <AddMenuSinglePrice
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
            <AddMenuVariants
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