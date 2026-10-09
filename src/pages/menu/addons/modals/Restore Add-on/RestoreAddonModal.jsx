import { useRef, useState } from "react";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getRestoreInlineFeedback,
  getRestoreStatusFeedback,
  getRestoreToastFeedback,
  getRestoreAddonErrorCode,
} from "@/utils/menu/feedback/restoreAddonFeedback";
import { unarchiveAddon } from "@/services/menu/addonsService";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modals/Modal";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import { secondaryButtonClassName } from "@/pages/menu/modals/shared/menuModalClasses";

const RestoreAddonModalContent = ({ addon, onClose, refetchAddons }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getRestoreInlineFeedback);
  const isAlreadyRestored = addon.archived !== true;
  let visibleFeedback = feedback;
  if (isAlreadyRestored) visibleFeedback = getRestoreInlineFeedback("RESTORE_CONFLICT");
  const categoryNames = (addon.addon_categories || []).filter((link) => link.menu_categories).map((link) => link.menu_categories.category_name);
  const formLocked = isSubmitting || hasSaved || hasUnconfirmedSave;

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };

  // A confirmed restore retries only the read, never the PATCH.
  const refreshRestoredAddon = async () => {
    try {
      if (!refetchAddons) {
        showFeedback("REFRESH_FAILED");
        return;
      }
      const result = await refetchAddons();
      if (result && (result.isError || result.error)) {
        showFeedback("REFRESH_FAILED");
        return;
      }
    } catch {
      showFeedback("REFRESH_FAILED");
      return;
    }
    clearFeedback();
    toast.add(getRestoreToastFeedback("ADDON_RESTORED", { addonName: addon.addon_name }));
    onClose();
  };

  const handleRestore = async () => {
    if (operationInFlight.current || formLocked || !addon.id || isAlreadyRestored) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();
    try {
      try {
        await unarchiveAddon(addon.id);
      } catch (error) {
        const code = getRestoreAddonErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "RESTORE_CONFLICT") {
          setHasUnconfirmedSave(true);
        }
        return;
      }
      setHasSaved(true);
      await refreshRestoredAddon();
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
      await refreshRestoredAddon();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let statusCode = "ADDON_RESTORING";
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
        <ModalHeader title="Restore Add-on" description="Review the add-on before restoring." iconClassName="bi bi-archive" closeDisabled={isSubmitting || hasSaved} />
        <ModalBody>
          <ModalContent className="gap-[var(--app-gap-related)] max-sm:!p-[var(--app-space-4)]">
            <p className="min-w-0 break-words border-b border-[var(--app-color-border-subtle)] pb-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
              {addon.addon_name}
            </p>
            <dl className="grid min-w-0 grid-cols-2 gap-[var(--app-gap-related)] px-[var(--app-space-4)] max-sm:gap-[var(--app-space-2)] max-sm:px-[var(--app-space-2)]">
              <div className="min-w-0 rounded-[var(--app-radius-nested)] bg-[var(--app-color-canvas)] p-[var(--app-space-4)]">
                <dt className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">Applicable Categories</dt>
                <dd className="mt-[var(--app-space-1)] break-words text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)]">
                  {categoryNames.length > 0 ? (
                    <ul className="flex min-w-0 flex-col gap-[var(--app-space-2)]">
                      {categoryNames.map((name, index) => (
                        <li key={index} className="min-w-0 break-words px-[var(--app-space-2)] py-[var(--app-space-1)]">
                          {name}
                        </li>
                      ))}
                    </ul>
                  ) : "N/A"}
                </dd>
              </div>
              <div className="min-w-0 rounded-[var(--app-radius-nested)] bg-[var(--app-color-canvas)] p-[var(--app-space-4)]">
                <dt className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">Selling Price</dt>
                <dd className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]">
                  <strong className="break-words font-semibold tabular-nums [overflow-wrap:anywhere]">{formatCurrency(addon.selling_price)}</strong>
                </dd>
              </div>
            </dl>
            <div role="note" className="flex items-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
              <i className="bi bi-info-circle shrink-0 text-[var(--app-color-info)]" aria-hidden="true" />
              <p>This add-on will return to your add-on list but remain <strong className="font-semibold">Unavailable</strong> in POS until you review it and enable Available for sale.</p>
            </div>
            <InlineFeedback feedback={visibleFeedback} id="restore-addon-feedback" />
          </ModalContent>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting || hasSaved} className={secondaryButtonClassName}>Cancel</Button>
          <Button type="button" onClick={handleRestore} disabled={formLocked || isAlreadyRestored}
            aria-describedby={visibleFeedback ? "restore-addon-feedback" : undefined}
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

const RestoreAddonModal = ({ isOpen, addon, ...props }) => {
  if (!isOpen || !addon || !addon.id) return null;
  return <RestoreAddonModalContent key={addon.id} addon={addon} {...props} />;
};

export default RestoreAddonModal;
