import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UnarchiveItemModal from '../modals/Unarchive Item/UnarchiveItemModal';
import { fetchArchivedInventoryItems } from '../../../services/inventory/inventoryItemsService';
import InventoryArchiveHeader from './components/InventoryArchiveHeader';
import InventoryArchiveFilters from './components/InventoryArchiveFilters';
import InventoryArchiveTable from './components/InventoryArchiveTable';
import '../inventory.css';
import './inventoryArchive.css';

const InventoryArchivePage = () => {
  const [isUnarchiveModalOpen, setIsUnarchiveModalOpen] = useState(false);
  const [selectedUnarchiveItem, setSelectedUnarchiveItem] = useState(null);
  const [archivedItems, setArchivedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [expiryFilter, setExpiryFilter] = useState('All Expiry Status');

  const navigate = useNavigate();

  const categories = useMemo(() => {
    const cats = archivedItems.map(item => item.inventory_categories?.category_name).filter(Boolean);
    return [...new Set(cats)];
  }, [archivedItems]);

  const filteredItems = archivedItems.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const categoryName = item.inventory_categories?.category_name || '';
    const matchesCategory = categoryFilter === 'All Categories' || categoryName === categoryFilter;
    
    const stockStatus = item.current_stock > (item.minimum_level || 0) ? 'In-stock' : (item.current_stock === 0 ? 'Out of Stock' : 'Low Stock');
    const matchesStatus = statusFilter === 'All Status' || stockStatus === statusFilter;
    
    const expiryStatus = item.expiry || 'Good';
    const matchesExpiry = expiryFilter === 'All Expiry Status' || expiryStatus === expiryFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesExpiry;
  });

  const handleReset = () => {
    setSearchQuery('');
    setCategoryFilter('All Categories');
    setStatusFilter('All Status');
    setExpiryFilter('All Expiry Status');
  };

  const loadArchivedItems = async () => {
    setIsLoading(true);
    try {
      const data = await fetchArchivedInventoryItems();
      setArchivedItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch archived inventory: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArchivedItems();
  }, []);

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'In-stock': return 'inventory-chip--instock';
      case 'Low Stock': return 'inventory-chip--lowstock';
      case 'Out of Stock': return 'inventory-chip--outofstock';
      default: return '';
    }
  };

  const getExpiryChipClass = (expiry) => {
    switch (expiry) {
      case 'Good': return 'inventory-chip--good';
      case 'Expiring Soon': return 'inventory-chip--expiring';
      case 'Expired': return 'inventory-chip--expired';
      default: return '';
    }
  };

  const renderExpiry = (item) => {
    if (!item.expiry) {
      return <div className="inventory-expiry-cell">-</div>;
    }

    let prefix = 'Nearest:';
    if (item.expiry === 'Expired') prefix = 'Expired:';

    return (
      <div className="inventory-expiry-cell">
        <span className={`inventory-expiry-chip ${getExpiryChipClass(item.expiry)}`}>
          {item.expiry}
        </span>
        <span className="inventory-expiry-detail">
          {prefix} {item.expiryDate} ({item.expiryDays})
        </span>
      </div>
    );
  };

  return (
    <div className="inventory-page">
      <InventoryArchiveHeader navigate={navigate} />

      <div className="inventory-panel">
        <InventoryArchiveFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          expiryFilter={expiryFilter}
          setExpiryFilter={setExpiryFilter}
          categories={categories}
          handleReset={handleReset}
        />

        <InventoryArchiveTable
          isLoading={isLoading}
          error={error}
          filteredItems={filteredItems}
          getStatusChipClass={getStatusChipClass}
          renderExpiry={renderExpiry}
          setSelectedUnarchiveItem={setSelectedUnarchiveItem}
          setIsUnarchiveModalOpen={setIsUnarchiveModalOpen}
        />
      </div>

      <UnarchiveItemModal
        isOpen={isUnarchiveModalOpen}
        onClose={() => {
          setIsUnarchiveModalOpen(false);
          setSelectedUnarchiveItem(null);
        }}
        item={selectedUnarchiveItem}
        refetchInventory={loadArchivedItems}
      />
    </div>
  );
};

export default InventoryArchivePage;
