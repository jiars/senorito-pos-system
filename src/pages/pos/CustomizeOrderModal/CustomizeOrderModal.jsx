import { useState, useEffect } from 'react';
import { formatCurrency } from '../../../utils/currencyFormatters';
import {
  getInventoryStockStatus,
  getRecipeAvailabilityStatus,
} from '../../../utils/pos/checkoutCalculations';
import './CustomizeOrderModal.css';
const CustomizeOrderModal = ({ product, allAddons = [], cartItems = [], onClose, onAddToCart }) => {
  // State for selected size variant. Default to the first variant if available.
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // State for main drink quantity
  const [drinkQty, setDrinkQty] = useState(1);

  // State for add-ons: [{ id, name, price, selected: boolean, qty: number }]
  const [addOns, setAddOns] = useState([]);
  useEffect(() => {
    if (product) {
      let firstAvailableIdx = 0;
      if (product.variants && product.variants.length > 0) {
        firstAvailableIdx = product.variants.findIndex(v => v.isAvailable);
        if (firstAvailableIdx === -1) firstAvailableIdx = 0;
      }
      setSelectedVariantIndex(firstAvailableIdx);
      setDrinkQty(1);

      // Instantly filter active addons linked to this product's category
      const validAddons = allAddons.filter(ao =>
        !ao.archived &&
        ao.addon_categories &&
        ao.addon_categories.some(ac => ac.menu_category_id === product.categoryId)
      );

      setAddOns(validAddons.map(ao => {
        const recipes = ao.addon_recipes || [];
        const availability = getRecipeAvailabilityStatus({
          recipes,
          cartItems,
          posStatus: ao.pos_status,
          recipeStatus: ao.recipe_status,
        });

        return {
          id: ao.id,
          name: ao.addon_name,
          price: Number(ao.selling_price) || 0,
          selected: false,
          qty: 1,
          recipes,
          ...availability,
        };
      }));
    }
  }, [product, allAddons, cartItems]);

  if (!product) return null;

  // Calculate base price from the selected variant, or fallback to product base price
  const basePrice = product.variants && product.variants.length > 0
    ? product.variants[selectedVariantIndex].price
    : product.basePrice;

  // Calculate add-ons total
  const addOnsTotal = addOns.reduce((sum, ao) => {
    return sum + (ao.selected ? ao.price * ao.qty : 0);
  }, 0);

  // Calculate grand total: (basePrice + addOnsTotal) * drinkQty
  const total = (basePrice + addOnsTotal) * drinkQty;

  const buildStockPreviewItem = (quantity, addonOptions = addOns) => {
    const variantId = product.variants && product.variants.length > 0
      ? product.variants[selectedVariantIndex].id
      : product.defaultPriceId;

    const mainRecipes = product.rawRecipes?.filter(recipe =>
      recipe.menu_item_price_id === variantId ||
      recipe.menu_item_price_id === null
    ) || [];

    const selectedAddons = addonOptions
      .filter(addon => addon.selected)
      .map(addon => ({
        qty: addon.qty,
        recipes: addon.recipes,
      }));

    return {
      cartId: 'stock-preview',
      qty: quantity,
      recipeIngredients: mainRecipes,
      addOns: selectedAddons,
    };
  };

  const getStockStatusForSelection = (quantity, addonOptions = addOns) => {
    const previewItem = buildStockPreviewItem(quantity, addonOptions);
    return getInventoryStockStatus([...cartItems, previewItem]);
  };

  const handleToggleAddOn = (id) => {
    const updatedAddons = addOns.map(ao =>
      ao.id === id ? { ...ao, selected: !ao.selected } : ao
    );

    if (!getStockStatusForSelection(drinkQty, updatedAddons).hasEnoughStock) return;
    setAddOns(updatedAddons);
  };

  const handleUpdateAddOnQty = (id, delta) => {
    const updatedAddons = addOns.map(ao => {
      if (ao.id === id) {
        const newQty = Math.max(1, ao.qty + delta); // minimum 1
        return { ...ao, qty: newQty };
      }
      return ao;
    });

    if (delta > 0 && !getStockStatusForSelection(drinkQty, updatedAddons).hasEnoughStock) return;
    setAddOns(updatedAddons);
  };

  const getAddOnActionStatus = (addon) => {
    const updatedAddons = addOns.map(currentAddon => {
      if (currentAddon.id !== addon.id) return currentAddon;

      return addon.selected
        ? { ...currentAddon, qty: currentAddon.qty + 1 }
        : { ...currentAddon, selected: true };
    });

    return getStockStatusForSelection(drinkQty, updatedAddons);
  };

  const currentStockStatus = getStockStatusForSelection(drinkQty);
  const nextQuantityStockStatus = getStockStatusForSelection(drinkQty + 1);
  const isCombinationValid = currentStockStatus.hasEnoughStock;
  const canIncreaseDrinkQuantity = nextQuantityStockStatus.hasEnoughStock;

  const handleAddToCartClick = () => {
    // Gather selected variant name
    const variantName = product.variants && product.variants.length > 0
      ? product.variants[selectedVariantIndex].name
      : 'Regular';

    const variantId = product.variants && product.variants.length > 0
      ? product.variants[selectedVariantIndex].id
      : product.defaultPriceId;

    // Gather selected add-ons
    const selectedAddOns = addOns.filter(ao => ao.selected).map(ao => ({
      id: ao.id,
      name: ao.name,
      qty: ao.qty,
      price: ao.price,
      recipes: ao.recipes
    }));

    onAddToCart({
      ...product,
      selectedVariant: variantName,
      selectedVariantId: variantId,
      drinkQty,
      selectedAddOns,
      basePrice,
      totalPrice: total / drinkQty // Price per unit including its specific add-ons
    });

    onClose();
  };

  return (
    <div className="pos-customize-overlay" onClick={onClose}>
      <div className="pos-customize-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="pos-customize-header">
          <button className="pos-customize-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
          <h2>Customize Order</h2>
          <p>{product.name}</p>
        </div>

        <div className="pos-customize-content">

          {/* Size Variants */}
          {product.variants && product.variants.length > 0 && (
            <>
              <h3 className="pos-customize-section-title">Size Variant</h3>
              <div className="pos-customize-variants">
                {product.variants.map((v, idx) => (
                  <div
                    key={idx}
                    className={`pos-customize-variant-btn ${selectedVariantIndex === idx ? 'active' : ''} ${!v.isAvailable ? 'disabled' : ''}`}
                    style={!v.isAvailable ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                    onClick={() => {
                      if (v.isAvailable) setSelectedVariantIndex(idx);
                    }}
                  >
                    <h3>
                      {v.name}
                      {v.status !== 'Available' && (
                        <span className={`pos-customize-status ${v.isAvailable ? 'warning' : 'error'}`}>
                          {v.status}
                        </span>
                      )}
                    </h3>
                    <p>{formatCurrency(v.price)}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Main Drink Quantity */}
          <div className="pos-customize-main-qty">
            <span>Quantity</span>
            <div className="pos-customize-qty-ctrl">
              <button
                className="pos-customize-qty-btn"
                onClick={() => setDrinkQty(Math.max(1, drinkQty - 1))}
              >
                <i className="bi bi-dash"></i>
              </button>
              <span className="pos-customize-qty">{drinkQty}</span>
              <button
                className="pos-customize-qty-btn"
                onClick={() => setDrinkQty(drinkQty + 1)}
                disabled={!canIncreaseDrinkQuantity}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
          </div>

          {!isCombinationValid && (
            <p className="pos-customize-stock-note error">
              Insufficient stock: {currentStockStatus.insufficientIngredients.join(', ')}.
            </p>
          )}

          {isCombinationValid && !canIncreaseDrinkQuantity && (
            <p className="pos-customize-stock-note">
              Maximum available quantity reached.
            </p>
          )}

          {/* Add-ons */}
          <h3 className="pos-customize-section-title">Add-ons</h3>
          <div className="pos-customize-addons-list">
            {addOns.length === 0 ? (
              <div style={{ color: '#999', fontStyle: 'italic', padding: '0.5rem 0' }}>
                No available add-ons for this category.
              </div>
            ) : (
              addOns.map(ao => {
                const actionStockStatus = getAddOnActionStatus(ao);
                const isAddOnActionBlocked = !actionStockStatus.hasEnoughStock;

                return (
                <div key={ao.id} className={`pos-customize-addon ${!ao.isAvailable ? 'pos-customize-addon-disabled' : ''}`}>
                  <input
                    type="checkbox"
                    className="pos-customize-addon-checkbox"
                    checked={ao.selected}
                    disabled={!ao.isAvailable || (!ao.selected && isAddOnActionBlocked)}
                    onChange={() => handleToggleAddOn(ao.id)}
                  />
                  <span className="pos-customize-addon-name">
                    {ao.name}
                    {ao.status !== 'Available' && (
                      <span className={`pos-customize-status ${ao.isAvailable ? 'warning' : 'error'}`}>
                        {ao.status}
                      </span>
                    )}
                  </span>

                  {ao.selected && (
                    <div className="pos-customize-qty-ctrl">
                      <button
                        className="pos-customize-qty-btn"
                        onClick={() => handleUpdateAddOnQty(ao.id, -1)}
                        disabled={ao.qty <= 1}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="pos-customize-qty">{ao.qty}</span>
                      <button
                        className="pos-customize-qty-btn"
                        onClick={() => handleUpdateAddOnQty(ao.id, 1)}
                        disabled={isAddOnActionBlocked}
                        title={isAddOnActionBlocked ? 'Maximum available stock reached' : 'Add quantity'}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  )}

                  <span className="pos-customize-addon-price">+ {formatCurrency(ao.price)}</span>

                  {!ao.isAvailable && ao.blockingIngredients.length > 0 && (
                    <p className="pos-customize-addon-stock-note">
                      Affected: {ao.blockingIngredients.join(', ')}.
                    </p>
                  )}

                  {ao.isAvailable && isAddOnActionBlocked && (
                    <p className="pos-customize-addon-stock-note">
                      Insufficient stock: {actionStockStatus.insufficientIngredients.join(', ')}.
                    </p>
                  )}
                </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="pos-customize-footer">
          <div className="pos-customize-total">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <button 
            className="pos-customize-add-btn" 
            onClick={handleAddToCartClick}
            disabled={!isCombinationValid}
            style={!isCombinationValid ? { backgroundColor: '#ccc', cursor: 'not-allowed' } : {}}
          >
            {isCombinationValid ? 'Add to Order' : 'Insufficient Stock'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomizeOrderModal;
