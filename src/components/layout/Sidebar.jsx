import { useState } from "react";
import { NavLink } from "react-router-dom";

import { formatRoleKey } from "@/utils/shared/formatters/stringFormatters";

import sidebarLogo from "../../assets/images/white - senorito.png";

import ConfirmLogoutModal from "./modals/Confirm Logout/ConfirmLogoutModal";

import { useAuth } from "../../hooks/useAuth";

import { ROLE_ROUTES } from "../../routes/roleRoutes";
import {
  APP_ROUTE_METADATA,
  SIDEBAR_GROUP_ORDER,
} from "../../routes/routeMetadata";

import "./sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, role } = useAuth();

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    window.location.href = "/login";
  };

  let userRoleKey = formatRoleKey(role);

  const allowedRoutes = ROLE_ROUTES[userRoleKey];

  const visibleNavItems = APP_ROUTE_METADATA.filter((item) => {
    return item.showInSidebar === true && allowedRoutes.includes(item.path);
  });

  const visibleNavGroups = SIDEBAR_GROUP_ORDER.map((groupName) => {
    const groupItems = visibleNavItems.filter((item) => {
      return item.group === groupName;
    });

    return {
      name: groupName,
      items: groupItems,
    };
  }).filter((group) => {
    return group.items.length > 0;
  });

  return (
    <>
      <aside className={`layout-sidebar ${isOpen ? "open" : ""}`}>
        <div className="layout-sidebar-header">
          <div className="layout-sidebar-brand">
            <img
              className="layout-sidebar-logo"
              src={sidebarLogo}
              alt="Senorito Cafe"
            />
            <p>POS & Inventory</p>
          </div>
        </div>

        <nav className="layout-sidebar-nav">
          {visibleNavGroups.map((group) => (
            <div className="layout-sidebar-nav-group" key={group.name}>
              {group.name !== "Overview" && (
                <p className="layout-sidebar-nav-group-label">{group.name}</p>
              )}

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `layout-sidebar-nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                </NavLink>
              ))}
            </div>
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
