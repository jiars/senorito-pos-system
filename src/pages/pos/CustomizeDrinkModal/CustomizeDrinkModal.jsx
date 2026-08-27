import React, { useState, useEffect } from 'react';
import './CustomizeDrinkModal.css';
const CustomizeDrinkModal = ({ product, allAddons = [], onClose, onAddToCart }) => {
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
        let isAvailable = ao.pos_status === 'Available';
        let unavailableReason = ao.pos_status === 'Available' ? '' : '(Unavailable)';

        if (isAvailable && ao.addon_recipes && ao.addon_recipes.length > 0) {
           for (const recipe of ao.addon_recipes) {
              const required = Number(recipe.quantity) || 0;
              const available = recipe.inventory_items?.current_stock || 0;
              if (available < required) {
                 isAvailable = false;
                 unavailableReason = '(Out of Stock)';
                 break;
              }
           }
        }

        return {
          id: ao.id,
          name: ao.addon_name,
          price: ao.selling_price,
          selected: false,
          qty: 1,
          recipes: ao.addon_recipes || [],
          isAvailable,
          unavailableReason
        };
      }));
    }
  }, [product, allAddons]);

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

  const handleToggleAddOn = (id) => {
    setAddOns(prev => prev.map(ao =>
      ao.id === id ? { ...ao, selected: !ao.selected } : ao
    ));
  };

  const handleUpdateAddOnQty = (id, delta) => {
    setAddOns(prev => prev.map(ao => {
      if (ao.id === id) {
        const newQty = Math.max(1, ao.qty + delta); // minimum 1
        return { ...ao, qty: newQty };
      }
      return ao;
    }));
  };

  // Helper to aggregate stock and check if the current combination is valid
  const checkStockSufficiency = () => {
    const inventoryNeeded = {};

    // 1. Main Drink Requirements
    const variantId = product.variants && product.variants.length > 0
      ? product.variants[selectedVariantIndex].id
      : product.defaultPriceId;
    
    const mainRecipes = product.rawRecipes?.filter(r => r.menu_item_price_id === variantId || r.menu_item_price_id === null) || [];
    
    for (const r of mainRecipes) {
      const id = r.inventory_item_id;
      if (!inventoryNeeded[id]) {
        inventoryNeeded[id] = { required: 0, available: r.inventory_items?.current_stock || 0 };
      }
      inventoryNeeded[id].required += (Number(r.quantity) || 0) * drinkQty;
    }

    // 2. Add-ons Requirements
    const selectedAddOns = addOns.filter(ao => ao.selected);
    for (const ao of selectedAddOns) {
      for (const r of ao.recipes) {
        const id = r.inventory_item_id;
        if (!inventoryNeeded[id]) {
          inventoryNeeded[id] = { required: 0, available: r.inventory_items?.current_stock || 0 };
        }
        inventoryNeeded[id].required += (Number(r.quantity) || 0) * ao.qty * drinkQty;
      }
    }

    // 3. Compare
    for (const key in inventoryNeeded) {
      if (inventoryNeeded[key].required > inventoryNeeded[key].available) {
        return false;
      }
    }
    return true;
  };

  const isCombinationValid = checkStockSufficiency();

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
          <h2>Customize Drink</h2>
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
                    <h3>{v.name} {!v.isAvailable && <span style={{color: 'red', fontSize: '0.7rem'}}>(N/A)</span>}</h3>
                    <p>₱{v.price.toFixed(2)}</p>
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
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
          </div>

          {/* Add-ons */}
          <h3 className="pos-customize-section-title">Add-ons</h3>
          <div className="pos-customize-addons-list">
            {addOns.length === 0 ? (
              <div style={{ color: '#999', fontStyle: 'italic', padding: '0.5rem 0' }}>
                No available add-ons for this category.
              </div>
            ) : (
              addOns.map(ao => (
                <div key={ao.id} className={`pos-customize-addon ${!ao.isAvailable ? 'pos-customize-addon-disabled' : ''}`} style={!ao.isAvailable ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
                  <input
                    type="checkbox"
                    className="pos-customize-addon-checkbox"
                    checked={ao.selected}
                    disabled={!ao.isAvailable}
                    onChange={() => handleToggleAddOn(ao.id)}
                  />
                  <span className="pos-customize-addon-name">
                    {ao.name} {!ao.isAvailable && <span style={{color: 'red', fontSize: '0.8rem', marginLeft: '0.5rem'}}>{ao.unavailableReason || '(N/A)'}</span>}
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
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  )}

                  <span className="pos-customize-addon-price">+ ₱{ao.price.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="pos-customize-footer">
          <div className="pos-customize-total">
            <span>Total</span>
            <span>₱ {total.toFixed(2)}</span>
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

export default CustomizeDrinkModal;
