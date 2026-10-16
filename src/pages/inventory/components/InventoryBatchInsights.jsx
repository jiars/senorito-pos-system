import { useMemo } from "react";

import SummaryCards from "@/components/summary-cards/SummaryCards";
import { flattenInventoryBatches } from "@/utils/inventory/inventoryBatchUtils";

const InventoryBatchInsights = ({
  inventoryItems = [],
  isLoading,
  selectedStatuses,
  onSelectedStatusesChange,
}) => {
  const stats = useMemo(() => {
    const batches = flattenInventoryBatches(inventoryItems);

    // Use the table's shared status rule so depleted batches are not expiry alerts.
    return {
      overall: batches.length,
      expiring: batches.filter(
        (batch) => batch.displayStatus === "Expiring within 7 days",
      ).length,
      expired: batches.filter((batch) => batch.displayStatus === "Expired")
        .length,
    };
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
      description: " have expired stock remaining",
      descriptionAccentClassName: "text-[var(--app-color-danger)]",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive:
        selectedStatuses.length === 1 && selectedStatuses[0] === "Expired",
      onClick: () => onSelectedStatusesChange(["Expired"]),
    },
    {
      id: "batch-value-at-risk",
      title: "Value at Risk",
      value: "₱0.00",
      description: " placeholder value",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive:
        selectedStatuses.length === 1 && selectedStatuses[0] === "At Risk",
      onClick: () => onSelectedStatusesChange(["At Risk"]),
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
