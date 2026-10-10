import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./main-layout.css";

const MainLayoutContent = () => {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();

  const isSidebarOpen = isMobile ? openMobile : open;

  return (
    <>
      <Sidebar />

      <div className="layout-content-wrapper">
        <Topbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="layout-main">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </>
  );
};

const MainLayout = () => {
  return (
    <TooltipProvider>
      <SidebarProvider className="layout-container">
        <MainLayoutContent />
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default MainLayout;
