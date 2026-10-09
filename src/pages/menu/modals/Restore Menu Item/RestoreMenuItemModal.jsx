import { useRef, useState } from "react";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getRestoreInlineFeedback,
  getRestoreStatusFeedback,
  getRestoreToastFeedback,
  getRestoreMenuItemErrorCode,
} from "@/utils/menu/feedback/restoreMenuItemFeedback";
import { unarchiveMenuItem } from "@/services/menu/menuItemsService";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Modal from "@/components/modals/Modal";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import { secondaryButtonClassName } from "../shared/menuModalClasses";

const RestoreMenuItemModalContent = ({ item, onClose, refetchMenu }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getRestoreInlineFeedback);
  const isAlreadyRestored = item.archived !== true;
  let visibleFeedback = feedback;
  if (isAlreadyRestored) visibleFeedback = getRestoreInlineFeedback("RESTORE_CONFLICT");
  const prices = (item.menu_prices || []).filter((price) => !price.archived);
  const formLocked = isSubmitting || hasSaved || hasUnconfirmedSave;

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };

  // A confirmed restore retries only the read, never the PATCH.
  const refreshRestoredItem = async () => {
    try {
      if (!refetchMenu) {
        showFeedback("REFRESH_FAILED");
        return;
      }
      const result = await refetchMenu();
      if (result && (result.isError || result.error)) {
        showFeedback("REFRESH_FAILED");
        return;
      }
    } catch {
      showFeedback("REFRESH_FAILED");
      return;
    }
    clearFeedback();
    toast.add(getRestoreToastFeedback("ITEM_RESTORED", { itemName: item.item_name }));
    onClose();
  };

  const handleRestore = async () => {
    if (operationInFlight.current || formLocked || !item.id || isAlreadyRestored) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();
    try {
      try {
        await unarchiveMenuItem(item.id);
      } catch (error) {
        const code = getRestoreMenuItemErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "RESTORE_CONFLICT") {
          setHasUnconfirmedSave(true);
        }
        return;
      }
      setHasSaved(true);
      await refreshRestoredItem();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !hasSaved) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    try {
      await refreshRestoredItem();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let statusCode = "ITEM_RESTORING";
  if (hasSaved) statusCode = "MENU_REFRESHING";
  if (isRefreshError) statusCode = "MENU_REFRESH_FAILED";
  const statusFeedback = getRestoreStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) {
    blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };
  }

  return (
    <>
      <Modal isOpen={!isSubmitting && !hasSaved} onClose={handleClose} maxWidth="32rem" maxHeight="min(90svh, 42rem)">
        <ModalHeader title="Restore Menu Item" description="Review the item before restoring." iconClassName="bi bi-archive" closeDisabled={isSubmitting || hasSaved} />
        <ModalBody>
          <ModalContent className="gap-[var(--app-gap-related)] max-sm:!p-[var(--app-space-4)]">
            <p className="min-w-0 break-words border-b border-[var(--app-color-border-subtle)] pb-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
              {item.item_name}
            </p>
            <dl className="grid min-w-0 grid-cols-2 gap-[var(--app-gap-related)] px-[var(--app-space-4)] max-sm:gap-[var(--app-space-2)] max-sm:px-[var(--app-space-2)]">
              <div className="min-w-0 rounded-[var(--app-radius-nested)] bg-[var(--app-color-canvas)] p-[var(--app-space-4)]">
                <dt className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">Category</dt>
                <dd className="mt-[var(--app-space-1)] break-words text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)]">
                  {item.menu_categories ? item.menu_categories.category_name : "N/A"}
                </dd>
              </div>
              <div className="min-w-0 rounded-[var(--app-radius-nested)] bg-[var(--app-color-canvas)] p-[var(--app-space-4)]">
                <dt className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">Selling Price</dt>
                <dd className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]">
                  <ScrollArea viewportClassName="max-h-[min(22svh,10rem)]" aria-label="Active variant prices">
                    {prices.length === 0 && <span>N/A</span>}
                    {prices.map((price) => (
                      <div key={price.id} className="min-w-0 break-words px-[var(--app-space-2)] py-[var(--app-space-1)] [overflow-wrap:anywhere]">
                        {prices.length > 1 && <span className="text-[var(--app-color-text-muted)]">{price.variant_name}: </span>}
                        <strong className="font-semibold tabular-nums">{formatCurrency(price.selling_price)}</strong>
                      </div>
                    ))}
                  </ScrollArea>
                </dd>
              </div>
            </dl>
            <div role="note" className="flex items-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
              <i className="bi bi-info-circle shrink-0 text-[var(--app-color-info)]" aria-hidden="true" />
              <p>This item will return to the active menu but remain <strong className="font-semibold">Unavailable</strong> in POS until you review it and enable Available for sale.</p>
            </div>
            <InlineFeedback feedback={visibleFeedback} id="restore-menu-item-feedback" />
          </ModalContent>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting || hasSaved} className={secondaryButtonClassName}>Cancel</Button>
          <Button type="button" onClick={handleRestore} disabled={formLocked || isAlreadyRestored}
            aria-describedby={visibleFeedback ? "restore-menu-item-feedback" : undefined}
            className="min-h-[var(--app-touch-target-min)] min-w-32 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]">
            Restore
          </Button>
        </ModalFooter>
      </Modal>
      <BlockingFeedback open={isSubmitting || hasSaved} status={isRefreshError ? "error" : "loading"}
        title={statusFeedback.title} message={statusFeedback.message} action={blockingAction} />
    </>
  );
};

const RestoreMenuItemModal = ({ isOpen, item, ...props }) => {
  if (!isOpen || !item || !item.id) return null;
  return <RestoreMenuItemModalContent key={item.id} item={item} {...props} />;
};

export default RestoreMenuItemModal;
