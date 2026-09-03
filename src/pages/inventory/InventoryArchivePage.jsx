import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UnarchiveItemModal from './modals/Unarchive Item/UnarchiveItemModal';
import { fetchArchivedInventoryItems } from '../../services/inventory/inventoryItemsService';
import './inventory.css';
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
      {/* ───── Page Header ───── */}
      <div className="inventory-page-header">
        <div className="layout-page-heading">
          <h2>Inventory Archive</h2>
          <p>View archived inventory items and restore them when needed.</p>
        </div>

        <div className="inventory-header-actions">
          <button className="inventory-btn" onClick={() => navigate('/inventory')}>
            <i className="bi bi-arrow-left-square"></i>
            Back to Inventory
          </button>
        </div>
      </div>

      {/* ───── Inventory Panel (Filters + Table) ───── */}
      <div className="inventory-panel">
        {/* ───── Filters Bar ───── */}
        <div className="inventory-filters-bar">
          <div className="inventory-search">
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              placeholder="Search archived item..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="inventory-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option>All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            className="inventory-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>In-stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
          <select 
            className="inventory-filter-select"
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
          >
            <option>All Expiry Status</option>
            <option>Good</option>
            <option>Expiring Soon</option>
            <option>Expired</option>
            <option>Non-Perishable</option>
            <option>No Stock</option>
          </select>
          <button className="inventory-reset-btn" onClick={handleReset}>Reset</button>
        </div>

        {/* ───── Table ───── */}
        <div className="inventory-table-wrapper">
          <table className="inventory-table" style={{ minWidth: '1300px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>NAME</th>
                <th style={{ width: '150px', textAlign: 'left' }}>CATEGORY</th>
                <th style={{ width: '110px', textAlign: 'center' }}>LAST QTY</th>
                <th style={{ width: '90px', textAlign: 'center' }}>UNIT</th>
                <th style={{ width: '120px', textAlign: 'center' }}>MIN LEVEL</th>
                <th style={{ width: '140px', textAlign: 'center' }}>LAST STATUS</th>
                <th style={{ width: '170px', textAlign: 'center' }}>LAST EXPIRY STATUS</th>
                <th style={{ width: '150px', textAlign: 'center' }}>ARCHIVED DATE</th>
                <th style={{ width: '160px', textAlign: 'center' }}>ARCHIVED BY</th>
                <th style={{ width: '100px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Loading archived items...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>No archived items found.</td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const stockStatus = item.current_stock > (item.minimum_level || 0) ? 'In-stock' : (item.current_stock === 0 ? 'Out of Stock' : 'Low Stock');

                  return (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'left' }}><strong>{item.item_name}</strong></td>
                      <td style={{ textAlign: 'left' }}>{item.inventory_categories?.category_name || '-'}</td>
                      <td style={{ textAlign: 'center', fontWeight: '500' }}>{item.current_stock || 0}</td>
                      <td style={{ textAlign: 'center' }}>{item.base_unit}</td>
                      <td style={{ textAlign: 'center' }}>{item.minimum_level}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`inventory-chip ${getStatusChipClass(stockStatus)}`}>
                          {stockStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>{renderExpiry(item)}</td>
                      <td style={{ textAlign: 'center' }}>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {item.profiles
                          ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim()
                          : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="inventory-action-btn inventory-archive-action-btn--restore"
                          onClick={() => {
                            setSelectedUnarchiveItem(item);
                            setIsUnarchiveModalOpen(true);
                          }}
                          title="Unarchive"
                        >
                          <i className="bi bi-box-arrow-up"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
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
