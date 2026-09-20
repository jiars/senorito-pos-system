import { useMemo } from "react";

import correctionIcon from "@/assets/quick-action/inventory/correction.svg";
import logWastageIcon from "@/assets/quick-action/inventory/logWastage.svg";
import receiveStockIcon from "@/assets/quick-action/inventory/receiveStock.svg";
import SummaryCards from "@/components/summary-cards/SummaryCards";

import { Skeleton } from "@/components/ui/skeleton";

const quickActions = [
  {
    id: "receive-stock",
    label: "Receive Stock",
    description: "Record a new inventory delivery.",
    icon: receiveStockIcon,
  },
  {
    id: "log-wastage",
    label: "Log Wastage",
    description: "Record damaged, spoiled, or lost stock.",
    icon: logWastageIcon,
  },
  {
    id: "correction",
    label: "Correction",
    description: "Correct an inaccurate physical stock count.",
    icon: correctionIcon,
  },
];

const InventoryStockInsights = ({
  inventoryItems = [],
  isLoading,
  selectedStatuses,
  onSelectedStatusesChange,
}) => {
  const stats = useMemo(() => {
    const totalItemsCount = inventoryItems.length;
    const inStockCount = inventoryItems.filter(
      (item) => Number(item.current_stock) > Number(item.minimum_level),
    ).length;
    const lowStockCount = inventoryItems.filter(
      (item) =>
        Number(item.current_stock) > 0 &&
        Number(item.current_stock) <= Number(item.minimum_level),
    ).length;
    const outOfStockCount = inventoryItems.filter(
      (item) => Number(item.current_stock) === 0,
    ).length;
    const currentDate = new Date();
    const newItemsCount = inventoryItems.filter((item) => {
      const itemDate = new Date(item.created_at);

      return (
        itemDate.getMonth() === currentDate.getMonth() &&
        itemDate.getFullYear() === currentDate.getFullYear()
      );
    }).length;

    return {
      totalItemsCount,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      newItemsCount,
      inStockPercentage:
        totalItemsCount === 0
          ? 0
          : Math.round((inStockCount / totalItemsCount) * 100),
    };
  }, [inventoryItems]);

  const cards = [
    {
      id: "total-items",
      title: "Total Items",
      value: stats.totalItemsCount,
      descriptionAccent: `${stats.newItemsCount} new items`,
      description: " added this month",
      descriptionAccentClassName: "text-[var(--app-color-success)]",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive: selectedStatuses.length === 0,
      onClick: () => onSelectedStatusesChange([]),
    },
    {
      id: "in-stock-items",
      title: "In-Stock Items",
      value: stats.inStockCount,
      descriptionAccent: `${stats.inStockPercentage}%`,
      description: " of inventory fully stocked",
      descriptionAccentClassName: "text-[var(--app-color-success)]",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive:
        selectedStatuses.length === 1 && selectedStatuses[0] === "In-stock",
      onClick: () => onSelectedStatusesChange(["In-stock"]),
    },
    {
      id: "low-stock-alerts",
      title: "Low Stock Alerts",
      value: stats.lowStockCount,
      descriptionAccent: `${stats.lowStockCount} items`,
      description: " below minimum threshold",
      descriptionAccentClassName: "text-[var(--app-color-warning)]",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive:
        selectedStatuses.length === 1 && selectedStatuses[0] === "Low Stock",
      onClick: () => onSelectedStatusesChange(["Low Stock"]),
    },
    {
      id: "out-of-stock",
      title: "Out of Stock",
      value: stats.outOfStockCount,
      descriptionAccent: `${stats.outOfStockCount} items`,
      description: " currently unavailable",
      descriptionAccentClassName: "text-[var(--app-color-danger)]",
      titleClassName: "text-[var(--app-color-brand)]",
      isActive:
        selectedStatuses.length === 1 && selectedStatuses[0] === "Out of Stock",
      onClick: () => onSelectedStatusesChange(["Out of Stock"]),
    },
  ];

  return (
    <section className="inventory-stock-overview-insights">
      <div className="inventory-stock-summary-region min-w-0 p-[var(--app-space-2)]">
        <SummaryCards
          cards={cards}
          isLoading={isLoading}
          gridClassName="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2"
        />
      </div>

      <aside
        className={`inventory-stock-quick-actions-region flex min-h-0 min-w-0 flex-col rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] ${
          isLoading ? "" : "shadow-[var(--app-shadow-card)]"
        }`}
      >
        {isLoading ? (
          <>
            <Skeleton className="mb-[var(--app-gap-related)] h-6 w-36 rounded-[var(--app-radius-nested)]" />

            <div className="flex flex-1 flex-col gap-[var(--app-space-2)]">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="min-h-[var(--app-control-height-primary)] w-full rounded-[var(--app-radius-nested)]"
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-[var(--app-gap-related)] text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-text)]">
              Quick Actions
            </h2>

            <div className="flex flex-1 flex-col gap-[var(--app-space-2)]">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  disabled
                  title="The existing modal will be connected after layout approval."
                  className="flex min-h-[var(--app-control-height-primary)] w-full items-center gap-[var(--app-gap-related)] rounded-[var(--app-radius-nested)] bg-[linear-gradient(to_bottom,var(--app-color-canvas),var(--app-color-surface))] px-[var(--app-space-4)] py-[var(--app-space-2)] text-left shadow-[var(--app-shadow-card)] disabled:cursor-not-allowed"
                >
                  <img
                    src={action.icon}
                    alt=""
                    aria-hidden="true"
                    className="size-[var(--app-touch-target-min)] shrink-0 rounded-[var(--app-radius-nested)] object-cover"
                  />

                  <span className="min-w-0">
                    <span className="block text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
                      {action.label}
                    </span>

                    <span className="block text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                      {action.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>
    </section>
  );
};

export default InventoryStockInsights;
