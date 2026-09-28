import { Navigate, useLocation } from "react-router-dom";

import { formatRoleKey } from "../utils/stringFormatters";

import { useAuth } from "../hooks/useAuth";
import { ROLE_ROUTES } from "./roleRoutes";

const ProtectedRoute = ({ children }) => {
  const { user, role } = useAuth();
  const location = useLocation();

  if (user === null) return <Navigate to="/login" replace />;

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
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
