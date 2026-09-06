import React, { useState } from 'react';
import { formatCurrency } from '../../../../utils/currencyFormatters';

const ManageAddonsTable = ({ addons, categories, isLoading, handleEditClick, handleDeleteClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAddons = addons.filter((item) => {
    const search = searchTerm.toLowerCase();
    const name = (item.addon_name || '').toLowerCase();
    let categoryNamesString = '';
    if (item.addon_categories) {
      categoryNamesString = item.addon_categories.map(ac => ac.menu_categories ? ac.menu_categories.category_name.toLowerCase() : '').join(' ');
    }

    const matchesSearch = name.includes(search) || categoryNamesString.includes(search);

    let matchesCategory = false;
    if (categoryFilter === 'all') {
      matchesCategory = true;
    } else if (item.addon_categories) {
      for (let i = 0; i < item.addon_categories.length; i++) {
        const catObj = item.addon_categories[i].menu_categories;
        if (catObj && catObj.category_name === categoryFilter) {
          matchesCategory = true;
          break;
        }
      }
    }

    const matchesStatus = statusFilter === 'all' || item.pos_status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
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

        <select
          className="menu-filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.category_name}>{c.category_name}</option>
          ))}
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

        <button
          className="menu-reset-btn"
          onClick={() => {
            setSearchTerm('');
            setCategoryFilter('all');
            setStatusFilter('all');
          }}
        >
          Reset
        </button>
      </div>

      {/* ───── Table ───── */}
      <div className="menu-table-wrapper">
        <table className="menu-table">
          <thead>
            <tr>
              <th style={{ width: '25%', textAlign: 'left' }}>Name</th>
              <th style={{ width: '15%', textAlign: 'left' }}>Price</th>
              <th style={{ width: '35%', textAlign: 'left' }}>Applicable To</th>
              <th style={{ width: '10%', textAlign: 'center' }}>POS Status</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading add-ons...</td>
              </tr>
            ) : filteredAddons.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No add-ons found.</td>
              </tr>
            ) : (
              filteredAddons.map((item) => {
                let categoryNames = 'None';
                if (item.addon_categories && item.addon_categories.length > 0) {
                  const namesArray = item.addon_categories.map(ac => ac.menu_categories ? ac.menu_categories.category_name : '');
                  categoryNames = namesArray.join(', ');
                }

                return (
                  <tr key={item.id}>
                    <td>
                      <span className="menu-item-name">{item.addon_name}</span>
                    </td>
                    <td><strong>{formatCurrency(item.selling_price)}</strong></td>
                    <td>{categoryNames || 'None'}</td>
                    <td>
                      <span className={`menu-chip ${item.pos_status === 'Available' ? 'menu-chip--available' : 'menu-chip--unavailable'}`}>
                        {item.pos_status}
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
                          title={item.archived === true ? "Already Archived" : "Delete Add-on"}
                          onClick={() => handleDeleteClick(item)}
                          disabled={item.archived === true}
                          style={{ opacity: item.archived ? 0.4 : 1, cursor: item.archived === true ? 'not-allowed' : 'pointer' }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageAddonsTable;
