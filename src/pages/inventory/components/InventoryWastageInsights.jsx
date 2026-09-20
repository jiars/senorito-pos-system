import { useMemo } from "react";

import SummaryCards from "@/components/summary-cards/SummaryCards";
import { formatCurrency } from "@/utils/currencyFormatters";
import {
  flattenInventoryWastageLogs,
  getMostFrequentValue,
} from "@/utils/inventory/inventoryWastageUtils";

const InventoryWastageInsights = ({
  inventoryItems = [],
  isLoading,
  quickFilter,
  onQuickFilterChange,
}) => {
  const stats = useMemo(() => {
    const logs = flattenInventoryWastageLogs(inventoryItems);

    return {
      totalCost: logs.reduce((total, log) => total + log.totalCost, 0),
      totalLogs: logs.length,
      mostWastedItem: getMostFrequentValue(logs.map((log) => log.itemName)),
      mostCommonReason: getMostFrequentValue(
        logs.map((log) => log.reasonCategory),
      ),
    };
  }, [inventoryItems]);

  const cards = [
    {
      id: "total-wastage-cost",
      title: "Total Wastage Cost",
      value: formatCurrency(stats.totalCost),
      description: " estimated inventory loss",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive: quickFilter?.type === "cost",
      onClick: () => onQuickFilterChange({ type: "cost" }),
    },
    {
      id: "total-wastage-logs",
      title: "Total Wastage Logs",
      value: stats.totalLogs,
      description: " recorded wastage entries",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive: quickFilter?.type === "logs",
      onClick: () => onQuickFilterChange({ type: "logs" }),
    },
    {
      id: "most-wasted-item",
      title: "Most Wasted Item",
      value: stats.mostWastedItem ?? "None",
      description: " highest number of wastage logs",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive:
        quickFilter?.type === "item" &&
        quickFilter.value === stats.mostWastedItem,
      onClick: () =>
        onQuickFilterChange(
          stats.mostWastedItem
            ? { type: "item", value: stats.mostWastedItem }
            : null,
        ),
    },
    {
      id: "most-common-reason",
      title: "Most Common Reason",
      value: stats.mostCommonReason ?? "None",
      description: " most frequently recorded reason",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive:
        quickFilter?.type === "reason" &&
        quickFilter.value === stats.mostCommonReason,
      onClick: () =>
        onQuickFilterChange(
          stats.mostCommonReason
            ? { type: "reason", value: stats.mostCommonReason }
            : null,
        ),
    },
  ];

  return (
    <section className="inventory-wastage-summary-region px-[var(--app-space-4)]">
      <SummaryCards
        cards={cards}
        isLoading={isLoading}
        gridClassName="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2 lg:grid-cols-4"
      />
    </section>
  );
};

export default InventoryWastageInsights;
