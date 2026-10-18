import { useContext } from "react";
import { OfflinePageContext } from "@/context/offlinePageContext";

// Portals escape the page DOM, so they also need the page's offline visibility.
const PagePortal = ({ component: Portal, style, inert, ...props }) => {
  const isBlocked = useContext(OfflinePageContext);
  let portalStyle = style;
  if (isBlocked) portalStyle = { ...style, display: "none" };

  return (
    <Portal
      {...props}
      style={portalStyle}
      inert={isBlocked || inert}
    />
  );
};

export default PagePortal;
