import { useEffect, useRef, useState } from "react";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { getInventorySaveErrorCode } from "@/utils/inventory/inventoryFeedback";
import { getArchiveInlineFeedback, getArchiveStatusFeedback, getArchiveToastFeedback } from "@/utils/inventory/feedback/archiveFeedback";
import { toast } from "@/components/ui/toast";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { archiveInventoryItem, fetchAffectedMenuItems } from "@/services/inventory/inventoryItemsService";

const ArchiveItemModalContent = ({
  onClose, item, refetchInventory, refreshMenuManagement, refreshPosManagement,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getArchiveInlineFeedback);
  const [records, setRecords] = useState({ menuItems: [], addons: [] });
  const [affectedStatus, setAffectedStatus] = useState("loading");
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const operationInFlight = useRef(false);

  useEffect(() => {
    let isCurrent = true;
    setAffectedStatus("loading");
    const loadAffectedRecords = async () => {
      try {
        const data = await fetchAffectedMenuItems(item.id);
        // The current endpoint returns these two name arrays.
        if (!data || !Array.isArray(data.menuItems) || !Array.isArray(data.addons)) {
          throw new Error("Invalid affected-record response.");
        }
        if (isCurrent) {
          setRecords(data);
          setAffectedStatus("ready");
        }
      } catch (error) {
        console.error("Failed to load affected records:", error.message);
        if (isCurrent) setAffectedStatus("error");
      }
    };
    loadAffectedRecords();
    return () => { isCurrent = false; };
  }, [item.id, lookupAttempt]);

  const totalAffected = records.menuItems.length + records.addons.length;
  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };

  // After a confirmed archive, retry only these reads, never the DELETE.
  const refreshArchivedItem = async () => {
    try {
      const refreshTasks = [];
      if (refetchInventory) refreshTasks.push(refetchInventory());
      if (refreshMenuManagement) refreshTasks.push(refreshMenuManagement());
      if (refreshPosManagement) refreshTasks.push(refreshPosManagement());
      const results = await Promise.allSettled(refreshTasks);
      const refreshFailed = results.some((result) => {
        if (result.status === "rejected") return true;
        return Boolean(result.value && (result.value.isError || result.value.error));
      });
      if (refreshFailed) {
        showFeedback("REFRESH_FAILED");
        return;
      }
    } catch {
      showFeedback("REFRESH_FAILED");
      return;
    }
    clearFeedback();
    toast.add(getArchiveToastFeedback("ITEM_ARCHIVED", { itemName: item.item_name }));
    onClose();
  };

  const handleArchive = async () => {
    if (operationInFlight.current || hasSaved || hasUnconfirmedSave || affectedStatus !== "ready") return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();
    try {
      try {
        await archiveInventoryItem(item.id);
      } catch (error) {
        let code = getInventorySaveErrorCode(error);
        if (error.response && error.response.status === 409) code = "ARCHIVE_CONFLICT";
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "ARCHIVE_CONFLICT") setHasUnconfirmedSave(true);
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
  let blockingCode = "ITEM_ARCHIVING";
  if (hasSaved) blockingCode = "INVENTORY_REFRESHING";
  if (isRefreshError) blockingCode = "INVENTORY_REFRESH_FAILED";
  const blockingFeedback = getArchiveStatusFeedback(blockingCode);
  let blockingAction;
  if (isRefreshError) blockingAction = { label: blockingFeedback.buttonLabel, onClick: handleRetryRefresh };

  return (
    <>
    <Modal isOpen={!isSubmitting && !hasSaved} onClose={handleClose} maxWidth="32rem" maxHeight="min(90svh, 42rem)">
      <ModalHeader
        title="Archive Inventory Item"
        description="Review affected records before archiving."
        iconClassName="bi bi-archive"
        closeDisabled={isSubmitting || hasSaved}
      />
      <ModalBody>
        <ModalContent className="gap-[var(--app-gap-related)]">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-[var(--app-space-2)] border-b border-[var(--app-color-border-subtle)] pb-[var(--app-space-4)]">
            <p className="min-w-0 break-words text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
              {item.item_name}
            </p>
            <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
              Stock: <strong className="font-semibold">{item.current_stock} {item.base_unit}</strong>
            </p>
          </div>
          {affectedStatus === "loading" && (
            <section aria-label="Checking affected records" aria-busy="true" className="flex flex-col gap-[var(--app-space-2)]">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </section>
          )}
          {affectedStatus === "error" && (
            <section className="flex flex-col gap-[var(--app-space-2)]">
              <InlineFeedback feedback={getArchiveInlineFeedback("AFFECTED_LOAD_FAILED")} />
              <Button type="button" variant="outline" className="min-h-[var(--app-touch-target-min)] self-start text-[length:var(--app-font-size-body-secondary)]"
                onClick={() => {
                  if (operationInFlight.current || affectedStatus !== "error") return;
                  setAffectedStatus("loading");
                  setLookupAttempt((attempt) => attempt + 1);
                }}>
                Retry
              </Button>
            </section>
          )}
          {affectedStatus === "ready" && (
            <section aria-label="Affected records" className="grid min-w-0 grid-cols-2 gap-[var(--app-gap-related)] px-[var(--app-space-4)]">
              {[
                { title: "Menu Items", names: records.menuItems },
                { title: "Add-ons", names: records.addons },
              ].map((group) => (
                <section key={group.title} aria-label={group.title} className="flex min-w-0 flex-col gap-[var(--app-space-2)]">
                  <h3 className="text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
                    {group.title} <span className="font-normal text-[var(--app-color-text-subtle)]">({group.names.length})</span>
                  </h3>
                  {group.names.length > 0 ? (
                    <ScrollArea className="min-h-0 min-w-0" viewportClassName="max-h-[min(22svh,10rem)]" aria-label={`${group.title} list`}>
                    <ul className="divide-y divide-[var(--app-color-border-subtle)] pr-[var(--app-space-2)]">
                      {group.names.map((name, index) => (
                        <li key={index} className="break-words py-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">
                          {name}
                        </li>
                      ))}
                    </ul>
                    </ScrollArea>
                  ) : (
                    <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">None use this item.</p>
                  )}
                </section>
              ))}
            </section>
          )}
          {affectedStatus === "ready" && totalAffected > 0 && (
            <div role="note" className="flex items-start gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
              <i className="bi bi-info-circle shrink-0 text-[var(--app-color-info)]" aria-hidden="true" />
              <p>Recipes using this item may be placed <strong className="font-semibold">On Hold</strong>. Names above are grouped by Menu Item and Add-on, not individual variants.</p>
            </div>
          )}
          <InlineFeedback feedback={feedback} id="archive-action-feedback" />
        </ModalContent>
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting || hasSaved}
          className="min-h-[var(--app-touch-target-min)] min-w-24 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-border-subtle)]">
          Cancel
        </Button>
        <Button type="button" onClick={handleArchive} disabled={isSubmitting || hasSaved || hasUnconfirmedSave || affectedStatus !== "ready"}
          aria-describedby={feedback ? "archive-action-feedback" : undefined}
          className="min-h-[var(--app-touch-target-min)] min-w-32 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]">
          Archive Anyway
        </Button>
      </ModalFooter>
    </Modal>
    <BlockingFeedback open={isSubmitting || hasSaved} status={isRefreshError ? "error" : "loading"}
      title={blockingFeedback.title} message={blockingFeedback.message} action={blockingAction} />
    </>
  );
};

const ArchiveItemModal = ({ isOpen, item, ...modalProps }) => {
  if (!isOpen || !item) return null;
  return <ArchiveItemModalContent key={item.id} item={item} {...modalProps} />;
};
export default ArchiveItemModal;
