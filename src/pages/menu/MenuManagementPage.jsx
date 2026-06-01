import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageMenuCategoriesModal from './modals/Menu Categories/ManageMenuCategoriesModal';
import AddMenuItemModal from './modals/Add Menu Item/AddMenuItemModal';
import EditMenuItemModal from './modals/Edit Menu Item/EditMenuItemModal';
import ConfirmDeleteMenuItemModal from './modals/Confirm Delete Menu Item/ConfirmDeleteMenuItemModal';
import './menuManagement.css';

/* ═══════════════════════════════════════════════════
   Placeholder Data
═══════════════════════════════════════════════════ */
const menuData = [
  { id: 1, name: 'Chocolate Chip Frappe', category: 'Frappuccino', price: '₱159.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 2, name: 'Matcha Blend', category: 'Non-coffee', price: '₱159.00', recipeStatus: 'Ingredient archived', posStatus: 'Unavailable' },
  { id: 3, name: 'Brownies (2 pcs)', category: 'Pastry', price: '₱70.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 4, name: 'Chocolate Chip Cookie (1 pc)', category: 'Pastry', price: '₱60.00', recipeStatus: 'Ingredient out of stock', posStatus: 'Unavailable' },
  { id: 5, name: 'Creamy Oreo', category: 'Frappuccino', price: '₱129.00 - ₱149.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 6, name: 'Hot Americano (12oz)', category: 'Hot Coffee', price: '₱129.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 7, name: 'Hot Cafe Latte (12oz)', category: 'Hot Coffee', price: '₱149.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 8, name: 'Hot Spanish Latte (12oz)', category: 'Hot Coffee', price: '₱149.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 9, name: 'Hot White Mocha (12oz)', category: 'Hot Coffee', price: '₱149.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 10, name: 'Hungarian Morning', category: 'Rice Meal', price: '₱159.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 11, name: 'Iced Americano', category: 'Iced Coffee', price: '₱109.00 - ₱129.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 12, name: 'Iced Cafe Latte', category: 'Iced Coffee', price: '₱129.00 - ₱149.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 13, name: 'Iced Mocha Latte', category: 'Iced Coffee', price: '₱129.00 - ₱149.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 14, name: 'Iced Spanish Latte', category: 'Iced Coffee', price: '₱129.00 - ₱149.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 15, name: 'Milky Choco', category: 'Non-coffee', price: '₱129.00 - ₱149.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 16, name: 'Oreo Frappe (22oz)', category: 'Frappuccino', price: '₱159.00', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 17, name: 'Tocino Classic', category: 'Rice Meal', price: '₱159.00', recipeStatus: 'Complete', posStatus: 'Available' }
];

const MenuManagementPage = () => {
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isEditMenuItemModalOpen, setIsEditMenuItemModalOpen] = useState(false);
  const [isDeleteMenuItemModalOpen, setIsDeleteMenuItemModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  return (
    <div className="menu-page">
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

          <select className="menu-filter-select">
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
              {menuData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="menu-item-name">{item.name}</span>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.price}</td>
                  <td>{item.recipeStatus}</td>
                  <td>
                    <span className={`menu-chip ${getPosStatusClass(item.posStatus)}`}>
                      {item.posStatus}
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
