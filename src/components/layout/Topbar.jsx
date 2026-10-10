import { Button } from "../ui/button";

import { useAuth } from "../../hooks/useAuth";
import { useOfflineQueue } from "../../hooks/sync/useOfflineQueue";
import { useOfflineSyncState } from "../../hooks/sync/useOfflineSync";
import { useBrowserOnline } from "../../hooks/sync/useBrowserOnline";
import {
  buildSyncStatusInput,
  getSyncStatus,
} from "../../utils/sync/syncStatus";

import SyncStatusButton from "./sync/SyncStatusButton";

import "./topbar.css";

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
  const isBrowserOnline = useBrowserOnline();

  const { profile } = useAuth();
  const queue = useOfflineQueue(profile.id);
  const sync = useOfflineSyncState(profile.id);

  // Display observed progress only; POS still owns the upload workflow.
  const syncStatusInput = buildSyncStatusInput({ isBrowserOnline, queue, sync });
  let syncStatus = getSyncStatus(syncStatusInput);

  // Never let a success confirmation hide pending work or a connection error.
  if (syncStatus.key === "online" && sync.showSyncedConfirmation) {
    syncStatus = { key: "synced", label: "Synced" };
  }

  return (
    <header className="layout-topbar">
      <div className="layout-topbar-left">
        <Button
          data-sidebar="trigger"
          type="button"
          size="icon-lg"
          className={`layout-hamburger-btn ${isSidebarOpen ? "is-active" : ""}`}
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          aria-expanded={isSidebarOpen}
        >
          <i className="bi bi-layout-sidebar" aria-hidden="true"></i>
        </Button>
      </div>

      <div className="layout-topbar-right">
        <SyncStatusButton
          key={profile.id}
          cashierId={profile.id}
          statusKey={syncStatus.key}
          label={syncStatus.label}
          state={syncStatusInput}
          queue={queue}
        />
      </div>
    </header>
  );
};

export default Topbar;
