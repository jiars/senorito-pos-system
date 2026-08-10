import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UnarchiveItemModal from './modals/Unarchive Item/UnarchiveItemModal';
import { fetchArchivedInventoryItems } from '../../services/inventory/inventoryItemsService';
import './inventoryArchive.css';

const InventoryArchivePage = () => {
  const [isUnarchiveModalOpen, setIsUnarchiveModalOpen] = useState(false);
  const [selectedUnarchiveItem, setSelectedUnarchiveItem] = useState(null);
  const [archivedItems, setArchivedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
            <input type="text" placeholder="Search archived item..." />
          </div>
          <select className="inventory-filter-select">
            <option>All Categories</option>
          </select>
          <select className="inventory-filter-select">
            <option>All Status</option>
          </select>
          <select className="inventory-filter-select">
            <option>All Expiry Status</option>
          </select>
          <button className="inventory-reset-btn">Reset</button>
        </div>

        {/* ───── Table ───── */}
        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>CATEGORY</th>
                <th>LAST QTY</th>
                <th>UNIT</th>
                <th>MIN LEVEL</th>
                <th>LAST STATUS</th>
                <th>LAST EXPIRY STATUS</th>
                <th>ARCHIVED DATE</th>
                <th>ARCHIVED BY</th>
                <th>ACTIONS</th>
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
              ) : archivedItems.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>No archived items found.</td>
                </tr>
              ) : (
                archivedItems.map(item => {
                  const stockStatus = item.current_stock > (item.minimum_level || 0) ? 'In-stock' : (item.current_stock === 0 ? 'Out of Stock' : 'Low Stock');

                  return (
                    <tr key={item.id}>
                      <td><strong>{item.item_name}</strong></td>
                      <td>{item.inventory_categories?.category_name || '-'}</td>
                      <td>{item.current_stock || 0}</td>
                      <td>{item.base_unit}</td>
                      <td>{item.minimum_level}</td>
                      <td>
                        <span className={`inventory-chip ${getStatusChipClass(stockStatus)}`}>
                          {stockStatus}
                        </span>
                      </td>
                      <td>{renderExpiry(item)}</td>
                      <td>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}</td>
                      <td>
                        {item.profiles
                          ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim()
                          : '-'}
                      </td>
                      <td>
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
