import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddAddonModal from './modals/Add Add-on/AddAddonModal';
import EditAddonModal from './modals/Edit Add-on/EditAddonModal';
import ConfirmDeleteAddonModal from './modals/Confirm Delete Add-on/ConfirmDeleteAddonModal';
import '../menuManagement.css';

/* ═══════════════════════════════════════════════════
   Placeholder Data
═══════════════════════════════════════════════════ */
const addonsData = [
  { id: 1, name: 'Extra Shot', price: '₱50.00', applicableTo: 'Hot Coffee, Iced Coffee', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 2, name: 'Syrup', price: '₱50.00', applicableTo: 'Non-coffee', recipeStatus: 'Ingredient archived', posStatus: 'Unavailable' },
  { id: 3, name: 'Sauce', price: '₱50.00', applicableTo: 'Hot Coffee, Iced Coffee', recipeStatus: 'Complete', posStatus: 'Available' },
  { id: 4, name: 'Nata', price: '₱50.00', applicableTo: 'Non-coffee', recipeStatus: 'Ingredient out of stock', posStatus: 'Unavailable' },
  { id: 5, name: 'Ice Cream', price: '₱50.00', applicableTo: 'Hot Coffee, Iced Coffee', recipeStatus: 'Complete', posStatus: 'Available' }
];

const ManageAddonsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAddonModalOpen, setIsAddAddonModalOpen] = useState(false);
  const [isEditAddonModalOpen, setIsEditAddonModalOpen] = useState(false);
  const [isDeleteAddonModalOpen, setIsDeleteAddonModalOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const navigate = useNavigate();

  const getPosStatusClass = (status) => {
    switch (status) {
      case 'Available': return 'menu-chip--available';
      case 'Unavailable': return 'menu-chip--unavailable';
      default: return '';
    }
  };

  const handleEditClick = (item) => {
    setSelectedAddon(item);
    setIsEditAddonModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedAddon(item);
    setIsDeleteAddonModalOpen(true);
  };

  return (
    <div className="menu-page">
      {/* ───── Page Header ───── */}
      <div className="menu-page-header">
        <div className="layout-page-heading">
          <h2>Manage Add-ons</h2>
          <p>Create and manage supplementary items like extra shots, syrups, and toppings.</p>
        </div>
        <div className="menu-header-actions">
          <button
            className="menu-btn"
            onClick={() => navigate('/menu')}
          >
            Back to Menu Management
          </button>
          <button 
            className="menu-btn menu-btn--primary"
            onClick={() => setIsAddAddonModalOpen(true)}
          >
            <i className="bi bi-plus-circle"></i> Add Add-ons
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
              placeholder="Search add-on..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="menu-filter-select">
            <option>All Categories</option>
            <option>Hot Coffee</option>
            <option>Iced Coffee</option>
            <option>Non-coffee</option>
          </select>

          <select className="menu-filter-select">
            <option>All Status</option>
            <option>Available</option>
            <option>Unavailable</option>
          </select>

          <button className="menu-reset-btn">Reset</button>
        </div>

        {/* ───── Table ───── */}
        <div className="menu-table-wrapper">
          <table className="menu-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Applicable To</th>
                <th>Recipe Status</th>
                <th>POS Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {addonsData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="menu-item-name">{item.name}</span>
                  </td>
                  <td>{item.price}</td>
                  <td>{item.applicableTo}</td>
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
                        title="Edit Add-on"
                        onClick={() => handleEditClick(item)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="menu-action-btn menu-action-btn--archive"
                        title="Delete Add-on"
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

      <AddAddonModal 
        isOpen={isAddAddonModalOpen}
        onClose={() => setIsAddAddonModalOpen(false)}
      />

      <EditAddonModal 
        isOpen={isEditAddonModalOpen}
        onClose={() => setIsEditAddonModalOpen(false)}
        addon={selectedAddon}
      />

      <ConfirmDeleteAddonModal 
        isOpen={isDeleteAddonModalOpen}
        onClose={() => setIsDeleteAddonModalOpen(false)}
        addon={selectedAddon}
      />
    </div>
  );
};

export default ManageAddonsPage;
