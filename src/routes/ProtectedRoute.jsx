import { Link, Navigate, useLocation } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import StatusFeedback from "@/components/feedback/status/StatusFeedback";
import { getInventoryQrReturnPath } from "@/utils/auth/loginRedirect";
import { getInventoryAccessDeniedFeedback } from "@/utils/auth/feedback/loginFeedback";

import { formatRoleKey } from "@/utils/shared/formatters/stringFormatters";

import { useAuth } from "../hooks/useAuth";
import { ROLE_ROUTES } from "./roleRoutes";

const ProtectedRoute = ({ children }) => {
  const { user, role } = useAuth();
  const location = useLocation();
  const qrReturnPath = getInventoryQrReturnPath(location.pathname + location.search);

  if (user === null) {
    const loginParams = new URLSearchParams();
    if (qrReturnPath) loginParams.set("returnTo", qrReturnPath);
    const loginUrl = qrReturnPath ? `/login?${loginParams.toString()}` : "/login";
    return <Navigate to={loginUrl} replace />;
  }

  let userRoleKey = formatRoleKey(role);

  const allowedRoutes = ROLE_ROUTES[userRoleKey];

  let isAllowed = false;
  if (allowedRoutes !== undefined) {
    for (let i = 0; i < allowedRoutes.length; i++) {
      const route = allowedRoutes[i];
      if (location.pathname.startsWith(route)) {
        isAllowed = true;
      }
    }
  }

  if (isAllowed === false) {
    console.warn(`Access Denied: ${role} cannot access ${location.pathname}`);
    if (qrReturnPath) {
      return (
        <main className="grid min-h-svh place-items-center bg-[var(--app-color-canvas)] p-[var(--app-space-6)]">
          <PageLayout title="Access denied" subtitle="This QR link requires Inventory access." className="grid w-full max-w-lg gap-[var(--app-gap-section)]">
            <StatusFeedback feedback={getInventoryAccessDeniedFeedback()} />
            <Link to="/dashboard" replace className="inline-flex min-h-[var(--app-touch-target-min)] items-center justify-center rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-white hover:bg-[var(--app-color-brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]">Back to dashboard</Link>
          </PageLayout>
        </main>
      );
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
