import { Activity } from "react";
import { useLocation } from "react-router-dom";
import OfflineState from "@/components/feedback/data-state/OfflineState";
import { OfflinePageContext } from "@/context/offlinePageContext";
import { useBrowserOnline } from "@/hooks/sync/useBrowserOnline";
import { ROLE_ROUTES } from "@/routes/roleRoutes";
import { formatRoleKey } from "@/utils/shared/formatters/stringFormatters";

const OfflinePageGate = ({ role, children }) => {
  const { pathname } = useLocation();
  const isOnline = useBrowserOnline();
  const isPOSPage = pathname === "/pos" || pathname === "/pos/";
  const isBlocked = !isOnline && !isPOSPage;
  const allowedRoutes = ROLE_ROUTES[formatRoleKey(role)] || [];
  const canOpenPOS = allowedRoutes.includes("/pos");

  return (
    <>
      <OfflinePageContext.Provider value={isBlocked}>
        {/* Preserve the draft while pausing hidden page effects and focus traps. */}
        <Activity mode={isBlocked ? "hidden" : "visible"}>
          {children}
        </Activity>
      </OfflinePageContext.Provider>
      {isBlocked && <OfflineState canOpenPOS={canOpenPOS} />}
    </>
  );
};

export default OfflinePageGate;
