import React from 'react';
import { useNavigate } from 'react-router-dom';

import { formatFullName, formatInitials } from '../../utils/stringFormatters';

import { useAuth } from '../../hooks/useAuth';

import './layout.css';


const Topbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const { profile, role } = useAuth();

  let fullName = formatFullName(profile.first_name, profile.last_name);
  let initials = formatInitials(profile.first_name, profile.last_name);

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
            {initials.toUpperCase()}
          </div>
          <div className="layout-user-info">
            <p className="layout-user-name">{fullName}</p>
            <p className="layout-user-role">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
