import React from 'react';
import { useNavigate } from 'react-router-dom';

const InventoryHeader = ({
    setIsPrintQRModalOpen,
    setIsArchiveModalOpen,
    setIsManageCategoriesOpen,
    setIsAddModalOpen,
    selectedItemsCount
}) => {
    const navigate = useNavigate();

    return (
        <div className="inventory-page-header">
            <div className="layout-page-heading">
                <h2>Inventory Management</h2>
                <p>Manage and monitor your products, ingredients, and packaging materials.</p>
            </div>

            <div className="inventory-header-actions">
                <button
                    className="inventory-btn"
                    onClick={() => setIsPrintQRModalOpen(true)}
                    disabled={selectedItemsCount === 0}
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
    );
};

export default InventoryHeader;
