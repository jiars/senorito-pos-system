import { createContext } from "react";

// Only routed page popups are blocked; Sidebar and Topbar remain outside this scope.
export const OfflinePageContext = createContext(false);
