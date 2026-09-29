import { useState, useEffect } from 'react';
import { formatCurrency } from '../../../utils/currencyFormatters';
import {
  getInventoryStockStatus,
  getRecipeAvailabilityStatus,
} from '../../../utils/pos/checkoutCalculations';
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import './CustomizeOrderModal.css';
const CustomizeOrderModal = ({ product, allAddons = [], cartItems = [], onClose, onAddToCart, addonsOnly = false, initialVariantIndex = 0, initialQty = 1, initialAddons = [], onSaveAddons }) => {
  // State for selected size variant. Default to the first variant if available.
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // State for main drink quantity
  const [drinkQty, setDrinkQty] = useState(initialQty);

  // State for add-ons: [{ id, name, price, selected: boolean, qty: number }]
  const [addOns, setAddOns] = useState([]);
  useEffect(() => {
    if (product) {
      let firstAvailableIdx = 0;
      if (product.variants && product.variants.length > 0) {
        firstAvailableIdx = product.variants.findIndex(v => v.isAvailable);
        if (firstAvailableIdx === -1) firstAvailableIdx = 0;
      }
      if (initialVariantIndex !== null && initialVariantIndex !== undefined) { setSelectedVariantIndex(initialVariantIndex); } else { setSelectedVariantIndex(firstAvailableIdx); } setDrinkQty(initialQty || 1);

      // Instantly filter active addons linked to this product's category
      const validAddons = allAddons.filter(ao =>
        !ao.archived &&
        ao.addon_categories &&
        ao.addon_categories.some(ac => ac.menu_category_id === product.categoryId)
      );

      const mappedAddons = validAddons.map(ao => {
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
          selected: initialAddons.some(a => a.id === ao.id) ? true : false, qty: initialAddons.find(a => a.id === ao.id)?.qty || 1,
          recipes,
          ...availability,
        };
      });

      // Sort: Available first, then alphabetically by name
      mappedAddons.sort((a, b) => {
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        return a.name.localeCompare(b.name);
      });

      setAddOns(mappedAddons);
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
      : product.defaultVariantName || 'Reg';

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

    if (addonsOnly && onSaveAddons) {
      onSaveAddons(selectedAddOns);
      onClose();
      return;
    }

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
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="32rem"
      maxHeight="min(90svh, 48rem)"
    >
      <ModalHeader
        title="Customize Order"
        description={product.name}
        className="relative justify-center [&>div]:items-center [&_[data-slot=dialog-header]]:!text-center [&>button]:absolute [&>button]:right-[var(--app-space-6)]"
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)] max-sm:!max-h-[calc(var(--app-modal-max-height)-14.5rem)]">
        <ModalContent className="flex flex-col gap-[var(--app-gap-related)] !p-[var(--app-space-8)]">

          {/* Size Variants */}
          {!addonsOnly && product.variants && product.variants.length > 0 && (
            <div className="flex flex-col gap-[var(--app-space-4)]">
              <h3 className="text-[length:var(--app-font-size-caption)] font-bold text-[var(--app-color-text)]">Size</h3>
              <div className="flex flex-col gap-[var(--app-space-2)]">
                {product.variants.map((v, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-[auto_1fr_auto_90px_65px] items-center gap-x-[var(--app-space-4)] px-[var(--app-space-4)] py-[var(--app-space-4)] ${!v.isAvailable ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <label className="contents">
                      <div className="flex items-center justify-center cursor-pointer">
                        <input
                          type="radio"
                          name="size-variant"
                          className="size-5 rounded-full border-[var(--app-color-border)] text-[var(--app-color-brand)] focus:ring-[var(--app-color-brand)] accent-[var(--app-color-brand)]"
                          checked={selectedVariantIndex === idx}
                          disabled={!v.isAvailable}
                          onChange={() => setSelectedVariantIndex(idx)}
                        />
                      </div>
                      <span className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text)] font-medium break-words leading-tight cursor-pointer">
                        {v.name}
                      </span>
                      <div className="flex items-center cursor-pointer">
                        {v.status !== 'Available' && (
                          <span className={`text-[10px] px-[6px] py-[2px] rounded-full uppercase font-bold tracking-wider ${v.isAvailable ? 'bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]' : 'bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]'}`}>
                            {v.status}
                          </span>
                        )}
                      </div>
                    </label>

                    {/* Empty column to align with quantity */}
                    <div></div>

                    <span className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text)] font-medium text-right">
                      {formatCurrency(v.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          <div className="flex flex-col gap-[var(--app-space-4)]">
            <h3 className="text-[length:var(--app-font-size-caption)] font-bold text-[var(--app-color-text)]">Add-ons</h3>
            <div className="flex flex-col gap-[var(--app-space-2)]">
              {addOns.length === 0 ? (
                <div className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)] italic px-[var(--app-space-4)]">
                  No available add-ons for this category.
                </div>
              ) : (
                addOns.map(ao => {
                  const actionStockStatus = getAddOnActionStatus(ao);
                  const isAddOnActionBlocked = !actionStockStatus.hasEnoughStock;

                  return (
                    <div
                      key={ao.id}
                      className={`grid grid-cols-[auto_1fr_auto_90px_65px] items-center gap-x-[var(--app-space-4)] px-[var(--app-space-4)] py-[var(--app-space-1)] ${(!ao.isAvailable) ? 'opacity-50' : ''}`}
                    >
                      <label className={`contents ${(!ao.selected && isAddOnActionBlocked) ? 'pointer-events-none opacity-50' : ''}`}>
                        <div className="flex items-center justify-center cursor-pointer">
                          <Checkbox
                            checked={ao.selected}
                            disabled={!ao.isAvailable || (!ao.selected && isAddOnActionBlocked)}
                            onCheckedChange={() => handleToggleAddOn(ao.id)}
                            className="size-[18px] border-[var(--app-color-border)] bg-[var(--app-color-filter-checkbox-surface)] data-[state=checked]:border-[var(--app-color-brand)] data-[state=checked]:bg-[var(--app-color-brand)] data-[state=checked]:text-white"
                          />
                        </div>
                        <span className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text)] font-medium break-words leading-tight cursor-pointer">
                          {ao.name}
                        </span>
                        <div className="flex items-center cursor-pointer">
                          {ao.status !== 'Available' && (
                            <span className={`text-[10px] px-[6px] py-[2px] rounded-full uppercase font-bold tracking-wider ${ao.isAvailable ? 'bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]' : 'bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]'}`}>
                              {ao.status}
                            </span>
                          )}
                        </div>
                      </label>

                      <div className="flex items-center justify-center">
                        {ao.selected && (
                          <div className="flex items-center justify-center w-full gap-[var(--app-space-2)]">
                            <button
                              type="button"
                              className="relative after:absolute after:-inset-2 size-[26px] flex items-center justify-center rounded-full border border-[var(--app-color-border)] bg-[var(--app-color-surface)] text-[var(--app-color-text-subtle)] hover:text-[var(--app-color-text)] hover:bg-[var(--app-color-surface-soft)] active:scale-95 transition-all disabled:opacity-50"
                              onClick={() => handleUpdateAddOnQty(ao.id, -1)}
                            >
                              <i className="bi bi-dash text-[0.8rem]"></i>
                            </button>
                            <span className="font-bold text-[length:var(--app-font-size-body-secondary)] min-w-[1rem] text-center text-[var(--app-color-text)]">
                              {ao.qty}
                            </span>
                            <button
                              type="button"
                              className="relative after:absolute after:-inset-2 size-[26px] flex items-center justify-center rounded-full border border-[var(--app-color-border)] bg-[var(--app-color-surface)] text-[var(--app-color-text-subtle)] hover:text-[var(--app-color-text)] hover:bg-[var(--app-color-surface-soft)] active:scale-95 transition-all disabled:opacity-50"
                              onClick={() => handleUpdateAddOnQty(ao.id, 1)}
                              disabled={isAddOnActionBlocked}
                            >
                              <i className="bi bi-plus text-[0.8rem]"></i>
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text)] font-medium text-right">
                        {formatCurrency(ao.price)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </ModalContent>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} className="h-[var(--app-touch-target-min,2.75rem)] px-[var(--app-space-4)] rounded-[var(--app-radius-nested)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-semibold text-[var(--app-color-text)] bg-[var(--app-color-canvas)] border-none hover:bg-[var(--app-color-surface-hover)]">
          Cancel
        </Button>
        <Button
          onClick={handleAddToCartClick}
          disabled={!isCombinationValid}
          className="h-[var(--app-touch-target-min,2.75rem)] px-[var(--app-space-4)] rounded-[var(--app-radius-nested)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-semibold bg-[var(--app-color-brand)] text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {isCombinationValid ? 'Confirm' : 'Insufficient Stock'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CustomizeOrderModal;
