import React, { useState } from 'react';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';

// Components
import InventoryHeader from './components/InventoryHeader';
import InventorySummaryCards from './components/InventorySummaryCards';
import InventoryTable from './components/InventoryTable';

// Modals
import AddInventoryItemModal from './modals/Add Inventory Item/AddInventoryItemModal';
import ManageCategoriesModal from './modals/Manage Categories/ManageCategoriesModal';
import PrintQRCodeModal from './modals/Print QR/PrintQRCodeModal';
import ArchiveItemModal from './modals/Archive Item/ArchiveItemModal';
import EditItemModal from './modals/Edit Item/EditItemModal';
import StockHistoryModal from './modals/Stock History/StockHistoryModal';
import StockLogModal from './modals/Stock Log/StockLogModal';

import './inventory.css';

const InventoryPage = () => {
  const {
    inventoryItems,
    categories,
    units,
    isLoading,
    refetchInventoryManagement,
  } = useInventoryManagement();

  const [selectedItems, setSelectedItems] = useState([]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isPrintQRModalOpen, setIsPrintQRModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedArchiveItem, setSelectedArchiveItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedLogItem, setSelectedLogItem] = useState(null);

  // Toggle Handlers
  const toggleSelectAll = () => {
    if (selectedItems.length === inventoryItems.length) setSelectedItems([]);
    else setSelectedItems(inventoryItems.map(item => item.id));
  };

  const toggleItem = (id) => {
    if (selectedItems.includes(id)) setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    else setSelectedItems([...selectedItems, id]);
  };

  return (
    <div className="inventory-page">
      <InventoryHeader
        setIsPrintQRModalOpen={setIsPrintQRModalOpen}
        setIsArchiveModalOpen={setIsArchiveModalOpen}
        setIsManageCategoriesOpen={setIsManageCategoriesOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        selectedItemsCount={selectedItems.length}
      />

      <InventorySummaryCards
        inventoryItems={inventoryItems}
      />

      <InventoryTable
        inventoryItems={inventoryItems}
        categories={categories}
        isLoading={isLoading}
        selectedItems={selectedItems}
        toggleSelectAll={toggleSelectAll}
        toggleItem={toggleItem}
        setSelectedLogItem={setSelectedLogItem}
        setIsLogModalOpen={setIsLogModalOpen}
        setSelectedHistoryItem={setSelectedHistoryItem}
        setIsHistoryModalOpen={setIsHistoryModalOpen}
        setSelectedEditItem={setSelectedEditItem}
        setIsEditModalOpen={setIsEditModalOpen}
        setSelectedArchiveItem={setSelectedArchiveItem}
        setIsArchiveModalOpen={setIsArchiveModalOpen}
      />

      {/* ───── Modals ───── */}
      <AddInventoryItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingItems={inventoryItems.map(item => item.item_name)}
        categories={categories}
        units={units}
        refetchInventory={refetchInventoryManagement}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        categories={categories}
        refetchInventory={refetchInventoryManagement}
      />

      <PrintQRCodeModal
        isOpen={isPrintQRModalOpen}
        onClose={() => setIsPrintQRModalOpen(false)}
        selectedItems={inventoryItems.filter(item => selectedItems.includes(item.id))}
      />

      <ArchiveItemModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setSelectedArchiveItem(null);
        }}
        item={selectedArchiveItem}
        refetchInventory={refetchInventoryManagement}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditItem(null);
        }}
        item={selectedEditItem}
        existingItems={inventoryItems.map(item => item.item_name)}
        categories={categories}
        refetchInventory={refetchInventoryManagement}
      />

      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedHistoryItem(null);
        }}
        item={selectedHistoryItem}
      />

      <StockLogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setSelectedLogItem(null);
        }}
        refetchInventory={refetchInventoryManagement}
        item={selectedLogItem}
      />
    </div>
  );
};

export default InventoryPage;
