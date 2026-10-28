import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRefreshPosManagement } from "@/hooks/usePosManagement";
import { markPOSRefreshRequired, completePOSRefresh } from "@/services/pos/posCacheService";

const STOCK_QUERY_KEYS = [
  ["inventory-management"], ["inventory-audit-logs"], ["inventory-valuation"],
  ["menu-management"], ["pos-management"],
];

export const useOrderVoidStockRefresh = () => {
  const revision = useRef(null);
  const queryClient = useQueryClient();
  const refreshPos = useRefreshPosManagement();

  const prepareStockReturn = useCallback(async () => {
    // Persist this before PATCH, including when the server's reply is lost.
    revision.current = await markPOSRefreshRequired();
    for (const queryKey of STOCK_QUERY_KEYS) {
      await queryClient.cancelQueries({ queryKey });
      queryClient.removeQueries({ queryKey, type: "inactive" });
      await queryClient.invalidateQueries({ queryKey, refetchType: "none" });
    }
  }, [queryClient]);

  const refreshStockAfterReview = useCallback(async (stockHandling) => {
    // Also clear a preparation left by a rejected return attempt followed by Keep/Reject.
    if (stockHandling !== "return_stock" && revision.current === null) return;
    if (revision.current === null) revision.current = await markPOSRefreshRequired();
    for (const queryKey of STOCK_QUERY_KEYS) {
      if (queryKey[0] === "pos-management") continue;
      await queryClient.invalidateQueries({ queryKey }, { throwOnError: true });
    }
    // The existing hook updates both React Query and the offline POS catalog.
    await refreshPos();
    const completed = await completePOSRefresh(revision.current);
    if (!completed) {
      // Another stock/menu change happened. Retry the reads against its revision.
      revision.current = null;
      throw new Error("Stock changed again. Retry refresh before continuing.");
    }
  }, [queryClient, refreshPos]);

  return { prepareStockReturn, refreshStockAfterReview };
};
