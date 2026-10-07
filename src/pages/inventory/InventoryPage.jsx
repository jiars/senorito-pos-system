import { lazy, Suspense, useState } from "react";

import PageLayout from "@/components/layout/PageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryManagement } from "@/hooks/useInventoryManagement";
import { useRefreshMenuManagement } from "@/hooks/useMenuManagement";
import { useRefreshPosManagement } from "@/hooks/usePosManagement";

// Components
import InventoryHeader from "./components/InventoryHeader";
import InventoryStockInsights from "./components/InventoryStockInsights";
import InventoryStockTable from "./components/InventoryStockTable";
import InventoryWorkspace from "./components/InventoryWorkspace";

// Modals
import AddInventoryItemModal from "./modals/Add Inventory Item/AddInventoryItemModal";
import ArchiveItemModal from "./modals/Archive Item/ArchiveItemModal";
import CorrectionModal from "./modals/Correction/CorrectionModal";
import EditItemModal from "./modals/Edit Item/EditItemModal";
import ManageCategoriesModal from "./modals/Manage Categories/ManageCategoriesModal";
import PrintQRCodeModal from "./modals/Print QR/PrintQRCodeModal";
import RestockModal from "./modals/Restock/RestockModal";
import StockHistoryModal from "./modals/Stock History/StockHistoryModal";
import WastageModal from "./modals/Wastage/WastageModal";

import "./inventory.css";

const InventoryBatchInsights = lazy(
  () => import("./components/InventoryBatchInsights"),
);
const InventoryBatchTable = lazy(
  () => import("./components/InventoryBatchTable"),
);
const InventoryWastageInsights = lazy(
  () => import("./components/InventoryWastageInsights"),
);
const InventoryWastageTable = lazy(
  () => import("./components/InventoryWastageTable"),
);
const InventoryPurchaseHistoryTable = lazy(
  () => import("./components/InventoryPurchaseHistoryTable"),
);
const InventoryTabLoadingFallback = () => (
  <div className="grid gap-[var(--app-gap-section)]">
    <Skeleton className="h-36 w-full rounded-[var(--app-radius-panel-standard)]" />
    <Skeleton className="h-80 w-full rounded-[var(--app-radius-panel-standard)]" />
  </div>
);

const useIdSelection = () => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleOne = (id) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    );
  };

  const toggleVisible = (visibleIds) => {
    const areAllVisibleSelected = visibleIds.every((id) =>
      selectedIds.includes(id),
    );

    setSelectedIds((currentIds) =>
      areAllVisibleSelected
        ? currentIds.filter((id) => !visibleIds.includes(id))
        : [...new Set([...currentIds, ...visibleIds])],
    );
  };

  return { selectedIds, toggleOne, toggleVisible };
};

