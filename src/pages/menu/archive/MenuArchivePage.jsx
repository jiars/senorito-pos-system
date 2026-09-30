import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useMenuManagement } from "@/hooks/useMenuManagement";
import { unarchiveAddon } from "@/services/menu/addonsService";
import { unarchiveMenuItem } from "@/services/menu/menuItemsService";
import {
  filterAndSortAddons,
  filterAndSortMenuItems,
} from "@/utils/menu/menuManagementFilters";

import MenuAddonsTable from "../components/MenuAddonsTable";
import MenuCatalogToolbar from "../components/MenuCatalogToolbar";
import MenuItemsSection from "../components/MenuItemsSection";
import MenuWorkspace from "../components/MenuWorkspace";

import "../menuManagement.css";

const createEmptyFilters = () => ({
  categories: [],
  statuses: [],
});

const MenuArchivePage = () => {
  const navigate = useNavigate();

  const {
    archivedMenuItems,
    archivedAddons,
    categories,
    isLoading,
    refetch: refetchMenu,
  } = useMenuManagement();

  const [activeTab, setActiveTab] = useState("menu");

  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [menuFilters, setMenuFilters] = useState(createEmptyFilters);
  const [menuSort, setMenuSort] = useState("0-z");

  const [addonSearchTerm, setAddonSearchTerm] = useState("");
  const [addonFilters, setAddonFilters] = useState(createEmptyFilters);
  const [addonSort, setAddonSort] = useState("0-z");

  const [restoringMenuItemId, setRestoringMenuItemId] = useState(null);
  const [restoringAddonId, setRestoringAddonId] = useState(null);

  const filteredMenuItems = useMemo(
    () =>
      filterAndSortMenuItems({
        items: archivedMenuItems,
        searchTerm: menuSearchTerm,
        categories: menuFilters.categories,
        statuses: menuFilters.statuses,
        sort: menuSort,
      }),
    [archivedMenuItems, menuFilters, menuSearchTerm, menuSort],
  );

  const filteredAddons = useMemo(
    () =>
      filterAndSortAddons({
        items: archivedAddons,
        searchTerm: addonSearchTerm,
        categories: addonFilters.categories,
        statuses: addonFilters.statuses,
        sort: addonSort,
      }),
    [addonFilters, addonSearchTerm, addonSort, archivedAddons],
  );

  const handleRestoreMenuItem = async (item) => {
    if (restoringMenuItemId !== null) {
      return;
    }

    try {
      setRestoringMenuItemId(item.id);
      await unarchiveMenuItem(item.id);
      await refetchMenu();
    } catch (requestError) {
      alert(requestError.message || "Failed to restore menu item.");
    } finally {
      setRestoringMenuItemId(null);
    }
  };

  const handleRestoreAddon = async (addon) => {
    if (restoringAddonId !== null) {
      return;
    }

    try {
      setRestoringAddonId(addon.id);
      await unarchiveAddon(addon.id);
      await refetchMenu();
    } catch (requestError) {
      alert(requestError.message || "Failed to restore add-on.");
    } finally {
      setRestoringAddonId(null);
    }
  };

  const pageActions = (
    <Button
      type="button"
      variant="outline"
      onClick={() => navigate("/menu")}
      className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] hover:bg-[var(--app-color-control-hover)] transition-shadow hover:shadow-brand active:shadow-brand"
    >
      <i aria-hidden="true" className="bi bi-arrow-left" />
      Back
    </Button>
  );

  return (
    <PageLayout
      title="Menu Archive"
      subtitle="View archived menu items and add-ons and restore them when needed."
      actions={pageActions}
      className="menu-page-shell flex flex-col gap-[var(--app-gap-section)]"
    >
      <div className="menu-page-layout">
        <MenuWorkspace
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          menuToolbar={
            <MenuCatalogToolbar
              key={`${menuFilters.categories.join("|")}::${menuFilters.statuses.join("|")}`}
              idPrefix="archived-menu-items"
              searchPlaceholder="Search archived menu item..."
              searchTerm={menuSearchTerm}
              categories={categories}
              filters={menuFilters}
              sort={menuSort}
              isLoading={isLoading}
              onSearchChange={setMenuSearchTerm}
              onApplyFilters={setMenuFilters}
              onSortChange={setMenuSort}
            />
          }
          addonsToolbar={
            <MenuCatalogToolbar
              key={`${addonFilters.categories.join("|")}::${addonFilters.statuses.join("|")}`}
              idPrefix="archived-menu-addons"
              searchPlaceholder="Search archived add-on..."
              searchTerm={addonSearchTerm}
              categories={categories}
              filters={addonFilters}
              sort={addonSort}
              isLoading={isLoading}
              onSearchChange={setAddonSearchTerm}
              onApplyFilters={setAddonFilters}
              onSortChange={setAddonSort}
            />
          }
          menuContent={
            <MenuItemsSection
              items={filteredMenuItems}
              isLoading={isLoading}
              mode="archive"
              restoringItemId={restoringMenuItemId}
              onRestore={handleRestoreMenuItem}
            />
          }
          addonsContent={
            <MenuAddonsTable
              key={`${addonSearchTerm}::${addonFilters.categories.join("|")}::${addonFilters.statuses.join("|")}::${addonSort}`}
              addons={filteredAddons}
              isLoading={isLoading}
              mode="archive"
              restoringAddonId={restoringAddonId}
              onRestore={handleRestoreAddon}
            />
          }
        />
      </div>
    </PageLayout>
  );
};

export default MenuArchivePage;
