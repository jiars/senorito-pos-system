import React from 'react';

const MenuHeader = ({ setIsCategoriesModalOpen, setIsAddMenuItemModalOpen, navigate }) => {
    return (
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
    );
};

export default MenuHeader;