const InventoryPage = () => {
  const refreshMenuManagement = useRefreshMenuManagement();
  const refreshPosManagement = useRefreshPosManagement();
  const {
    inventoryItems,
    categories,
    units,
    purchaseHistory,
    isLoading,
    error,
    refetchInventoryManagement,
  } = useInventoryManagement();

  const itemSelection = useIdSelection();
  const batchSelection = useIdSelection();
  const [stockStatusFilters, setStockStatusFilters] = useState([]);
  const [batchStatusFilters, setBatchStatusFilters] = useState([]);
  const [wastageQuickFilter, setWastageQuickFilter] = useState(null);
  const [modal, setModal] = useState({ type: null, item: null });
  const closeModal = () => setModal({ type: null, item: null });
  const openItemModal = (type, item = null) => setModal({ type, item });

  const handleAddAnotherItem = () => {
    setModal((currentModal) => {
      if (currentModal.type) return currentModal;
      return { type: "add-item", item: null };
    });
  };

  const handleRestockAgain = () => {
    // A toast action must not replace another open workflow.
    setModal((currentModal) => {
      if (currentModal.type) return currentModal;
      return { type: "restock", item: null };
    });
  };

  const handleWastageAgain = () => {
    setModal((currentModal) => {
      if (currentModal.type) return currentModal;
      return { type: "wastage", item: null };
    });
  };

  const handleCorrectionAgain = () => {
    setModal((currentModal) => {
      if (currentModal.type) return currentModal;
      return { type: "correction", item: null };
    });
  };

  const openStockPrintQr = () => {
    setModal({
      type: "print-qr",
      itemIds: itemSelection.selectedIds,
      batchIds: [],
      selectItemsByDefault: true,
    });
  };

  const openBatchPrintQr = () => {
    const ownerItemIds = inventoryItems
      .filter((item) =>
        (item.inventory_batches ?? []).some((batch) =>
          batchSelection.selectedIds.includes(batch.id),
        ),
      )
      .map((item) => item.id);

    setModal({
      type: "print-qr",
      itemIds: ownerItemIds,
      batchIds: batchSelection.selectedIds,
      selectItemsByDefault: false,
    });
  };

  const pageActions = (
    <InventoryHeader
      onOpenManageCategories={() => openItemModal("manage-categories")}
      onOpenAddItem={() => openItemModal("add-item")}
    />
  );

  return (
    <PageLayout
      title="Inventory"
      subtitle="Manage and monitor your products, ingredients, and packaging materials."
      actions={pageActions}
      className="inventory-page-shell flex flex-col gap-[var(--app-gap-section)]"
    >
      <div className="inventory-page-layout inventory-page">
        <InventoryWorkspace
          stockOverviewContent={
            <div className="inventory-stock-overview-layout">
              <InventoryStockInsights
                inventoryItems={inventoryItems}
                isLoading={isLoading}
                selectedStatuses={stockStatusFilters}
                onSelectedStatusesChange={setStockStatusFilters}
                onOpenRestock={() => openItemModal("restock")}
                onOpenWastage={() => openItemModal("wastage")}
                onOpenCorrection={() => openItemModal("correction")}
              />

              <InventoryStockTable
                inventoryItems={inventoryItems}
                categories={categories}
                isLoading={isLoading}
                error={error}
                selectedStatuses={stockStatusFilters}
                onSelectedStatusesChange={setStockStatusFilters}
                selectedItems={itemSelection.selectedIds}
                toggleVisibleItems={itemSelection.toggleVisible}
                toggleItem={itemSelection.toggleOne}
                onPrintQRCode={openStockPrintQr}
                onOpenRestock={(item) => openItemModal("restock", item)}
                onOpenWastage={(item) => openItemModal("wastage", item)}
                onOpenCorrection={(item) =>
                  openItemModal("correction", item)
                }
                onOpenHistory={(item) => openItemModal("history", item)}
                onOpenEdit={(item) => openItemModal("edit-item", item)}
                onOpenArchive={(item) => openItemModal("archive-item", item)}
              />
            </div>
          }
          batchesContent={
            <Suspense fallback={<InventoryTabLoadingFallback />}>
              <div className="inventory-batches-layout">
                <InventoryBatchInsights
                  inventoryItems={inventoryItems}
                  isLoading={isLoading}
                  selectedStatuses={batchStatusFilters}
                  onSelectedStatusesChange={setBatchStatusFilters}
                />

                <InventoryBatchTable
                  inventoryItems={inventoryItems}
                  categories={categories}
                  isLoading={isLoading}
                  error={error}
                  selectedStatuses={batchStatusFilters}
                  onSelectedStatusesChange={setBatchStatusFilters}
                  selectedBatchIds={batchSelection.selectedIds}
                  onToggleVisibleBatches={batchSelection.toggleVisible}
                  onToggleBatch={batchSelection.toggleOne}
                  onPrintQRCode={openBatchPrintQr}
                />
              </div>
            </Suspense>
          }
          wastageContent={
            <Suspense fallback={<InventoryTabLoadingFallback />}>
              <div className="inventory-wastage-layout">
                <InventoryWastageInsights
                  inventoryItems={inventoryItems}
                  isLoading={isLoading}
                  quickFilter={wastageQuickFilter}
                  onQuickFilterChange={setWastageQuickFilter}
                />

                <InventoryWastageTable
                  inventoryItems={inventoryItems}
                  categories={categories}
                  isLoading={isLoading}
                  error={error}
                  quickFilter={wastageQuickFilter}
                  onQuickFilterChange={setWastageQuickFilter}
                />
              </div>
            </Suspense>
          }
          purchaseHistoryContent={
            <Suspense fallback={<InventoryTabLoadingFallback />}>
              <div className="inventory-purchase-history-layout">
                <InventoryPurchaseHistoryTable
                  purchaseHistory={purchaseHistory}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            </Suspense>
          }
        />
      </div>

      {/* ───── Modals ───── */}
      <AddInventoryItemModal
        isOpen={modal.type === "add-item"}
        onClose={closeModal}
        onAddAnotherItem={handleAddAnotherItem}
        existingItems={inventoryItems.map((item) => item.item_name)}
        categories={categories}
        units={units}
        refetchInventory={refetchInventoryManagement}
      />

      <ManageCategoriesModal
        isOpen={modal.type === "manage-categories"}
        onClose={closeModal}
        categories={categories}
        refetchInventory={refetchInventoryManagement}
      />

      <PrintQRCodeModal
        isOpen={modal.type === "print-qr"}
        onClose={closeModal}
        selectedItems={inventoryItems.filter((item) =>
          (modal.itemIds ?? []).includes(item.id),
        )}
        initialSelectedBatchIds={modal.batchIds ?? []}
        selectItemsByDefault={modal.selectItemsByDefault ?? true}
      />

      <ArchiveItemModal
        isOpen={modal.type === "archive-item"}
        onClose={closeModal}
        item={modal.item}
        refetchInventory={refetchInventoryManagement}
        refreshMenuManagement={refreshMenuManagement}
        refreshPosManagement={refreshPosManagement}
      />

      <EditItemModal
        isOpen={modal.type === "edit-item"}
        onClose={closeModal}
        item={modal.item}
        existingItems={inventoryItems.map((item) => item.item_name)}
        categories={categories}
        refetchInventory={refetchInventoryManagement}
      />

      <StockHistoryModal
        isOpen={modal.type === "history"}
        onClose={closeModal}
        item={modal.item}
      />

      <RestockModal
        isOpen={modal.type === "restock"}
        onClose={closeModal}
        onRestockAgain={handleRestockAgain}
        refetchInventory={refetchInventoryManagement}
        inventoryItems={inventoryItems}
        item={modal.item}
      />

      <WastageModal
        isOpen={modal.type === "wastage"}
        onClose={closeModal}
        onWastageAgain={handleWastageAgain}
        refetchInventory={refetchInventoryManagement}
        inventoryItems={inventoryItems}
        item={modal.item}
      />

      <CorrectionModal
        isOpen={modal.type === "correction"}
        onClose={closeModal}
        onCorrectionAgain={handleCorrectionAgain}
        refetchInventory={refetchInventoryManagement}
        inventoryItems={inventoryItems}
        item={modal.item}
      />
    </PageLayout>
  );
};

export default InventoryPage;
