import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { formatFullName, formatInitials } from "@/utils/shared/formatters/stringFormatters";
import { useAuth } from "../../hooks/useAuth";
import { useOfflineQueue } from "../../hooks/sync/useOfflineQueue";
import { useOfflineSyncState } from "../../hooks/sync/useOfflineSync";
import { useBrowserOnline } from "../../hooks/sync/useBrowserOnline";
import {
  buildSyncStatusInput,
  getSyncStatus,
} from "../../utils/sync/syncStatus";

import ConfirmLogoutModal from "./modals/Confirm Logout/ConfirmLogoutModal";
import SyncStatusButton from "./sync/SyncStatusButton";

import "./topbar.css";

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isBrowserOnline = useBrowserOnline();

  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const queue = useOfflineQueue(profile.id);
  const sync = useOfflineSyncState(profile.id);

  // Display observed progress only; POS still owns the upload workflow.
  const syncStatusInput = buildSyncStatusInput({ isBrowserOnline, queue, sync });
  let syncStatus = getSyncStatus(syncStatusInput);

  // Never let a success confirmation hide pending work or a connection error.
  if (syncStatus.key === "online" && sync.showSyncedConfirmation) {
    syncStatus = { key: "synced", label: "Synced" };
  }

  let fullName = formatFullName(profile.first_name, profile.last_name);
  let initials = formatInitials(profile.first_name, profile.last_name);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    window.location.href = "/login";
  };

  return (
    <>
      <header className="layout-topbar">
        <div className="layout-topbar-left">
          <Button
            type="button"
            size="icon-lg"
            className={`layout-hamburger-btn ${isSidebarOpen ? "is-active" : ""}`}
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
          >
            <i className="bi bi-list" aria-hidden="true"></i>
          </Button>
        </div>

        <div className="layout-topbar-right">
          <SyncStatusButton
            key={profile.id}
            statusKey={syncStatus.key}
            label={syncStatus.label}
            state={syncStatusInput}
            queue={queue}
          />

          <DropdownMenu>
            <DropdownMenuTrigger
              className="layout-user-profile"
              aria-label={`Open account menu for ${fullName}`}
            >
              <Avatar size="lg" className="layout-user-avatar">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <span className="layout-user-name">{fullName}</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <i className="bi bi-person" aria-hidden="true"></i>
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogoutClick}
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

export default Topbar;
