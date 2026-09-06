import React from 'react';

const ManageAddonsHeader = ({ setIsAddAddonModalOpen, navigate }) => {
  return (
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
  );
};

export default ManageAddonsHeader;
