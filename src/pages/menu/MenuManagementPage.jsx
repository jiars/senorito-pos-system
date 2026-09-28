import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/components/layout/PageLayout";
import { useMenuManagement } from "../../hooks/useMenuManagement";

import {
  filterAndSortAddons,
  filterAndSortMenuItems,
} from "@/utils/menu/menuManagementFilters";

import MenuHeader from "./components/MenuHeader";
import MenuWorkspace from "./components/MenuWorkspace";
import MenuItemsSection from "./components/MenuItemsSection";
import MenuCatalogToolbar from "./components/MenuCatalogToolbar";
import MenuAddonsTable from "./components/MenuAddonsTable";

import ManageMenuCategoriesModal from "./modals/Menu Categories/ManageMenuCategoriesModal";
import AddMenuItemModal from "./modals/Add Menu Item/AddMenuItemModal";
import EditMenuItemModal from "./modals/Edit Menu Item/EditMenuItemModal";
import ConfirmDeleteMenuItemModal from "./modals/Confirm Delete Menu Item/ConfirmDeleteMenuItemModal";

import AddAddonModal from "./addons/modals/Add Add-on/AddAddonModal";
import EditAddonModal from "./addons/modals/Edit Add-on/EditAddonModal";
import ConfirmDeleteAddonModal from "./addons/modals/Confirm Delete Add-on/ConfirmDeleteAddonModal";

import "./menuManagement.css";

const MenuManagementPage = () => {
  const navigate = useNavigate();

  const {
    menuItems,
    addons,
    categories,
    ingredients,
    isLoading,
    refetch: refetchMenu,
  } = useMenuManagement();

  const activeIngredients = useMemo(
    () => ingredients.filter((ingredient) => !ingredient.archived),
    [ingredients],
  );

  const [activeTab, setActiveTab] = useState("menu");

  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [menuFilters, setMenuFilters] = useState({
    categories: [],
    statuses: [],
  });
  const [menuSort, setMenuSort] = useState("0-z");

  const [addonSearchTerm, setAddonSearchTerm] = useState("");
  const [addonFilters, setAddonFilters] = useState({
    categories: [],
    statuses: [],
  });
  const [addonSort, setAddonSort] = useState("0-z");

  const filteredMenuItems = useMemo(
    () =>
      filterAndSortMenuItems({
        items: menuItems,
        searchTerm: menuSearchTerm,
        categories: menuFilters.categories,
        statuses: menuFilters.statuses,
        sort: menuSort,
      }),
    [menuFilters, menuItems, menuSearchTerm, menuSort],
  );

  const filteredAddons = useMemo(
    () =>
      filterAndSortAddons({
        items: addons,
        searchTerm: addonSearchTerm,
        categories: addonFilters.categories,
        statuses: addonFilters.statuses,
        sort: addonSort,
      }),
    [addonFilters, addonSearchTerm, addonSort, addons],
  );

  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isEditMenuItemModalOpen, setIsEditMenuItemModalOpen] = useState(false);
  const [isDeleteMenuItemModalOpen, setIsDeleteMenuItemModalOpen] =
    useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const [isAddAddonModalOpen, setIsAddAddonModalOpen] = useState(false);
  const [isEditAddonModalOpen, setIsEditAddonModalOpen] = useState(false);
  const [isDeleteAddonModalOpen, setIsDeleteAddonModalOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
  };

  const handleMenuEdit = (item) => {
    setSelectedMenuItem(item);
    setIsEditMenuItemModalOpen(true);
  };

  const handleMenuDelete = (item) => {
    setSelectedMenuItem(item);
    setIsDeleteMenuItemModalOpen(true);
  };

  const handleAddonEdit = (addon) => {
    setSelectedAddon(addon);
    setIsEditAddonModalOpen(true);
  };

  const handleAddonDelete = (addon) => {
    setSelectedAddon(addon);
    setIsDeleteAddonModalOpen(true);
  };

  const pageActions = (
    <MenuHeader
      activeTab={activeTab}
      onViewArchive={() => navigate("/menu/archive")}
      onManageCategories={() => setIsCategoriesModalOpen(true)}
      onAddMenuItem={() => setIsAddMenuItemModalOpen(true)}
      onAddAddon={() => setIsAddAddonModalOpen(true)}
    />
  );

  return (
    <PageLayout
      title="Menu Management"
      subtitle="Manage menu items, add-ons, categories, recipes, and pricing."
      actions={pageActions}
      className="menu-page-shell flex flex-col gap-[var(--app-gap-section)]"
    >
      <div className="menu-page-layout">
        <MenuWorkspace
          activeTab={activeTab}
          onActiveTabChange={handleTabChange}
          menuToolbar={
            <MenuCatalogToolbar
              key={`${menuFilters.categories.join("|")}::${menuFilters.statuses.join("|")}`}
              idPrefix="menu-items"
              searchPlaceholder="Search menu item..."
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
              idPrefix="menu-addons"
              searchPlaceholder="Search add-on..."
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
              onEdit={handleMenuEdit}
              onArchive={handleMenuDelete}
            />
          }
          addonsContent={
            <MenuAddonsTable
              key={`${addonSearchTerm}::${addonFilters.categories.join("|")}::${addonFilters.statuses.join("|")}::${addonSort}`}
              addons={filteredAddons}
              isLoading={isLoading}
              onEdit={handleAddonEdit}
              onArchive={handleAddonDelete}
            />
          }
        />
      </div>

      <ManageMenuCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        menuItems={menuItems}
        refetchMenu={refetchMenu}
      />

      <AddMenuItemModal
        isOpen={isAddMenuItemModalOpen}
        onClose={() => setIsAddMenuItemModalOpen(false)}
        refetchMenu={refetchMenu}
        categories={categories}
        inventoryItems={activeIngredients}
      />

      <EditMenuItemModal
        isOpen={isEditMenuItemModalOpen}
        onClose={() => {
          setIsEditMenuItemModalOpen(false);
          setSelectedMenuItem(null);
        }}
        item={selectedMenuItem}
        refetchMenu={refetchMenu}
        categories={categories}
        inventoryItems={ingredients}
      />

      <ConfirmDeleteMenuItemModal
        isOpen={isDeleteMenuItemModalOpen}
        onClose={() => {
          setIsDeleteMenuItemModalOpen(false);
          setSelectedMenuItem(null);
        }}
        item={selectedMenuItem}
        refetchMenu={refetchMenu}
      />

      <AddAddonModal
        isOpen={isAddAddonModalOpen}
        onClose={() => setIsAddAddonModalOpen(false)}
        refetchAddons={refetchMenu}
        categories={categories}
        inventoryItems={activeIngredients}
      />

      <EditAddonModal
        isOpen={isEditAddonModalOpen}
        onClose={() => {
          setIsEditAddonModalOpen(false);
          setSelectedAddon(null);
        }}
        addon={selectedAddon}
        refetchAddons={refetchMenu}
        categories={categories}
        inventoryItems={ingredients}
      />

      <ConfirmDeleteAddonModal
        isOpen={isDeleteAddonModalOpen}
        onClose={() => {
          setIsDeleteAddonModalOpen(false);
          setSelectedAddon(null);
        }}
        addon={selectedAddon}
        refetchAddons={refetchMenu}
      />
    </PageLayout>
  );
};

export default MenuManagementPage;
