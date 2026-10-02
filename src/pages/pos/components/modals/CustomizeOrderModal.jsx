import { useState } from "react";
import { formatCurrency } from "@/utils/currencyFormatters";
import { getInventoryStockStatus } from "@/utils/pos/checkoutCalculations";
import {
  getPOSProductVariants,
  getPOSAddonOptions,
  getPOSSelectedAddons,
  buildPOSStockPreview,
} from "@/utils/pos/posSelectionUtils";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const CustomizeOrderModal = ({
  product,
  allAddons = [],
  cartItems = [],
  onClose,
  initialVariantIndex,
  initialQty = 1,
  initialAddons = [],
  onSaveAddons,
}) => {
  const [selection, setSelection] = useState(initialAddons);
  const variants = getPOSProductVariants(product);
  let variant = variants[initialVariantIndex];
  if (!variant) {
    variant = variants.find((item) => item.isAvailable) || variants[0];
  }

  const addonOptions = getPOSAddonOptions(product, allAddons, cartItems, selection);

  const getStockStatusForSelection = (options) => {
    const selectedAddons = getPOSSelectedAddons(options);
    const preview = buildPOSStockPreview(product, variant.id, initialQty, selectedAddons);
    return getInventoryStockStatus([...cartItems, preview]);
  };

  const handleToggleAddOn = (id) => {
    const addon = addonOptions.find((item) => item.id === id);
    const updated = addonOptions.map((item) => {
      if (item.id === id) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });

    if (!addon.selected && !getStockStatusForSelection(updated).hasEnoughStock) return;
    setSelection(getPOSSelectedAddons(updated));
  };

  const handleUpdateAddOnQty = (id, delta) => {
    const updated = addonOptions.map((addon) => {
      if (addon.id === id) {
        return { ...addon, qty: Math.max(1, addon.qty + delta) };
      }
      return addon;
    });

    if (delta > 0 && !getStockStatusForSelection(updated).hasEnoughStock) return;
    setSelection(getPOSSelectedAddons(updated));
  };

  const getAddOnActionStatus = (addon) => {
    const updated = addonOptions.map((item) => {
      if (item.id !== addon.id) return item;
      if (item.selected) {
        return { ...item, qty: item.qty + 1 };
      }
      return { ...item, selected: true };
    });
    return getStockStatusForSelection(updated);
  };

  const isCombinationValid = getStockStatusForSelection(addonOptions).hasEnoughStock;

  const handleConfirm = () => {
    if (!isCombinationValid) return;
    onSaveAddons(getPOSSelectedAddons(addonOptions));
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="32rem"
      className="!z-[10003]"
      overlayClassName="!z-[10002]"
      maxHeight="min(90svh, 48rem)"
    >
      <ModalHeader
        title="Customize Order"
        description={product.name}
        className="relative justify-center [&>div]:items-center [&_[data-slot=dialog-header]]:!text-center [&>button]:absolute [&>button]:right-[var(--app-space-6)]"
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)] max-sm:!max-h-[calc(var(--app-modal-max-height)-14.5rem)]">
        <ModalContent className="max-sm:!p-[var(--app-space-4)]">

          {/* Add-ons */}
          <div className="flex flex-col gap-[var(--app-space-4)]">
            <h3 className="text-[length:var(--app-font-size-caption)] font-bold text-[var(--app-color-text)]">Add-ons</h3>
            <div className="flex flex-col gap-[var(--app-space-2)]">
              {addonOptions.length === 0 ? (
                <div className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-subtle)] italic px-[var(--app-space-4)]">
                  No available add-ons for this category.
                </div>
              ) : (
                addonOptions.map(ao => {
                  const actionStockStatus = getAddOnActionStatus(ao);
                  const isAddOnActionBlocked = !actionStockStatus.hasEnoughStock;

                  return (
                    <div
                      key={ao.id}
                      className={`grid grid-cols-[auto_minmax(0,1fr)_auto_90px_65px] items-center gap-x-[var(--app-space-4)] px-[var(--app-space-4)] py-[var(--app-space-1)] max-sm:grid-cols-[auto_minmax(0,1fr)_auto] max-sm:gap-[var(--app-space-2)] max-sm:px-0 ${(!ao.isAvailable) ? 'opacity-50' : ''}`}
                    >
                      <label className={`contents ${(!ao.selected && isAddOnActionBlocked) ? 'pointer-events-none opacity-50' : ''}`}>
                        <div className="flex items-center justify-center cursor-pointer max-sm:col-start-1 max-sm:row-start-1">
                          <Checkbox
                            aria-label={`Add ${ao.name}`}
                            checked={ao.selected}
                            disabled={!ao.isAvailable || (!ao.selected && isAddOnActionBlocked)}
                            onCheckedChange={() => handleToggleAddOn(ao.id)}
                            className="size-[18px] border-[var(--app-color-border)] bg-[var(--app-color-filter-checkbox-surface)] data-[state=checked]:border-[var(--app-color-brand)] data-[state=checked]:bg-[var(--app-color-brand)] data-[state=checked]:text-white"
                          />
                        </div>
                        <span className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text)] font-medium break-words leading-[var(--app-line-height-body-secondary)] cursor-pointer max-sm:col-start-2 max-sm:row-start-1">
                          {ao.name}
                        </span>
                        <div className="flex items-center cursor-pointer max-sm:col-start-2 max-sm:col-span-2 max-sm:row-start-2">
                          {ao.status !== 'Available' && (
                            <span className={`text-[10px] px-[6px] py-[2px] rounded-full uppercase font-bold tracking-wider ${ao.isAvailable ? 'bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]' : 'bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]'}`}>
                              {ao.status}
                            </span>
                          )}
                        </div>
                      </label>

                      <div className="flex items-center justify-center max-sm:col-start-2 max-sm:col-span-2 max-sm:row-start-3 max-sm:justify-start">
                        {ao.selected && (
                          <div className="flex items-center justify-center w-full gap-[var(--app-space-2)] max-sm:w-auto">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${ao.name}`}
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
                              aria-label={`Increase quantity of ${ao.name}`}
                              onClick={() => handleUpdateAddOnQty(ao.id, 1)}
                              disabled={isAddOnActionBlocked}
                            >
                              <i className="bi bi-plus text-[0.8rem]"></i>
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text)] font-medium text-right max-sm:col-start-3 max-sm:row-start-1">
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
        <Button variant="outline" onClick={onClose} className="h-[var(--app-touch-target-min)] px-[var(--app-space-4)] rounded-[var(--app-radius-nested)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-semibold text-[var(--app-color-text)] bg-[var(--app-color-canvas)] border-none hover:bg-[var(--app-color-control-hover)]">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
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
