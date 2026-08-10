import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';
import { cleanupExpiredBatches } from '../../services/inventory/inventoryStockService';
import { getExpiryInfo } from '../../utils/inventoryExpiryUtils';

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
import BatchesModal from './modals/Batches/BatchesModal';
import StockHistoryModal from './modals/Stock History/StockHistoryModal';
import StockLogModal from './modals/Stock Log/StockLogModal';

import './inventory.css';

const InventoryPage = () => {
  const { user } = useAuth();
  const { inventoryItems, categories, units, isLoading, refetchInventory } = useInventory();
  const hasCleanedUp = useRef(false);

  // Auto-cleanup expired batches on mount
  useEffect(() => {
    const runCleanup = async () => {
      if (user?.id && !hasCleanedUp.current) {
        hasCleanedUp.current = true;
        const cleanedCount = await cleanupExpiredBatches(user.id);
        if (cleanedCount > 0) {
          refetchInventory(); // Reload data if any batches were zeroed out
        }
      }
    };
    runCleanup();
  }, [user?.id, refetchInventory]);

  // Selected Items State
  const [selectedItems, setSelectedItems] = useState([]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isPrintQRModalOpen, setIsPrintQRModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedArchiveItem, setSelectedArchiveItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState(null);
  const [isBatchesModalOpen, setIsBatchesModalOpen] = useState(false);
  const [selectedBatchesItem, setSelectedBatchesItem] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedLogItem, setSelectedLogItem] = useState(null);

  const navigate = useNavigate();

  // Dynamic Computations
  const totalItemsCount = inventoryItems.length;
  const inStockCount = inventoryItems.filter(item => item.current_stock > item.minimum_level).length;
  const lowStockCount = inventoryItems.filter(item => item.current_stock > 0 && item.current_stock <= item.minimum_level).length;
  const outOfStockCount = inventoryItems.filter(item => item.current_stock === 0).length;

  const expiringSoonCount = inventoryItems.filter(item => getExpiryInfo(item).status === 'Expiring Soon').length;
  const expiredCount = inventoryItems.filter(item => getExpiryInfo(item).status === 'Expired').length;

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
        totalItemsCount={totalItemsCount}
        inStockCount={inStockCount}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        expiringSoonCount={expiringSoonCount}
        expiredCount={expiredCount}
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
        refetchInventory={refetchInventory}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        categories={categories}
        inventoryItems={inventoryItems}
        refetchInventory={refetchInventory}
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
        refetchInventory={refetchInventory}
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
        refetchInventory={refetchInventory}
      />

      <BatchesModal
        isOpen={isBatchesModalOpen}
        onClose={() => {
          setIsBatchesModalOpen(false);
          setSelectedBatchesItem(null);
        }}
        item={selectedBatchesItem}
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
        refetchInventory={refetchInventory}
        item={selectedLogItem}
      />
    </div>
  );
};

export default InventoryPage;
