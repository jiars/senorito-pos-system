import { useId, useState } from "react";
import defaultImage from "../../../../assets/images/default_menu_picture.jpg";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { toast } from "@/components/ui/toast";
import {
  getPOSUnavailableMessage,
  getPOSSelectionValidationCode,
} from "@/utils/pos/feedback/posFeedback";
import { usePOSFeedback } from "@/hooks/feedback/usePOSFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { validateProductSelection } from "@/utils/pos/validation/productSelectionValidation";
import CustomizeOrderModal from "../modals/CustomizeOrderModal";
import {
  getPOSProductVariants,
  getPOSUnitPrice,
} from "@/utils/pos/posSelectionUtils";

const POSProductCard = ({ product, onAdd, allAddons, cartItems = [], isOrderLocked = false }) => {
  // Local state for the card
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [drinkQty, setDrinkQty] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const sizeHintId = useId();

  const variants = getPOSProductVariants(product);
  const selectedVariant = variants[selectedVariantIndex];
  const validation = validateSelection(selectedVariant, drinkQty);
  const canAddToOrder = !validation.errors.variant;
  const { feedback: activeFeedback, showFeedback, clearFeedback } =
    usePOSFeedback(validation.errorCodes.quantity || null);
  const feedback = product.isAvailable ? activeFeedback : null;

  function validateSelection(variant, quantity, isIncreasingQuantity = false) {
    return validateProductSelection({
      product,
      selectedVariant: variant,
      quantity,
      addons: selectedAddons,
      cartItems,
      isIncreasingQuantity,
    });
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Out of Stock":
        return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)] border-[var(--app-color-danger-border)]";
      case "On Hold":
        return "bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)] border-[var(--app-color-warning)]/30";
      case "Not Available":
      case "Unavailable":
      default:
        return "bg-[var(--app-color-surface-soft)] text-[var(--app-color-text-muted)] border-[var(--app-color-border)]";
    }
  };

  // Calculate price dynamically
  const basePrice = selectedVariant ? selectedVariant.price : product.basePrice;

  const handleVariantClick = (idx) => {
    if (isOrderLocked) return;
    if (variants[idx].isAvailable) {
      const nextIndex = selectedVariantIndex === idx ? null : idx;
      setSelectedVariantIndex(nextIndex);
      const nextValidation = validateSelection(variants[nextIndex], drinkQty);
      showFeedback(nextValidation.errorCodes.quantity || null);
    }
  };

  const handleAddQty = () => {
    if (isOrderLocked) return;
    const nextValidation = validateSelection(selectedVariant, drinkQty + 1, true);
    if (!nextValidation.isFormValid) {
      showFeedback(getPOSSelectionValidationCode(nextValidation));
      return;
    }
    setDrinkQty(drinkQty + 1);
    clearFeedback();
  };
  const handleSubQty = () => {
    if (isOrderLocked) return;
    const quantity = Math.max(1, drinkQty - 1);
    setDrinkQty(quantity);
    const nextValidation = validateSelection(selectedVariant, quantity);
    showFeedback(nextValidation.errorCodes.quantity || null);
  };

  const handleUnavailableClick = () => {
    const status = product.status || "Not Available";
    const description = getPOSUnavailableMessage(status);

    const isDisabledForSale = status === "Unavailable" || status === "Not Available";
    toast.add({
      id: `pos-unavailable-${product.id}`,
      type: isDisabledForSale ? "info" : "warning",
      title: `${product.name} — ${status}`,
      description,
    });
  };

  const handleAddToOrder = () => {
    if (isOrderLocked) return;
    if (!validation.isFormValid) {
      showFeedback(getPOSSelectionValidationCode(validation));
      return;
    }

    const variantName = selectedVariant.name || "Reg";
    const variantId = selectedVariant.id || product.defaultPriceId;

    const wasAdded = onAdd({
      ...product,
      selectedVariant: variantName,
      selectedVariantId: variantId,
      drinkQty,
      selectedAddOns: selectedAddons,
      basePrice,
      totalPrice: getPOSUnitPrice(basePrice, selectedAddons),
    });

    if (!wasAdded) return;

    // Reset state only after the page accepts the item.
    setSelectedVariantIndex(null);
    setDrinkQty(1);
    setSelectedAddons([]);
    clearFeedback();
  };

  return (
    <>
      <div
        className={`relative bg-[var(--app-color-surface)] rounded-2xl border border-[var(--app-color-border-subtle)] p-[var(--app-gap-related)] flex gap-[var(--app-gap-related)] h-full transition-all duration-200 ${product.isAvailable ? "hover:shadow-[var(--app-shadow-card)] hover:-translate-y-[2px]" : "cursor-not-allowed opacity-70 grayscale-[30%]"}`}
      >
        {/* Left Column */}
        <div className="flex flex-col justify-between gap-[var(--app-gap-related)] w-[80px] sm:w-[90px] min-[1440px]:w-[100px] shrink-0">
          <div className="w-full aspect-square bg-[var(--app-color-surface-soft)] overflow-hidden rounded-xl">
            <img
              src={product.imageURL || defaultImage}
              alt={product.name}
              className="w-full h-full object-cover block"
              onError={(e) => {
                e.target.src = defaultImage;
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full mb-[var(--app-space-2)]">
            <button
              type="button"
              aria-label={`Decrease quantity of ${product.name}`}
              aria-describedby={feedback ? sizeHintId : undefined}
              className={`relative after:absolute after:-inset-[11px] w-[1.375rem] h-[1.375rem] rounded-full border flex items-center justify-center text-[0.6rem] transition-colors ${drinkQty > 1 ? "border-[var(--app-color-text-subtle)] text-[var(--app-color-text-subtle)] hover:text-[var(--app-color-text)]" : "border-[var(--app-color-border-subtle)] text-[var(--app-color-text-muted)] cursor-not-allowed opacity-50"}`}
              onClick={handleSubQty}
              disabled={drinkQty <= 1 || !product.isAvailable || isOrderLocked}
            >
              <i className="bi bi-dash"></i>
            </button>
            <span className="text-[length:var(--app-font-size-body-secondary)] font-bold text-[var(--app-color-text)]">
              {drinkQty}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity of ${product.name}`}
              aria-describedby={feedback ? sizeHintId : undefined}
              className="relative after:absolute after:-inset-[11px] w-[1.375rem] h-[1.375rem] rounded-full border bg-[var(--app-color-brand)] border-[var(--app-color-brand)] text-white flex items-center justify-center text-[0.6rem] transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddQty}
              disabled={!product.isAvailable || isOrderLocked}
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
            <span className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-muted)] shrink-0">
              Size
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {variants.map((v, idx) => (
                <button
                  key={v.id || idx}
                  type="button"
                  aria-pressed={selectedVariantIndex === idx}
                  aria-describedby={feedback ? sizeHintId : undefined}
                  className={`px-2.5 py-0.5 rounded-full text-[length:var(--app-font-size-caption)] transition-all ${
                    selectedVariantIndex === idx
                      ? "bg-[var(--app-color-brand)] text-white border-[var(--app-color-brand)] shadow-sm"
                      : "bg-transparent border border-[var(--app-color-border)] text-[var(--app-color-text-subtle)] hover:bg-[var(--app-color-surface-soft)]"
                  } ${!v.isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => handleVariantClick(idx)}
                  disabled={!v.isAvailable || isOrderLocked}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
          <InlineFeedback
            id={sizeHintId}
            feedback={feedback}
            className="mb-[var(--app-space-2)]"
          />

          {/* Row 3: Add-ons */}
          <button
            type="button"
            disabled={!product.isAvailable || isOrderLocked}
            aria-label={`Customize add-ons for ${product.name}`}
            className={`flex flex-wrap justify-between items-center mt-1 mb-auto text-[var(--app-color-brand)] text-[length:var(--app-font-size-body-secondary)] transition-colors ${product.isAvailable ? "cursor-pointer hover:brightness-110" : "cursor-not-allowed opacity-50"}`}
            onClick={() => {
              if (product.isAvailable && !isOrderLocked) setIsAddonModalOpen(true);
            }}
          >
            <span>
              Add-On{" "}
              {selectedAddons.length > 0 ? `(${selectedAddons.length})` : ""}
            </span>
            <i className="bi bi-chevron-right"></i>
          </button>

          {/* Row 4: Add to Order Button */}
          <button
            type="button"
            aria-describedby={feedback ? sizeHintId : undefined}
            className={`w-full mt-3 min-h-[var(--app-control-height-compact)] px-[var(--app-space-2)] rounded-full text-[length:var(--app-font-size-body-secondary)] font-semibold transition-all border disabled:cursor-not-allowed disabled:opacity-50 ${
              canAddToOrder
                ? "bg-[var(--app-color-brand)] text-white border-[var(--app-color-brand)] shadow-sm hover:brightness-110 active:scale-[0.98]"
                : "bg-transparent text-[var(--app-color-brand)] border-[var(--app-color-brand)] hover:bg-[var(--app-color-surface-soft)]"
            }`}
            onClick={handleAddToOrder}
            disabled={!product.isAvailable || isOrderLocked}
          >
            Add to order
          </button>
        </div>

        {/* Unavailable Overlay */}
        {!product.isAvailable && (
          <button
            type="button"
            onClick={handleUnavailableClick}
            aria-label={`${product.name}: ${product.status || "Not Available"}. Show reason.`}
            className="absolute inset-0 z-10 cursor-pointer rounded-2xl bg-white/40 backdrop-blur-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]"
          >
            <span className="absolute top-3 right-3 bg-[var(--app-color-surface)] rounded-full shadow-sm">
              <span
                className={`h-[var(--app-touch-target-min)] px-4 rounded-full border flex items-center justify-center font-semibold text-[length:var(--app-font-size-body-secondary)] capitalize ${getStatusColor(product.status || "Not Available")}`}
              >
                {product.status || "Not Available"}
              </span>
            </span>
          </button>
        )}
      </div>

      {isAddonModalOpen && (
        <CustomizeOrderModal
          product={product}
          allAddons={allAddons}
          cartItems={cartItems}
          initialVariantIndex={selectedVariantIndex}
          initialQty={drinkQty}
          initialAddons={selectedAddons}
          onSaveAddons={(addons) => {
            setSelectedAddons(addons);
            clearFeedback();
          }}
          onClose={() => setIsAddonModalOpen(false)}
        />
      )}
    </>
  );
};

export default POSProductCard;
