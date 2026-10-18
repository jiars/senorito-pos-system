import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ensureDailyInventoryCleanup } from "@/services/inventory/inventoryCleanupService";

// Prepare the cleanup request; nothing runs until mutate or mutateAsync is called.
export const useInventoryStartup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ensureDailyInventoryCleanup,
    // Return connection errors instead of pausing the request until reconnection.
    networkMode: "always",
    retry: false,
    onSuccess: async (result) => {
      const queryKeys = ["inventory-cleanup-summary"];

      // Changed stock must be reloaded before the pages use their old caches.
      if (!result.already_completed) {
        queryKeys.push("inventory-management", "menu-management", "pos-management",
          "inventory-audit-logs", "inventory-valuation", "sales-report");
      }

      await Promise.all(queryKeys.map((key) => {
        return queryClient.invalidateQueries({ queryKey: [key], refetchType: "none" });
      }));
    },
  });
};
