import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { formatRoleKey } from '../../utils/stringFormatters';

import senoritoLogo from '../../assets/images/senorito_logo.png';
import ConfirmLogoutModal from './modals/Confirm Logout/ConfirmLogoutModal';

import { useAuth } from '../../hooks/useAuth';
import { ROLE_ROUTES } from '../../routes/roleRoutes';

import './layout.css';

const Sidebar = ({ isOpen, onClose }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, role } = useAuth();

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true); // 1. Spin the button instantly!

    await logout(); // 2. Wait for Laravel (the 0.5s travel time)

    window.location.href = '/login'; // 3. Hard Reload securely!
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'bi-grid-1x2-fill' },
    { name: 'Point of Sale', path: '/pos', icon: 'bi-calculator' },
    { name: 'Order History', path: '/orders', icon: 'bi-clock-history' },
    { name: 'Inventory Management', path: '/inventory', icon: 'bi-box-seam' },
    { name: 'Inventory Valuation', path: '/inventory/valuation', icon: 'bi-clipboard-data' },
    { name: 'Inventory Audit Log', path: '/inventory/audit', icon: 'bi-journal-check' },
    { name: 'Sales Report', path: '/reports/sales', icon: 'bi-graph-up-arrow' },
    { name: 'Expense Tracking', path: '/expenses', icon: 'bi-wallet2' },
    { name: 'Menu Management', path: '/menu', icon: 'bi-journal-richtext' },
    { name: 'Employee Management', path: '/employees', icon: 'bi-people' },
  ];

  let userRoleKey = formatRoleKey(role);

  const allowedRoutes = ROLE_ROUTES[userRoleKey];

  const visibleNavItems = navItems.filter((item) => allowedRoutes.includes(item.path));

  return (
    <>
      <aside className={`layout-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="layout-sidebar-header">

          <div className="layout-sidebar-brand">
            <h2>Señorito Café</h2>
            <p>POS & Inventory</p>
          </div>
        </div>

        <nav className="layout-sidebar-nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `layout-sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <i className={`bi ${item.icon}`}></i>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="layout-sidebar-footer">
          <button onClick={handleLogoutClick} className="layout-logout-btn">
            <i className="bi bi-box-arrow-left"></i>
            Logout
          </button>
        </div>
      </aside>

      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

export default Sidebar;
