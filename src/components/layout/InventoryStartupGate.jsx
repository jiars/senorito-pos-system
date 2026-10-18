import { useEffect, useRef, useState } from "react";
import LoadingState from "@/components/feedback/data-state/LoadingState";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import { useInventoryStartup } from "@/hooks/useInventoryStartup";
import { useInventoryCleanupSummary } from "@/hooks/useInventoryCleanupSummary";
import InventoryCleanupSummaryModal from "@/pages/inventory/modals/Expiry Summary/InventoryCleanupSummaryModal";
import {
  clearInventoryCleanupPending,
  isInventoryCleanupPending,
} from "@/utils/inventory/inventoryCleanupSession";
import {
  INVENTORY_STARTUP_COPY,
  getInventoryStartupErrorFeedback,
} from "@/utils/inventory/feedback/inventoryStartupFeedback";

// Remount after each failed attempt so Retry gets a fresh three-second delay.
const StartupFailure = ({ error, onRetry }) => {
  const [canRetry, setCanRetry] = useState(false);
  const retryStarted = useRef(false);
  const feedback = getInventoryStartupErrorFeedback(error);

  useEffect(() => {
    const timer = window.setTimeout(() => setCanRetry(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    if (!canRetry || retryStarted.current) return;
    retryStarted.current = true;
    onRetry();
  };

  return (
    <BlockingFeedback open status="error" title={feedback.title} message={feedback.message}
      action={{
        label: canRetry ? INVENTORY_STARTUP_COPY.RETRY : INVENTORY_STARTUP_COPY.RETRY_WAIT,
        onClick: handleRetry,
        disabled: !canRetry,
      }} />
  );
};

// MainLayout keys this by account, not route. Navigation does not restart cleanup.
const InventoryStartupGate = ({ userId, role, children }) => {
  const startup = useInventoryStartup();
  const { mutate: checkInventory } = startup;
  const started = useRef(false);
  const canViewSummary = role === "Owner" || role === "Inventory Clerk";
  const [showSummary, setShowSummary] = useState(() => isInventoryCleanupPending(userId));
  const shouldShowSummary = canViewSummary && showSummary;
  const summary = useInventoryCleanupSummary(userId, startup.isSuccess && shouldShowSummary);

  useEffect(() => {
    // Also prevents a duplicate initial request during React's effect replay.
    if (started.current) return;
    started.current = true;
    checkInventory();
  }, [checkInventory]);

  const closeSummary = () => {
    if (!summary.isSuccess || summary.isFetching || !summary.data.completed) return;
    clearInventoryCleanupPending();
    setShowSummary(false);
  };

  const retrySummary = async () => {
    if (summary.isSuccess && !summary.data.completed) {
      // The Philippine date may have changed between the check and summary read.
      try {
        await startup.mutateAsync();
      } catch {
        // The mutation exposes this failure through StartupFailure below.
      }
      return;
    }
    // A failed details read retries only GET, not stock cleanup.
    await summary.refetch({ cancelRefetch: false });
  };

  if (startup.isError) {
    return (
      <main className="min-h-svh bg-[var(--app-color-surface)]">
        <StartupFailure error={startup.error} onRetry={() => checkInventory()} />
      </main>
    );
  }

  if (!startup.isSuccess) {
    return <LoadingState message={INVENTORY_STARTUP_COPY.CHECKING} />;
  }

  if (shouldShowSummary) {
    return (
      <main className="min-h-svh bg-[var(--app-color-canvas)]">
        <InventoryCleanupSummaryModal isOpen requireCompleted onClose={closeSummary}
          summary={summary.data}
          isLoading={summary.isPending || summary.isFetching}
          error={summary.error}
          errorUpdatedAt={summary.errorUpdatedAt}
          onRetry={retrySummary} />
      </main>
    );
  }

  return children;
};

export default InventoryStartupGate;
