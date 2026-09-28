import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const inventoryTabs = [
  {
    value: "stock-overview",
    label: "Stock Overview",
    caption:
      "Current on-hand counts of your products, ingredients, and packaging materials, including reorder alerts.",
  },
  {
    value: "batches",
    label: "Batches",
    caption:
      "Review active inventory batches, expiry dates, quantities, and supplier records.",
  },
  {
    value: "wastage",
    label: "Wastage",
    caption:
      "Monitor recorded inventory losses, their quantities, reasons, and responsible staff.",
  },
  {
    value: "purchase-history",
    label: "Purchase History",
    caption:
      "Review inventory purchases, suppliers, received quantities, and recorded costs.",
  },
];

const InventoryWorkspace = ({
  stockOverviewContent,
  batchesContent = null,
  wastageContent = null,
  purchaseHistoryContent = null,
}) => {
  const contentByTab = {
    "stock-overview": stockOverviewContent,
    batches: batchesContent,
    wastage: wastageContent,
    "purchase-history": purchaseHistoryContent,
  };

  return (
    <Tabs defaultValue="stock-overview" className="inventory-workspace min-w-0">
      <div className="inventory-tabs-scroll min-w-0 overflow-x-auto overflow-y-hidden">
        <TabsList
          variant="line"
          aria-label="Inventory sections"
          className="!h-auto min-w-max justify-start gap-[var(--app-gap-related)] p-0"
        >
          {inventoryTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-[var(--app-touch-target-min)] flex-none rounded-none px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)] after:!bottom-0 data-active:font-semibold data-active:text-[var(--app-color-brand)] data-active:after:bg-[var(--app-color-brand)] max-sm:text-[length:var(--app-font-size-caption)]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {inventoryTabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="inventory-tab-content min-w-0"
        >
          <p className="inventory-tab-caption text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)] mt-[var(--app-space-2)] mb-[var(--app-gap-section)]">
            {tab.caption}
          </p>

          {contentByTab[tab.value]}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default InventoryWorkspace;
