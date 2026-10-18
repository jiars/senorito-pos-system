import { useMemo } from "react";

import SummaryCards from "@/components/summary-cards/SummaryCards";
import { getInventoryBatchSummary } from "@/utils/inventory/inventoryBatchUtils";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";

const InventoryBatchInsights = ({
  inventoryItems = [],
  isLoading,
  selectedStatuses,
  onSelectedStatusesChange,
}) => {
  const stats = useMemo(() => {
    return getInventoryBatchSummary(inventoryItems);
  }, [inventoryItems]);

  const cards = [
    {
      id: "overall-batches",
      title: "Overall Batches",
      value: stats.overall,
      description: "All batch records, including depleted",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive: selectedStatuses.length === 0,
      onClick: () => onSelectedStatusesChange([]),
    },
    {
      id: "expiring-batches",
      title: "Expiring within 7 days",
      value: stats.expiring,
      descriptionAccent: `${stats.expiring} batches`,
      description: " have stock nearing expiry",
      descriptionAccentClassName: "text-[var(--app-color-warning)]",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive:
        selectedStatuses.length === 1 &&
        selectedStatuses[0] === "Expiring within 7 days",
      onClick: () => onSelectedStatusesChange(["Expiring within 7 days"]),
    },
    {
      id: "expired-batches",
      title: "Expired",
      value: stats.expired,
      descriptionAccent: `${stats.expired} batches`,
      description: " have reached their expiry date, including depleted",
      descriptionAccentClassName: "text-[var(--app-color-danger)]",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive:
        selectedStatuses.length === 1 && selectedStatuses[0] === "Expired",
      onClick: () => onSelectedStatusesChange(["Expired"]),
    },
    {
      id: "batch-value-at-risk",
      title: "Value at Risk",
      value: formatCurrency(stats.valueAtRisk),
      descriptionAccent: formatCurrency(stats.expiredValue),
      description: " in expired stock",
      descriptionAccentClassName: "text-[var(--app-color-danger)]",
      titleClassName: "text-[var(--app-color-brand)]",
    },
  ];

  return (
    <section className="inventory-batch-summary-region px-[var(--app-space-4)]">
      <SummaryCards
        cards={cards}
        isLoading={isLoading}
        gridClassName="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2 lg:grid-cols-4"
      />
    </section>
  );
};

export default InventoryBatchInsights;
