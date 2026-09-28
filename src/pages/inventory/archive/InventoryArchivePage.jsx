import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useInventoryManagement } from "@/hooks/useInventoryManagement";
import { useRefreshMenuManagement } from "@/hooks/useMenuManagement";
import { useRefreshPosManagement } from "@/hooks/usePosManagement";

import UnarchiveItemModal from "../modals/Unarchive Item/UnarchiveItemModal";
import InventoryArchiveTable from "./components/InventoryArchiveTable";

import "./inventoryArchive.css";

const InventoryArchivePage = () => {
  const navigate = useNavigate();
  const refreshMenuManagement = useRefreshMenuManagement();
  const refreshPosManagement = useRefreshPosManagement();
  const [selectedUnarchiveItem, setSelectedUnarchiveItem] = useState(null);
  const {
    archivedInventoryItems,
    isLoading,
    error,
    refetchInventoryManagement,
  } = useInventoryManagement();

  const pageActions = (
    <Button
      type="button"
      variant="outline"
      onClick={() => navigate("/inventory")}
      className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] shadow-[var(--app-shadow-card)] hover:bg-[var(--app-color-control-hover)]"
    >
      <i aria-hidden="true" className="bi bi-arrow-left" />
      Back to Inventory
    </Button>
  );

  return (
    <PageLayout
      title="Inventory Archive"
      subtitle="View archived inventory items and restore them when needed."
      actions={pageActions}
      className="inventory-archive-page-shell flex flex-col gap-[var(--app-gap-section)]"
    >
      <div className="inventory-archive-page-layout">
        <InventoryArchiveTable
          archivedItems={archivedInventoryItems}
          isLoading={isLoading}
          error={error}
          onRestoreItem={setSelectedUnarchiveItem}
        />
      </div>

      <UnarchiveItemModal
        isOpen={Boolean(selectedUnarchiveItem)}
        onClose={() => setSelectedUnarchiveItem(null)}
        item={selectedUnarchiveItem}
        refetchInventory={refetchInventoryManagement}
        refreshMenuManagement={refreshMenuManagement}
        refreshPosManagement={refreshPosManagement}
      />
    </PageLayout>
  );
};

export default InventoryArchivePage;
