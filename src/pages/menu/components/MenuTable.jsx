import React, { useState } from 'react';

import { formatCurrency } from '../../../utils/currencyFormatters';

const MenuTable = ({
    menuItems,
    categories,
    isLoading,
    handleEditClick,
    handleDeleteClick
}) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredMenuItems = menuItems.filter((item) => {
        if (searchTerm !== '') {
            const search = searchTerm.toLowerCase();
            const name = (item.item_name || '').toLowerCase();
            const categoryName = (item.menu_categories?.category_name || '').toLowerCase();
            
            if (!name.includes(search) && !categoryName.includes(search)) {
                return false;
            }
        }

        if (categoryFilter !== 'all') {
            let categoryName = item.menu_categories?.category_name;
            if (categoryName !== categoryFilter) {
                return false;
            }
        }

        if (statusFilter !== 'all') {
            if (item.pos_status !== statusFilter) {
                return false;
            }
        }

        return true;
    });

    return (
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

                <select
                    className="menu-filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {categories && categories.map((category) => (
                        <option key={category.id} value={category.category_name}>
                            {category.category_name}
                        </option>
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
                            <th style={{ width: '15%', textAlign: 'left' }}>Category</th>
                            <th style={{ width: '20%', textAlign: 'left' }}>Price/Variants</th>
                            <th style={{ width: '15%', textAlign: 'left' }}>Recipe Status</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>POS Status</th>
                            <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading menu items...</td>
                            </tr>
                        ) : filteredMenuItems.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No menu items found.</td>
                            </tr>
                        ) : (
                            filteredMenuItems.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <span className="menu-item-name">{item.item_name}</span>
                                    </td>
                                    <td>{item.menu_categories?.category_name}</td>
                                    <td>
                                        {item.menu_prices && item.menu_prices.length > 0 ? (
                                            <div className="menu-price-stack">
                                                {item.menu_prices.map(p => (
                                                    <span key={p.id || p.variant_name} className="menu-price-variant">
                                                        <strong>{formatCurrency(p.selling_price)}</strong> / {p.variant_name || 'regular'}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="menu-price-variant">none</span>
                                        )}
                                    </td>

                                    <td>{item.recipe_status}</td>
                                    <td>
                                        <span className={`menu-chip ${item.pos_status === 'Available' ? 'menu-chip--available' : 'menu-chip--unavailable'}`}>
                                            {item.pos_status}
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
                                                disabled={item.archived === true}
                                                style={{ opacity: item.archived ? 0.4 : 1, cursor: item.archived === true ? 'not-allowed' : 'pointer' }}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MenuTable;
