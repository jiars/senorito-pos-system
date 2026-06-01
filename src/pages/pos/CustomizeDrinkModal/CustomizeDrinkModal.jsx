import React, { useState, useEffect } from 'react';
import './CustomizeDrinkModal.css';

const ADD_ONS_DATA = [
  { id: 'ao-1', name: 'Extra Shot', price: 50 },
  { id: 'ao-2', name: 'Syrup', price: 50 },
  { id: 'ao-3', name: 'Sauce', price: 50 },
  { id: 'ao-4', name: 'Nata', price: 50 },
  { id: 'ao-5', name: 'Ice Cream', price: 50 },
];

const CustomizeDrinkModal = ({ product, onClose, onAddToCart }) => {
  // State for selected size variant. Default to the first variant if available.
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // State for main drink quantity
  const [drinkQty, setDrinkQty] = useState(1);

  // State for add-ons: [{ id, name, price, selected: boolean, qty: number }]
  const [addOns, setAddOns] = useState(
    ADD_ONS_DATA.map(ao => ({ ...ao, selected: false, qty: 1 }))
  );

  // Reset state if product changes 
  useEffect(() => {
    setSelectedVariantIndex(0);
    setDrinkQty(1);
    setAddOns(ADD_ONS_DATA.map(ao => ({ ...ao, selected: false, qty: 1 })));
  }, [product]);

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

  const handleAddToCartClick = () => {
    // Gather selected variant name
    const variantName = product.variants && product.variants.length > 0
      ? product.variants[selectedVariantIndex].name
      : 'Regular';

    // Gather selected add-ons
    const selectedAddOns = addOns.filter(ao => ao.selected).map(ao => ({
      name: ao.name,
      qty: ao.qty,
      price: ao.price
    }));

    onAddToCart({
      ...product,
      selectedVariant: variantName,
      drinkQty,
      selectedAddOns,
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
                    className={`pos-customize-variant-btn ${selectedVariantIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedVariantIndex(idx)}
                  >
                    <h3>{v.name}</h3>
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
            {addOns.map(ao => (
              <div key={ao.id} className="pos-customize-addon">
                <input
                  type="checkbox"
                  className="pos-customize-addon-checkbox"
                  checked={ao.selected}
                  onChange={() => handleToggleAddOn(ao.id)}
                />
                <span className="pos-customize-addon-name">{ao.name}</span>

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

                <span className="pos-customize-addon-price">+ ₱{ao.price}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="pos-customize-footer">
          <div className="pos-customize-total">
            <span>Total</span>
            <span>₱ {total.toFixed(2)}</span>
          </div>
          <button className="pos-customize-add-btn" onClick={handleAddToCartClick}>
            Add to Order
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomizeDrinkModal;
