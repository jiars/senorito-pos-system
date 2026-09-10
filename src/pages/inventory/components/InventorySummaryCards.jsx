import React, { useMemo } from 'react';
import './inventorySummaryCards.css';

const InventorySummaryCards = ({ inventoryItems = [] }) => {
    // Dynamic Computations
    const stats = useMemo(() => {
        const totalItemsCount = inventoryItems.length;
        const inStockCount = inventoryItems.filter(item => item.current_stock > item.minimum_level).length;
        const lowStockCount = inventoryItems.filter(item => item.current_stock > 0 && item.current_stock <= item.minimum_level).length;
        const outOfStockCount = inventoryItems.filter(item => item.current_stock === 0).length;

        // Calculate "new items added this month"
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newItemsCount = inventoryItems.filter(item => {
            const itemDate = new Date(item.created_at);
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        }).length;

        // Calculate percentage
        const inStockPercentage = totalItemsCount === 0 ? 0 : Math.round((inStockCount / totalItemsCount) * 100);

        return {
            totalItemsCount,
            inStockCount,
            lowStockCount,
            outOfStockCount,
            newItemsCount,
            inStockPercentage
        };
    }, [inventoryItems]);

    return (
        <div className="inventory-summary-cards">
            {/* Total Items Card */}
            <div className="inventory-summary-card">
                <div className="inventory-card-content">
                    <p className="inventory-summary-card-label">Total Items</p>
                    <h2 className="inventory-summary-card-value" style={{ color: '#9d5a42' }}>{stats.totalItemsCount}</h2>
                    <p className="inventory-summary-card-subtext">
                        <strong style={{ color: '#59844f' }}>{stats.newItemsCount} new items</strong> added this month
                    </p>
                </div>
                <div className="inventory-summary-card-icon" style={{ backgroundColor: '#deb4a2', color: '#fff' }}>
                    <i className="bi bi-cup-hot-fill"></i>
                </div>
            </div>

            {/* In-Stock Items Card */}
            <div className="inventory-summary-card">
                <div className="inventory-card-content">
                    <p className="inventory-summary-card-label">In-Stock Items</p>
                    <h2 className="inventory-summary-card-value" style={{ color: '#9d5a42' }}>{stats.inStockCount}</h2>
                    <p className="inventory-summary-card-subtext">
                        <strong style={{ color: '#59844f' }}>{stats.inStockPercentage}%</strong> of inventory fully stocked
                    </p>
                </div>
                <div className="inventory-summary-card-icon" style={{ backgroundColor: '#d0dfb6', color: '#fff' }}>
                    <i className="bi bi-box-seam-fill"></i>
                </div>
            </div>

            {/* Low Stock Alerts Card */}
            <div className="inventory-summary-card">
                <div className="inventory-card-content">
                    <p className="inventory-summary-card-label">Low Stock Alerts</p>
                    <h2 className="inventory-summary-card-value" style={{ color: '#9d5a42' }}>{stats.lowStockCount}</h2>
                    <p className="inventory-summary-card-subtext">
                        <strong style={{ color: '#e0a944' }}>{stats.lowStockCount} items</strong> below minimum threshold
                    </p>
                </div>
                <div className="inventory-summary-card-icon" style={{ backgroundColor: '#eaba9f', color: '#fff' }}>
                    <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
            </div>

            {/* Out of Stock Card */}
            <div className="inventory-summary-card">
                <div className="inventory-card-content">
                    <p className="inventory-summary-card-label">Out of Stock</p>
                    <h2 className="inventory-summary-card-value" style={{ color: '#9d5a42' }}>{stats.outOfStockCount}</h2>
                    <p className="inventory-summary-card-subtext">
                        <strong style={{ color: '#d34343' }}>{stats.outOfStockCount} items</strong> currently unavailable
                    </p>
                </div>
                <div className="inventory-summary-card-icon" style={{ backgroundColor: '#c89d9e', color: '#fff' }}>
                    <i className="bi bi-box2-fill"></i>
                </div>
            </div>
        </div>
    );
};

export default InventorySummaryCards;
