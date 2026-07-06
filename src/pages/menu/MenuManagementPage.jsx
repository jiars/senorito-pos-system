import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMenu } from '../../hooks/useMenu';
import { formatCurrency } from '../../utils/currencyFormatters';

import ManageMenuCategoriesModal from './modals/Menu Categories/ManageMenuCategoriesModal';
import AddMenuItemModal from './modals/Add Menu Item/AddMenuItemModal';
import EditMenuItemModal from './modals/Edit Menu Item/EditMenuItemModal';
import ConfirmDeleteMenuItemModal from './modals/Confirm Delete Menu Item/ConfirmDeleteMenuItemModal';

import './menuManagement.css';

const MenuManagementPage = () => {
  const { menuItems, isLoading, refetchMenu } = useMenu();

  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isEditMenuItemModalOpen, setIsEditMenuItemModalOpen] = useState(false);
  const [isDeleteMenuItemModalOpen, setIsDeleteMenuItemModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const navigate = useNavigate();

  const getPosStatusClass = (status) => {
    switch (status) {
      case 'Available': return 'menu-chip--available';
      case 'Unavailable': return 'menu-chip--unavailable';
      default: return '';
    }
  };

  const handleEditClick = (item) => {
    setSelectedMenuItem(item);
    setIsEditMenuItemModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedMenuItem(item);
    setIsDeleteMenuItemModalOpen(true);
  };

  // ─── FILTER LOGIC ───
  const filteredMenuItems = menuItems.filter((item) => {
    // 1. Check Search Term
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // 2. Check Status Filter
    if (statusFilter === 'Available' && item.is_available === false) {
      return false;
    }
    if (statusFilter === 'Unavailable' && item.is_available === true) {
      return false;
    }

    // If it passes both checks, keep it in the list!
    return true;
  });


  return (
    <div className="menu-page">
      {isLoading && (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fff', marginBottom: '20px', borderRadius: '8px' }}>
          Loading menu items from database...
        </div>
      )}
      {/* ───── Page Header ───── */}
      <div className="menu-page-header">
        <div className="layout-page-heading">
          <h2>Menu Management</h2>
          <p>Create, edit, and manage all your menu items, categories, and prices here.</p>
        </div>

        <div className="menu-header-actions">
          <button
            className="menu-btn"
            title="Manage Categories"
            onClick={() => setIsCategoriesModalOpen(true)}
          >
            <i className="bi bi-tag"></i>
            Manage Categories
          </button>
          <button
            className="menu-btn"
            title="Manage Add-ons"
            onClick={() => navigate('/menu/addons')}
          >
            Manage Add-ons
          </button>
          <button
            className="menu-btn menu-btn--primary"
            onClick={() => setIsAddMenuItemModalOpen(true)}
          >
            <i className="bi bi-plus-circle"></i> Add Menu Item
          </button>
        </div>
      </div>

      {/* ───── Main Panel (Filters + Table) ───── */}
      <div className="menu-panel">
        {/* ───── Filters & Search ───── */}
        <div className="menu-filters-bar">
          <div className="menu-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search menu item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="menu-filter-select">
            <option value="all">All Categories</option>
            <option value="Frappuccino">Frappuccino</option>
            <option value="Non-coffee">Non-coffee</option>
            <option value="Pastry">Pastry</option>
            <option value="Hot Coffee">Hot Coffee</option>
            <option value="Rice Meal">Rice Meal</option>
            <option value="Iced Coffee">Iced Coffee</option>
          </select>

          <select
            className="menu-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>


          <button className="menu-reset-btn">Reset</button>
        </div>

        {/* ───── Table ───── */}
        <div className="menu-table-wrapper">
          <table className="menu-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price/Variants</th>
                <th>Recipe Status</th>
                <th>POS Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenuItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="menu-item-name">{item.name}</span>
                  </td>
                  <td>{item.category?.name || 'Uncategorized'}</td>
                  <td>{item.variants && item.variants.length > 0 ? formatCurrency(item.variants[0].selling_price) : 'N/A'}</td>
                  <td>Complete</td>
                  <td>
                    <span className={`menu-chip ${getPosStatusClass(item.is_available ? 'Available' : 'Unavailable')}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="menu-actions">
                      <button
                        className="menu-action-btn menu-action-btn--edit"
                        title="Edit Item"
                        onClick={() => handleEditClick(item)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="menu-action-btn menu-action-btn--archive"
                        title="Delete Item"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <i className="bi bi-trash"></i>
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
      <ManageMenuCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />

      <AddMenuItemModal
        isOpen={isAddMenuItemModalOpen}
        onClose={() => setIsAddMenuItemModalOpen(false)}
      />

      <EditMenuItemModal
        isOpen={isEditMenuItemModalOpen}
        onClose={() => {
          setIsEditMenuItemModalOpen(false);
          setSelectedMenuItem(null);
        }}
        item={selectedMenuItem}
      />

      <ConfirmDeleteMenuItemModal
        isOpen={isDeleteMenuItemModalOpen}
        onClose={() => {
          setIsDeleteMenuItemModalOpen(false);
          setSelectedMenuItem(null);
        }}
        item={selectedMenuItem}
      />
    </div>
  );
};

export default MenuManagementPage;
