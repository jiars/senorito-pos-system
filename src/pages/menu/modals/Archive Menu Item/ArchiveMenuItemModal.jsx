import { useRef, useState } from "react";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getArchiveInlineFeedback,
  getArchiveStatusFeedback,
  getArchiveToastFeedback,
  getArchiveMenuItemErrorCode,
} from "@/utils/menu/feedback/archiveMenuItemFeedback";
import { archiveMenuItem } from "@/services/menu/menuItemsService";
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

const ArchiveMenuItemModalContent = ({ item, onClose, refetchMenu }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getArchiveInlineFeedback);
  const isAlreadyArchived = item.archived === true;
  let visibleFeedback = feedback;
  if (isAlreadyArchived) visibleFeedback = getArchiveInlineFeedback("ARCHIVE_CONFLICT");
  const prices = (item.menu_prices || []).filter((price) => !price.archived);
  const formLocked = isSubmitting || hasSaved || hasUnconfirmedSave;

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };

  // A confirmed archive retries only the read, never the DELETE.
  const refreshArchivedItem = async () => {
    try {
      if (!refetchMenu) {
        throw new Error("Menu refresh callback is missing.");
      }
      const result = await refetchMenu();
      if (result && (result.isError || result.error)) {
        throw result.error || new Error("Menu refresh failed.");
      }
    } catch (error) {
      console.error("Menu item archived, but Menu/POS refresh failed:", error);
      showFeedback("REFRESH_FAILED");
      return;
    }
    clearFeedback();
    toast.add(getArchiveToastFeedback("ITEM_ARCHIVED", { itemName: item.item_name }));
    onClose();
  };

  const handleArchive = async () => {
    if (operationInFlight.current || formLocked || !item.id || isAlreadyArchived) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();
    try {
      try {
        await archiveMenuItem(item.id);
      } catch (error) {
        const code = getArchiveMenuItemErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "ARCHIVE_CONFLICT") {
          setHasUnconfirmedSave(true);
        }
        return;
      }
      setHasSaved(true);
      await refreshArchivedItem();
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
      await refreshArchivedItem();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let statusCode = "ITEM_ARCHIVING";
  if (hasSaved) statusCode = "MENU_REFRESHING";
  if (isRefreshError) statusCode = "MENU_REFRESH_FAILED";
  const statusFeedback = getArchiveStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) {
    blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };
  }

  return (
    <>
      <Modal isOpen={!isSubmitting && !hasSaved} onClose={handleClose} maxWidth="32rem" maxHeight="min(90svh, 42rem)">
        <ModalHeader title="Archive Menu Item" description="Review the item before archiving." iconClassName="bi bi-archive" closeDisabled={isSubmitting || hasSaved} />
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
              <p>This item will be moved to <strong className="font-semibold">Menu Archive</strong> and hidden from the active menu and POS. You can restore it later.</p>
            </div>
            <InlineFeedback feedback={visibleFeedback} id="archive-menu-item-feedback" />
          </ModalContent>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting || hasSaved} className={secondaryButtonClassName}>Cancel</Button>
          <Button type="button" onClick={handleArchive} disabled={formLocked || isAlreadyArchived}
            aria-describedby={visibleFeedback ? "archive-menu-item-feedback" : undefined}
            className="min-h-[var(--app-touch-target-min)] min-w-32 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]">
            Archive Anyway
          </Button>
        </ModalFooter>
      </Modal>
      <BlockingFeedback open={isSubmitting || hasSaved} status={isRefreshError ? "error" : "loading"}
        title={statusFeedback.title} message={statusFeedback.message} action={blockingAction} />
    </>
  );
};

const ArchiveMenuItemModal = ({ isOpen, item, ...props }) => {
  if (!isOpen || !item || !item.id) return null;
  return <ArchiveMenuItemModalContent key={item.id} item={item} {...props} />;
};

export default ArchiveMenuItemModal;
