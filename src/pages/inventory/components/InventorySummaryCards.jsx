import React from 'react';

const InventorySummaryCards = ({
    totalItemsCount,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    expiringSoonCount = 0,
    expiredCount = 0
}) => {
    return (
        <div className="inventory-summary-cards">
            {/* Total Items Card */}
            <div className="inventory-summary-card inventory-summary-card--dark">
                <div className="inventory-summary-card-icon">
                    <i className="bi bi-box-seam"></i>
                </div>
                <p className="inventory-summary-card-value">{totalItemsCount}</p>
                <p className="inventory-summary-card-label">Total Items</p>
            </div>

            {/* In-Stock Card */}
            <div className="inventory-summary-card inventory-summary-card--green">
                <div className="inventory-summary-card-icon">
                    <i className="bi bi-check-square"></i>
                </div>
                <p className="inventory-summary-card-value">{inStockCount}</p>
                <p className="inventory-summary-card-label">In-Stock</p>
            </div>

            {/* Low Stock Card */}
            <div className="inventory-summary-card inventory-summary-card--yellow">
                <div className="inventory-summary-card-icon">
                    <i className="bi bi-graph-down-arrow"></i>
                </div>
                <p className="inventory-summary-card-value">{lowStockCount}</p>
                <p className="inventory-summary-card-label">Low Stock</p>
            </div>

            {/* Out of Stock Card */}
            <div className="inventory-summary-card inventory-summary-card--red">
                <div className="inventory-summary-card-icon">
                    <i className="bi bi-x-square"></i>
                </div>
                <p className="inventory-summary-card-value">{outOfStockCount}</p>
                <p className="inventory-summary-card-label">Out of Stock</p>
            </div>

            {/* Expiring Soon Card */}
            <div className="inventory-summary-card inventory-summary-card--blue">
                <div className="inventory-summary-card-icon">
                    <i className="bi bi-clock-history"></i>
                </div>
                <p className="inventory-summary-card-value">{expiringSoonCount}</p>
                <p className="inventory-summary-card-label">Expiring Soon</p>
            </div>

            {/* Expired Card */}
            <div className="inventory-summary-card inventory-summary-card--darkred">
                <div className="inventory-summary-card-icon">
                    <i className="bi bi-exclamation-triangle"></i>
                </div>
                <p className="inventory-summary-card-value">{expiredCount}</p>
                <p className="inventory-summary-card-label">Expired</p>
            </div>
        </div>
    );
};

export default InventorySummaryCards;
