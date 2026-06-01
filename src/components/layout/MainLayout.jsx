import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './layout.css';

/**
 * MainLayout — Reusable layout wrapper for all authenticated pages.
 * 
 * Usage:
 *   <MainLayout>
 *     <DashboardPage />
 *   </MainLayout>
 * 
 * Each page renders its own title using the reusable .layout-page-heading class.
 */
const MainLayout = ({ children }) => {
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
        className={`layout-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={closeSidebar}
        aria-hidden="true"
      ></div>

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="layout-content-wrapper">
        <Topbar toggleSidebar={toggleSidebar} />
        
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
