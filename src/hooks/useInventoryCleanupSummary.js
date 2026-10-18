import { useQuery } from "@tanstack/react-query";
import { fetchInventoryCleanupSummary } from "@/services/inventory/inventoryCleanupService";
import { getBusinessDateKey } from "@/utils/shared/formatters/businessDates";

const CLEANUP_SUMMARY_STALE_TIME = 5 * 60 * 1000;

// The modal enables this read only when it needs today's saved result.
export const useInventoryCleanupSummary = (userId, enabled = false) => {
  return useQuery({
    queryKey: [
      "inventory-cleanup-summary",
      userId,
      getBusinessDateKey(new Date()),
    ],
    queryFn: fetchInventoryCleanupSummary,
    enabled: Boolean(userId) && enabled,
    staleTime: (query) => {
      // Match Menu/Inventory caching after a successful daily completion.
      const summary = query.state.data;
      if (summary && summary.completed) return CLEANUP_SUMMARY_STALE_TIME;
      // A pending day may finish on the server before the viewer is reopened.
      return 0;
    },
    // Show failures immediately; the user will choose Retry in the modal.
    networkMode: "always",
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
