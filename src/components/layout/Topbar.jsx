import React from 'react';
import { useNavigate } from 'react-router-dom';
import './layout.css';


const Topbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <header className="layout-topbar">
      <div className="layout-topbar-left">
        <button
          className="layout-hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      <div className="layout-topbar-right">
        <div
          className="layout-user-profile"
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
        >
          <div className="layout-user-avatar">
            SU
          </div>
          <div className="layout-user-info">
            <p className="layout-user-name">Jane Velarde Mayorga</p>
            <p className="layout-user-role">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
