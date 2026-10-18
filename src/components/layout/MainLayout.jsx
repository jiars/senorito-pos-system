import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";
import OfflinePageGate from "./OfflinePageGate";
import InventoryStartupGate from "./InventoryStartupGate";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./main-layout.css";

const MainLayoutContent = () => {
  const { role } = useAuth();
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();

  const isSidebarOpen = isMobile ? openMobile : open;

  return (
    <>
      <Sidebar />

      <div className="layout-content-wrapper">
        <Topbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="layout-main">
          <OfflinePageGate role={role}>
            <Breadcrumbs />
            <Outlet />
          </OfflinePageGate>
        </main>
      </div>
    </>
  );
};

const MainLayout = () => {
  const { user, role } = useAuth();

  return (
    <InventoryStartupGate key={user.id} userId={user.id} role={role}>
      <TooltipProvider>
        <SidebarProvider className="layout-container">
          <MainLayoutContent />
        </SidebarProvider>
      </TooltipProvider>
    </InventoryStartupGate>
  );
};

export default MainLayout;
