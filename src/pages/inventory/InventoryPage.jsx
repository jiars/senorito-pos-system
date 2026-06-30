import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '../../components/ui/Checkbox/Checkbox';
import AddInventoryItemModal from './modals/Add Inventory Item/AddInventoryItemModal';
import ManageCategoriesModal from './modals/Manage Categories/ManageCategoriesModal';
import PrintQRCodeModal from './modals/Print QR/PrintQRCodeModal';
import ArchiveItemModal from './modals/Archive Item/ArchiveItemModal';
import EditItemModal from './modals/Edit Item/EditItemModal';
import BatchesModal from './modals/Batches/BatchesModal';
import StockHistoryModal from './modals/Stock History/StockHistoryModal';
import StockLogModal from './modals/Stock Log/StockLogModal';
import './inventory.css';

/* ═══════════════════════════════════════════════════
   Placeholder Data
═══════════════════════════════════════════════════ */

const summaryCards = [
  { id: 'total', icon: 'bi-box-seam', value: '25', label: 'Total Items', color: 'dark' },
  { id: 'instock', icon: 'bi-check-square', value: '1', label: 'In-Stock', color: 'green' },
  { id: 'lowstock', icon: 'bi-graph-down-arrow', value: '1', label: 'Low Stock', color: 'yellow' },
  { id: 'outofstock', icon: 'bi-x-square', value: '2', label: 'Out of Stock', color: 'red' },
  { id: 'expiring', icon: 'bi-clock-history', value: '4', label: 'Expiring Soon', color: 'blue' },
  { id: 'expired', icon: 'bi-exclamation-triangle', value: '5', label: 'Expired Items', color: 'darkred' },
];

const inventoryData = [
  { id: 1, name: '12oz hot cup', category: 'Packaging', qty: 142, unit: 'pcs', minLevel: 80, status: 'In-stock', expiry: null, lastUpdatedDate: 'Mar 7, 8:10 AM', lastUpdatedReason: 'PO Received' },
  { id: 2, name: '16oz cup', category: 'Packaging', qty: 189, unit: 'pcs', minLevel: 90, status: 'In-stock', expiry: null, lastUpdatedDate: 'Mar 6, 8:18 AM', lastUpdatedReason: 'Correction' },
  { id: 3, name: '22oz cup', category: 'Packaging', qty: 178, unit: 'pcs', minLevel: 85, status: 'In-stock', expiry: null, lastUpdatedDate: 'Mar 8, 9:45 AM', lastUpdatedReason: 'Restock' },
  { id: 4, name: 'Brownie', category: 'Ingredient', qty: 21, unit: 'pcs', minLevel: 5, status: 'In-stock', expiry: 'Expiring Soon', expiryDate: 'Mar 18, 2026', expiryDays: '3d', lastUpdatedDate: 'Mar 6, 8:30 AM', lastUpdatedReason: 'Correction' },
  { id: 5, name: 'Chocolate chips', category: 'Ingredient', qty: 46, unit: 'kg', minLevel: 20, status: 'In-stock', expiry: 'Good', expiryDate: 'Mar 26, 2026', expiryDays: '11d', lastUpdatedDate: 'Mar 4, 11:11 AM', lastUpdatedReason: 'PO Received' },
  { id: 6, name: 'Chocolate sauce', category: 'Ingredient', qty: 35, unit: 'bottle', minLevel: 20, status: 'In-stock', expiry: 'Good', expiryDate: 'Apr 9, 2026', expiryDays: '25d', lastUpdatedDate: 'Mar 6, 9:23 AM', lastUpdatedReason: 'Correction' },
  { id: 7, name: 'Cocoa Powder', category: 'Ingredient', qty: 42, unit: 'kg', minLevel: 25, status: 'In-stock', expiry: 'Good', expiryDate: 'Aug 2, 2026', expiryDays: '140d', lastUpdatedDate: 'Mar 4, 9:43 AM', lastUpdatedReason: 'PO Received' },
  { id: 8, name: 'Coffee beans', category: 'Ingredient', qty: 75, unit: 'kg', minLevel: 35, status: 'In-stock', expiry: 'Good', expiryDate: 'May 5, 2026', expiryDays: '51d', lastUpdatedDate: 'Mar 6, 1:18 PM', lastUpdatedReason: 'Sale' },
  { id: 9, name: 'Cookie', category: 'Ingredient', qty: 28, unit: 'pcs', minLevel: 40, status: 'Low Stock', expiry: 'Expiring Soon', expiryDate: 'Mar 19, 2026', expiryDays: '4d', lastUpdatedDate: 'Mar 6, 2:58 PM', lastUpdatedReason: 'Correction' },
  { id: 10, name: 'Cooking Oil', category: 'Ingredient', qty: 33, unit: 'bottle', minLevel: 25, status: 'In-stock', expiry: 'Good', expiryDate: 'Jun 5, 2026', expiryDays: '82d', lastUpdatedDate: 'Mar 2, 9:43 AM', lastUpdatedReason: 'Correction' },
  { id: 11, name: 'Food Container', category: 'Ingredient', qty: 0, unit: 'pcs', minLevel: 200, status: 'Out of Stock', expiry: null, lastUpdatedDate: 'Mar 5, 3:38 PM', lastUpdatedReason: 'Sale' },
  { id: 12, name: 'Frappe base', category: 'Ingredient', qty: 57, unit: 'bottle', minLevel: 40, status: 'In-stock', expiry: 'Expired', expiryDate: 'Mar 14, 2026', expiryDays: '-1d', lastUpdatedDate: 'Mar 4, 8:12 AM', lastUpdatedReason: 'Wastage' },
  { id: 13, name: 'Garlic', category: 'Ingredient', qty: 12, unit: 'kg', minLevel: 10, status: 'In-stock', expiry: 'Expired', expiryDate: 'Mar 13, 2026', expiryDays: '-2d', lastUpdatedDate: 'Mar 6, 4:18 PM', lastUpdatedReason: 'Wastage' },
  { id: 14, name: 'Hungarian sausage', category: 'Ingredient', qty: 67, unit: 'pack', minLevel: 35, status: 'In-stock', expiry: 'Expiring Soon', expiryDate: 'Mar 26, 2026', expiryDays: '11d', lastUpdatedDate: 'Mar 5, 9:05 AM', lastUpdatedReason: 'PO Received' },
];

