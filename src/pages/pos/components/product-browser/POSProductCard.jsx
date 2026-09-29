import { useState } from 'react';
import defaultImage from '../../../../assets/images/default_menu_picture.jpg';
import { formatCurrency } from '../../../../utils/currencyFormatters';
import CustomizeOrderModal from '../../CustomizeOrderModal/CustomizeOrderModal';
import { Badge } from "@/components/ui/badge";

const POSProductCard = ({ product, onAdd, allAddons, cartItems }) => {
  // Local state for the card
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [drinkQty, setDrinkQty] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);

  // Derive variants... default 'Reg' if empty
  const variants = product.variants?.length > 0
    ? product.variants
    : [{ name: 'Reg', isAvailable: true, price: product.basePrice, id: product.defaultPriceId }];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Out of Stock':
        return 'bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)] border-[var(--app-color-danger-border)]';
      case 'On Hold':
        return 'bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)] border-[var(--app-color-warning)]/30';
      case 'Not Available':
      case 'Unavailable':
      default:
        return 'bg-[var(--app-color-surface-soft)] text-[var(--app-color-text-muted)] border-[var(--app-color-border)]';
    }
  };

  // Calculate price dynamically
  const basePrice = selectedVariantIndex !== null
    ? variants[selectedVariantIndex].price
    : product.basePrice;

  const addonsTotal = selectedAddons.reduce((sum, ao) => sum + (ao.price * ao.qty), 0);
  const totalPrice = (basePrice + addonsTotal) * drinkQty;

  const handleVariantClick = (idx) => {
    if (variants[idx].isAvailable) {
      setSelectedVariantIndex(prev => prev === idx ? null : idx);
    }
  };

  const handleAddQty = () => setDrinkQty(prev => prev + 1);
  const handleSubQty = () => setDrinkQty(prev => Math.max(1, prev - 1));

  const handleSaveAddons = (addons) => {
    setSelectedAddons(addons);
  };

  const handleAddToOrder = () => {
    if (selectedVariantIndex === null || !product.isAvailable) return;

    const variantName = variants[selectedVariantIndex].name || 'Reg';
    const variantId = variants[selectedVariantIndex].id || product.defaultPriceId;

    onAdd({
      ...product,
      selectedVariant: variantName,
      selectedVariantId: variantId,
      drinkQty,
      selectedAddOns: selectedAddons,
      basePrice,
      totalPrice: (basePrice + addonsTotal) // Price per unit including its specific add-ons
    });

    // Reset state after adding
    setSelectedVariantIndex(null);
    setDrinkQty(1);
    setSelectedAddons([]);
  };

  return (
    <>
      <div className={`relative bg-[var(--app-color-surface)] rounded-2xl border border-[var(--app-color-border-subtle)] p-[var(--app-gap-related)] flex gap-[var(--app-gap-related)] h-full transition-all duration-200 ${product.isAvailable ? 'hover:shadow-[var(--app-shadow-card)] hover:-translate-y-[2px]' : 'cursor-not-allowed opacity-70 grayscale-[30%]'}`}>

        {/* Left Column */}
        <div className="flex flex-col w-20 shrink-0">
          <div className="w-full aspect-[4/5] bg-[var(--app-color-surface-soft)] overflow-hidden rounded-xl">
            <img
              src={product.imageURL || defaultImage}
              alt={product.name}
              className="w-full h-full object-cover block"
              onError={(e) => { e.target.src = defaultImage; }}
            />
          </div>

          <div className="flex items-center justify-between w-full mt-1">
            <button
              className={`w-[1.375rem] h-[1.375rem] rounded-full border flex items-center justify-center text-[0.6rem] transition-colors ${drinkQty > 1 ? 'border-[var(--app-color-text-subtle)] text-[var(--app-color-text-subtle)] hover:text-[var(--app-color-text)]' : 'border-[var(--app-color-border-subtle)] text-[var(--app-color-text-muted)] cursor-not-allowed opacity-50'}`}
              onClick={handleSubQty}
              disabled={drinkQty <= 1 || !product.isAvailable}
            >
              <i className="bi bi-dash"></i>
            </button>
            <span className="text-[length:var(--app-font-size-body-secondary)] font-bold text-[var(--app-color-text)]">
              {drinkQty}
            </span>
            <button
              className="w-[1.375rem] h-[1.375rem] rounded-full border bg-[var(--app-color-brand)] border-[var(--app-color-brand)] text-white flex items-center justify-center text-[0.6rem] transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddQty}
              disabled={!product.isAvailable}
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Row 1: Title & Price */}
          <div className="flex flex-wrap justify-between items-start gap-x-2 gap-y-1 mb-2">
            <h4 className="font-bold text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] m-0 break-words whitespace-normal min-w-0 flex-1">
              {product.name}
            </h4>
            <span className="font-bold text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-brand)] whitespace-nowrap shrink-0">
              {formatCurrency(basePrice)}
            </span>
          </div>

          {/* Row 2: Size */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-muted)] shrink-0">Size</span>
            <div className="flex gap-1.5 flex-wrap">
              {variants.map((v, idx) => (
                <button
                  key={v.name || idx}
                  className={`px-2.5 py-0.5 rounded-full text-[length:var(--app-font-size-caption)] transition-all ${selectedVariantIndex === idx
                    ? 'bg-[var(--app-color-brand)] text-white border-[var(--app-color-brand)] shadow-sm'
                    : 'bg-transparent border border-[var(--app-color-border)] text-[var(--app-color-text-subtle)] hover:bg-[var(--app-color-surface-soft)]'
                    } ${!v.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleVariantClick(idx)}
                  disabled={!v.isAvailable}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Add-ons */}
          <div
            className={`flex flex-wrap justify-between items-center mt-1 mb-auto text-[var(--app-color-brand)] text-[length:var(--app-font-size-body-secondary)] transition-colors ${product.isAvailable ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-50'}`}
            onClick={() => {
              if (product.isAvailable) setIsAddonModalOpen(true);
            }}
          >
            <span>Add-On {selectedAddons.length > 0 ? `(${selectedAddons.length})` : ''}</span>
            <i className="bi bi-chevron-right"></i>
          </div>

          {/* Row 4: Add to Order Button */}
          <button
            className={`w-full mt-3 py-1.5 rounded-full text-[length:var(--app-font-size-caption)] font-semibold transition-all border ${selectedVariantIndex !== null
              ? 'bg-[var(--app-color-brand)] text-white border-[var(--app-color-brand)] shadow-sm hover:brightness-110 active:scale-[0.98]'
              : 'bg-transparent text-[var(--app-color-brand)] border-[var(--app-color-brand)]'
              }`}
            onClick={handleAddToOrder}
            disabled={selectedVariantIndex === null || !product.isAvailable}
          >
            Add to order
          </button>
        </div>

        {/* Unavailable Overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] z-10 rounded-2xl">
            <div className="absolute top-3 right-3 bg-[var(--app-color-surface)] rounded-full shadow-sm">
              <div className={`h-[var(--app-touch-target-min)] px-4 rounded-full border flex items-center justify-center font-semibold text-[length:var(--app-font-size-body-secondary)] capitalize ${getStatusColor(product.status || 'Not Available')}`}>
                {product.status || 'Not Available'}
              </div>
            </div>
          </div>
        )}
      </div>

      {isAddonModalOpen && (
        <CustomizeOrderModal
          product={product}
          allAddons={allAddons}
          cartItems={cartItems}
          addonsOnly={true}
          initialVariantIndex={selectedVariantIndex}
          initialQty={drinkQty}
          initialAddons={selectedAddons}
          onSaveAddons={handleSaveAddons}
          onClose={() => setIsAddonModalOpen(false)}
          onAddToCart={() => { }} // Not used in addonsOnly mode
        />
      )}
    </>
  );
};

export default POSProductCard;
