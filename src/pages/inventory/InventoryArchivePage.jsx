import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UnarchiveItemModal from './modals/Unarchive Item/UnarchiveItemModal';
import './inventoryArchive.css';

const archivedData = [
  { id: 1, name: '12oz hot cup', category: 'Packaging', qty: 142, unit: 'pcs', minLevel: 80, status: 'In-stock', expiry: null, archivedDate: 'Mar 7, 9:18 AM', reason: 'PO Received', archivedBy: 'Lyanna Magtuloy' },
  { id: 2, name: '16oz cup', category: 'Packaging', qty: 189, unit: 'pcs', minLevel: 90, status: 'In-stock', expiry: null, archivedDate: 'Mar 5, 8:18 AM', reason: 'Correction', archivedBy: 'Lyanna Magtuloy' },
  { id: 3, name: '22oz cup', category: 'Packaging', qty: 178, unit: 'pcs', minLevel: 85, status: 'In-stock', expiry: null, archivedDate: 'Mar 8, 9:45 AM', reason: 'Restock', archivedBy: 'Lyanna Magtuloy' }
];

const InventoryArchivePage = () => {
  const [isUnarchiveModalOpen, setIsUnarchiveModalOpen] = useState(false);
  const [selectedUnarchiveItem, setSelectedUnarchiveItem] = useState(null);
  const navigate = useNavigate();

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
            {archivedData.map(item => (
              <tr key={item.id}>
                <td className="inventory-item-name">{item.name}</td>
                <td>{item.category}</td>
                <td>{item.qty}</td>
                <td>{item.unit}</td>
                <td>{item.minLevel}</td>
                <td>
                  <span className={`inventory-chip ${getStatusChipClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  {renderExpiry(item)}
                </td>
                <td>
                  <p className="inventory-updated-date">{item.archivedDate}</p>
                  <span className="inventory-updated-reason">{item.reason}</span>
                </td>
                <td className="inventory-item-name">{item.archivedBy}</td>
                <td>
                  <div className="inventory-actions">
                    <button 
                      className="inventory-action-btn inventory-archive-action-btn--restore" 
                      title="Restore item" 
                      aria-label="Restore item"
                      onClick={() => {
                        setSelectedUnarchiveItem(item);
                        setIsUnarchiveModalOpen(true);
                      }}
                    >
                      <i className="bi bi-box-arrow-up"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
      />
    </div>
  );
};

export default InventoryArchivePage;
