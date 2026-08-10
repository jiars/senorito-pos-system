import React, { useState } from 'react';
import { Checkbox } from '../../../components/ui/Checkbox/Checkbox';
import { getExpiryInfo } from '../../../utils/inventoryExpiryUtils';

const InventoryTable = ({
    inventoryItems,
    categories = [],
    isLoading,
    selectedItems,
    toggleSelectAll,
    toggleItem,
    setSelectedLogItem,
    setIsLogModalOpen,
    setSelectedHistoryItem,
    setIsHistoryModalOpen,
    setSelectedEditItem,
    setIsEditModalOpen,
    setSelectedArchiveItem,
    setIsArchiveModalOpen
}) => {
    // 1. Gawa tayo ng State para sa mga Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [expiryFilter, setExpiryFilter] = useState('All Expiry Status');

    // 2. Helper function para makuha yung status
    const getComputedStatus = (item) => {
        if (item.current_stock === 0) return 'Out of Stock';
        if (item.current_stock <= item.minimum_level) return 'Low Stock';
        return 'In-stock';
    };

    const getStatusChipClass = (status) => {
        switch (status) {
            case 'In-stock': return 'inventory-chip--instock';
            case 'Low Stock': return 'inventory-chip--lowstock';
            case 'Out of Stock': return 'inventory-chip--outofstock';
            default: return '';
        }
    };

    const getExpiryChipClass = (status) => {
        switch (status) {
            case 'Good': return 'inventory-chip--good';
            case 'Expiring Soon': return 'inventory-chip--expiring';
            case 'Expired': return 'inventory-chip--expired';
            case 'Non-Perishable': return 'inventory-chip--good';
            case 'No Stock': return 'inventory-chip--outofstock';
            default: return '';
        }
    };

    const getLastUpdatedInfo = (item) => {
        const logs = item.inventory_audit_logs || [];
        if (logs.length === 0) return null;

        const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const latest = sortedLogs[0];
        const dateObj = new Date(latest.created_at);
        const dateStr = dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

        return { date: dateStr, action: latest.action };
    };

    // 3. Logic para i-filter yung items based sa pinili sa dropdown/search
    const filteredItems = inventoryItems.filter((item) => {
        const matchesSearch = item.item_name.toLowerCase().startsWith(searchQuery.toLowerCase());

        const categoryName = item.inventory_categories?.category_name || '';
        const matchesCategory = categoryFilter === 'All Categories' || categoryName === categoryFilter;

        const computedStatus = getComputedStatus(item);
        const matchesStatus = statusFilter === 'All Status' || computedStatus === statusFilter;

        const expiryInfo = getExpiryInfo(item);
        const matchesExpiry = expiryFilter === 'All Expiry Status' || expiryInfo.status === expiryFilter;

        return matchesSearch && matchesCategory && matchesStatus && matchesExpiry;
    });

    const handleReset = () => {
        setSearchQuery('');
        setCategoryFilter('All Categories');
        setStatusFilter('All Status');
        setExpiryFilter('All Expiry Status');
    };

    return (
        <div className="inventory-panel">
            {/* Filters Bar */}
            <div className="inventory-filters-bar">
                <div className="inventory-search">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Search item..."
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
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.category_name}>
                            {cat.category_name}
                        </option>
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

                <button className="inventory-reset-btn" onClick={handleReset}>
                    Reset
                </button>
            </div>

            {/* Inventory Table */}
            <div className="inventory-table-wrapper">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px', textAlign: 'center' }}>
                                <Checkbox
                                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th style={{ textAlign: 'left' }}>Name</th>
                            <th style={{ textAlign: 'left' }}>Category</th>
                            <th style={{ textAlign: 'center' }}>Qty</th>
                            <th style={{ textAlign: 'center' }}>Unit</th>
                            <th style={{ textAlign: 'center' }}>Min Level</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                            <th style={{ textAlign: 'center' }}>Expiry Status</th>
                            <th style={{ textAlign: 'center' }}>Last Updated</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Loading inventory...</td>
                            </tr>
                        ) : filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>No inventory items match your filters.</td>
                            </tr>
                        ) : (
                            filteredItems.map((item) => {
                                const computedStatus = getComputedStatus(item);
                                const expiryInfo = getExpiryInfo(item);
                                const lastUpdatedInfo = getLastUpdatedInfo(item);

                                return (
                                    <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                        <td style={{ textAlign: 'center' }}>
                                            <Checkbox
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => toggleItem(item.id)}
                                            />
                                        </td>
                                        <td className="inventory-item-name" style={{ textAlign: 'left' }}>{item.item_name}</td>
                                        <td style={{ textAlign: 'left' }}>{item.inventory_categories?.category_name || '-'}</td>
                                        <td style={{ textAlign: 'center', fontWeight: '500' }}>{item.current_stock}</td>
                                        <td style={{ textAlign: 'center' }}>{item.base_unit}</td>
                                        <td style={{ textAlign: 'center' }}>{item.minimum_level}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`inventory-chip ${getStatusChipClass(computedStatus)}`}>
                                                {computedStatus}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {expiryInfo.status !== '-' ? (
                                                <div className="inventory-expiry-cell" style={{ justifyContent: 'center' }}>
                                                    <span className={`inventory-expiry-chip ${getExpiryChipClass(expiryInfo.status)}`}>
                                                        {expiryInfo.status}
                                                    </span>
                                                    <span className="inventory-expiry-detail">{expiryInfo.label}</span>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', color: '#6c757d' }}>-</div>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {lastUpdatedInfo ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <p className="inventory-updated-date" style={{ margin: 0 }}>{lastUpdatedInfo.date}</p>
                                                    <span className="inventory-updated-reason">{lastUpdatedInfo.action}</span>
                                                </div>
                                            ) : (
                                                <div style={{ color: '#6c757d' }}>-</div>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="inventory-actions" style={{ justifyContent: 'center' }}>
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
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryTable;
