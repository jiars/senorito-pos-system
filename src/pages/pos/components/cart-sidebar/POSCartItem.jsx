import { useState } from 'react';
import { formatCurrency } from '../../../../utils/currencyFormatters';
import defaultImage from '../../../../assets/images/default_menu_picture.jpg';

const POSCartItem = ({ item, onUpdateQty, onRemoveItem, canIncreaseQuantity }) => {
  const [isAddonsExpanded, setIsAddonsExpanded] = useState(false);
  const canIncrease = canIncreaseQuantity(item.cartId);

  return (
    <div className="flex px-[var(--app-space-4)] py-[var(--app-space-2)] gap-[var(--app-gap-related)] bg-[var(--app-color-canvas)] border-b border-[var(--app-color-border-subtle)] last:border-b-0 transition-colors">

      {/* Column 1: Image */}
      <div className="w-16 h-20 shrink-0 bg-[var(--app-color-surface-soft)] rounded-md overflow-hidden self-start">
        <img
          src={item.imageURL || defaultImage}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = defaultImage; }}
        />
      </div>

      {/* Column 2: Details (Item, sizes/addon, price) */}
      <div className="flex flex-col flex-1 min-w-0 py-[var(--app-space-2)] justify-between">

        <div>
          {/* Row 1: Title */}
          <h5 className="font-semibold text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] m-0 break-words">
            {item.name}
          </h5>

          {/* Row 2: Size and Add-on toggle */}
          <div className="flex flex-wrap items-center gap-1 mt-0.5 leading-[var(--app-line-height-caption)]">
            <span className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)]">
              {item.variant || 'Regular'}
            </span>

            {item.addOns && item.addOns.length > 0 && (
              <>
                <span className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)]">|</span>
                <button
                  type="button"
                  aria-expanded={isAddonsExpanded}
                  className="text-[var(--app-color-brand)] font-medium text-[length:var(--app-font-size-caption)] flex items-center gap-0.5 hover:brightness-110"
                  onClick={() => setIsAddonsExpanded(!isAddonsExpanded)}
                >
                  Add-on <i className={`bi bi-chevron-${isAddonsExpanded ? 'up' : 'down'} text-[0.6rem] stroke-2`}></i>
                </button>
              </>
            )}
          </div>

          {/* Row 3: Add-on List */}
          {isAddonsExpanded && item.addOns && item.addOns.length > 0 && (
            <div className="flex flex-col mt-1 gap-0.5 mb-1 leading-[var(--app-line-height-caption)]">
              {item.addOns.map(ao => (
                <span key={ao.id} className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)] break-words">
                  {ao.qty}x {ao.name}
                </span>
              ))}
            </div>
          )}

          {!canIncrease && (
            <p className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-warning)] font-bold m-0 mt-1 flex items-center gap-1">
              <i className="bi bi-exclamation-triangle-fill"></i> Max stock reached
            </p>
          )}
        </div>

        {/* Row 4: Total Price */}
        <div className="font-bold text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] mt-2">
          {formatCurrency(item.price * item.qty)}
        </div>

      </div>

      {/* Column 3: Remove Button and Quantity Controls */}
      <div className="flex flex-col items-end justify-between shrink-0 mb-[var(--app-space-2)]">
        {/* Remove Button */}
        <button
          type="button"
          className="text-[var(--app-color-text-muted)] hover:text-[var(--app-color-danger)] transition-colors p-1 -mr-1"
          onClick={() => onRemoveItem(item.cartId)}
          title="Remove Item"
          aria-label="Remove item"
        >
          <i className="bi bi-x-lg text-[14px]"></i>
        </button>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            type="button"
            aria-label={`Decrease quantity of ${item.name}`}
            disabled={item.qty <= 1}
            className="w-[1.375rem] h-[1.375rem] flex items-center justify-center rounded-full border border-[var(--app-color-border)] bg-[var(--app-color-surface)] text-[var(--app-color-text-subtle)] hover:text-[var(--app-color-text)] hover:bg-[var(--app-color-surface-soft)] active:scale-95 transition-all disabled:opacity-50"
            onClick={() => onUpdateQty(item.cartId, item.qty - 1)}
          >
            <i className="bi bi-dash text-[0.6rem]"></i>
          </button>

          <span className="font-bold text-[length:var(--app-font-size-body-secondary)] min-w-[0.75rem] text-center text-[var(--app-color-text)]">
            {item.qty}
          </span>

          <button
            type="button"
            aria-label={`Increase quantity of ${item.name}`}
            className="w-[1.375rem] h-[1.375rem] flex items-center justify-center rounded-full border border-[var(--app-color-border)] bg-[var(--app-color-surface)] text-[var(--app-color-text-subtle)] hover:text-[var(--app-color-text)] hover:bg-[var(--app-color-surface-soft)] active:scale-95 transition-all disabled:opacity-50"
            onClick={() => onUpdateQty(item.cartId, item.qty + 1)}
            disabled={!canIncrease}
            title={!canIncrease ? 'Maximum available stock reached' : 'Add quantity'}
          >
            <i className="bi bi-plus text-[0.6rem]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSCartItem;
