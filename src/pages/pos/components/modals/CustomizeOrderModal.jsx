import { useId, useState } from "react";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { usePOSFeedback } from "@/hooks/feedback/usePOSFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import {
  getPOSProductVariants,
  getPOSAddonOptions,
  getPOSSelectedAddons,
  getPOSSelectionStockStatus,
  isPOSAddonSelectable,
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
  const feedbackId = useId();
  const variants = getPOSProductVariants(product);
  let variant = variants[initialVariantIndex];
  if (!variant) {
    variant = variants.find((item) => item.isAvailable) || variants[0];
  }

  const addonOptions = getPOSAddonOptions(product, allAddons, cartItems, selection);
  const stockStatus = getStockStatusForSelection(addonOptions);
  const hasUnavailableAddons = addonOptions.some(
    (addon) => addon.selected && !isPOSAddonSelectable(addon),
  ) || selection.some((addon) => !addonOptions.some((option) => option.id === addon.id));
  const persistentCode = !variant?.isAvailable ? "VARIANT_UNAVAILABLE"
    : hasUnavailableAddons ? "ADDON_UNAVAILABLE"
      : !stockStatus.hasEnoughStock ? "ADDON_STOCK_INSUFFICIENT" : null;
  const { feedback, showFeedback } =
    usePOSFeedback(persistentCode);

  function getStockStatusForSelection(options) {
    const selectedAddons = getPOSSelectedAddons(options);
    return getPOSSelectionStockStatus(product, variant?.id, initialQty, selectedAddons, cartItems);
  }

  const updateSelection = (options) => {
    setSelection(getPOSSelectedAddons(options));
    showFeedback(getStockStatusForSelection(options).hasEnoughStock
      ? null : "ADDON_STOCK_INSUFFICIENT");
  };

  const handleToggleAddOn = (id) => {
    const addon = addonOptions.find((item) => item.id === id);
    if (!addon || (!addon.selected && !isPOSAddonSelectable(addon))) return;
    const updated = addonOptions.map((item) => {
      if (item.id === id) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });

    updateSelection(updated);
  };

  const handleUpdateAddOnQty = (id, delta) => {
    const updated = addonOptions.map((addon) => {
      if (addon.id === id) {
        return { ...addon, qty: Math.max(1, addon.qty + delta) };
      }
      return addon;
    });

    if (delta > 0 && !getStockStatusForSelection(updated).hasEnoughStock) {
      showFeedback("STOCK_LIMIT_REACHED");
      return;
    }
    updateSelection(updated);
  };

  const handleConfirm = () => {
    if (!variant?.isAvailable) {
      showFeedback("VARIANT_UNAVAILABLE");
      return;
    }
    if (hasUnavailableAddons) {
      showFeedback("ADDON_UNAVAILABLE");
      return;
    }
    if (!stockStatus.hasEnoughStock) {
      showFeedback("ADDON_STOCK_INSUFFICIENT");
      return;
    }
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
                  const isSelectable = isPOSAddonSelectable(ao);

                  return (
                    <div
                      key={ao.id}
                      className={`grid grid-cols-[auto_minmax(0,1fr)_auto_90px_65px] items-center gap-x-[var(--app-space-4)] px-[var(--app-space-4)] py-[var(--app-space-1)] max-sm:grid-cols-[auto_minmax(0,1fr)_auto] max-sm:gap-[var(--app-space-2)] max-sm:px-0 ${!isSelectable ? 'opacity-50' : ''}`}
                    >
                      <label className="contents">
                        <div className="flex items-center justify-center cursor-pointer max-sm:col-start-1 max-sm:row-start-1">
                          <Checkbox
                            aria-label={`Add ${ao.name}`}
                            checked={ao.selected}
                            disabled={!ao.selected && !isSelectable}
                            aria-describedby={feedback ? feedbackId : undefined}
                            onCheckedChange={() => handleToggleAddOn(ao.id)}
                            className="size-[18px] border-[var(--app-color-border)] bg-[var(--app-color-filter-checkbox-surface)] data-[state=checked]:border-[var(--app-color-brand)] data-[state=checked]:bg-[var(--app-color-brand)] data-[state=checked]:text-white"
                          />
                        </div>
                        <span className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text)] font-medium break-words leading-[var(--app-line-height-body-secondary)] cursor-pointer max-sm:col-start-2 max-sm:row-start-1">
                          {ao.name}
                        </span>
                        <div className="flex items-center cursor-pointer max-sm:col-start-2 max-sm:col-span-2 max-sm:row-start-2">
                          {ao.status !== 'Available' && (
                            <span className={`text-[10px] px-[6px] py-[2px] rounded-full uppercase font-bold tracking-wider ${isSelectable ? 'bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]' : 'bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]'}`}>
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
                              disabled={ao.qty <= 1}
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
                              disabled={!isSelectable}
                              aria-describedby={feedback ? feedbackId : undefined}
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

      <ModalFooter className="flex-wrap">
        <InlineFeedback
          id={feedbackId}
          feedback={feedback}
          className="w-full basis-full max-sm:basis-auto max-sm:order-last"
        />
        <Button variant="outline" onClick={onClose} className="h-[var(--app-touch-target-min)] px-[var(--app-space-4)] rounded-[var(--app-radius-nested)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-semibold text-[var(--app-color-text)] bg-[var(--app-color-canvas)] border-none hover:bg-[var(--app-color-control-hover)]">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          aria-describedby={feedback ? feedbackId : undefined}
          className="h-[var(--app-touch-target-min,2.75rem)] px-[var(--app-space-4)] rounded-[var(--app-radius-nested)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-semibold bg-[var(--app-color-brand)] text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          Confirm
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CustomizeOrderModal;