/* ═══════════════════════════════════════════════════
   Inventory Page Component
═══════════════════════════════════════════════════ */

const InventoryPage = () => {
  const [selectedItems, setSelectedItems] = useState([]);
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

  const toggleSelectAll = () => {
    if (selectedItems.length === inventoryData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventoryData.map(item => item.id));
    }
  };

  const toggleItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

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
      <div
        className="inventory-expiry-cell"
        style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        onClick={() => {
          setSelectedBatchesItem(item);
          setIsBatchesModalOpen(true);
        }}
        title="View Batches"
      >
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
      {/* ───── Page Header: Title + Actions ───── */}
      <div className="inventory-page-header">
        <div className="layout-page-heading">
          <h2>Inventory Management</h2>
          <p>Manage and monitor your products, ingredients, and packaging materials.</p>
        </div>

        <div className="inventory-header-actions">
          <button
            className="inventory-btn"
            onClick={() => setIsPrintQRModalOpen(true)}
            disabled={selectedItems.length === 0}
          >
            <i className="bi bi-qr-code"></i>
            Print QR Code
          </button>
          <button className="inventory-btn" onClick={() => navigate('/inventory/archive')}>
            <i className="bi bi-archive"></i>
            View archived items
          </button>
          <button className="inventory-btn" onClick={() => setIsManageCategoriesOpen(true)}>
            <i className="bi bi-tag"></i>
            Manage Categories
          </button>
          <button className="inventory-btn inventory-btn--primary" onClick={() => setIsAddModalOpen(true)}>
            <i className="bi bi-plus-circle"></i>
            Add Item
          </button>
        </div>
      </div>

      {/* ───── Summary Cards ───── */}
      <div className="inventory-summary-cards">
        {summaryCards.map((card) => (
          <div
            key={card.id}
            className={`inventory-summary-card inventory-summary-card--${card.color}`}
          >
            <div className="inventory-summary-card-icon">
              <i className={`bi ${card.icon}`}></i>
            </div>
            <p className="inventory-summary-card-value">{card.value}</p>
            <p className="inventory-summary-card-label">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ───── Main Panel (Filters + Table) ───── */}
      <div className="inventory-panel">

        {/* Filters Bar */}
        <div className="inventory-filters-bar">
          <div className="inventory-search">
            <i className="bi bi-search"></i>
            <input type="text" placeholder="Search item..." />
          </div>

          <select className="inventory-filter-select">
            <option>All Categories</option>
            <option>Ingredient</option>
            <option>Packaging</option>
          </select>

          <select className="inventory-filter-select">
            <option>All Status</option>
            <option>In-stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>

          <select className="inventory-filter-select">
            <option>All Expiry Status</option>
            <option>Good</option>
            <option>Expiring Soon</option>
            <option>Expired</option>
          </select>

          <button className="inventory-reset-btn">
            Reset
          </button>
        </div>

        {/* Inventory Table */}
        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <Checkbox
                    checked={selectedItems.length === inventoryData.length && inventoryData.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Min Level</th>
                <th>Status</th>
                <th>Expiry Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((item) => (
                <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                  <td>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                    />
                  </td>
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
                    <p className="inventory-updated-date">{item.lastUpdatedDate}</p>
                    <span className="inventory-updated-reason">{item.lastUpdatedReason}</span>
                  </td>
                  <td>
                    <div className="inventory-actions">
                      <button
                        className="inventory-action-btn inventory-action-btn--view"
                        title="Stock Log"
                        onClick={() => {
                          setSelectedLogItem(item);
                          setIsLogModalOpen(true);
                        }}
                      >
                        <i className="bi bi-card-list"></i>
                      </button>
                      <button
                        className="inventory-action-btn inventory-action-btn--history"
                        title="History"
                        onClick={() => {
                          setSelectedHistoryItem(item);
                          setIsHistoryModalOpen(true);
                        }}
                      >
                        <i className="bi bi-clock-history"></i>
                      </button>
                      <button
                        className="inventory-action-btn inventory-action-btn--edit"
                        title="Edit Item"
                        onClick={() => {
                          setSelectedEditItem(item);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="inventory-action-btn inventory-action-btn--archive"
                        title="Archive Item"
                        onClick={() => {
                          setSelectedArchiveItem(item);
                          setIsArchiveModalOpen(true);
                        }}
                      >
                        <i className="bi bi-archive"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───── Modals ───── */}
      <AddInventoryItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingItems={inventoryData.map(item => item.name)}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
      />

      <PrintQRCodeModal
        isOpen={isPrintQRModalOpen}
        onClose={() => setIsPrintQRModalOpen(false)}
        selectedItems={inventoryData.filter(item => selectedItems.includes(item.id))}
      />

      <ArchiveItemModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          setSelectedArchiveItem(null);
        }}
        item={selectedArchiveItem}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditItem(null);
        }}
        item={selectedEditItem}
        existingItems={inventoryData.map(item => item.name)}
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
        item={selectedLogItem}
      />
    </div>
  );
};

export default InventoryPage;
