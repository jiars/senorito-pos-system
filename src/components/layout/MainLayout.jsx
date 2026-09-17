import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";

import "./main-layout.css";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout-container">
      {/* Mobile overlay */}
      <div
        className={`layout-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      ></div>

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="layout-content-wrapper">
        <Topbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="layout-main">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
