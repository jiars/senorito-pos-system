import { useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Sidebar as SidebarPanel,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

import { formatRoleKey } from "@/utils/shared/formatters/stringFormatters";
import { getLogoutInlineFeedback } from "@/utils/auth/feedback/logoutFeedback";
import { useFeedback } from "@/hooks/feedback/useFeedback";

import sidebarLogo from "../../assets/images/white - senorito.png";

import ConfirmLogoutModal from "./modals/Confirm Logout/ConfirmLogoutModal";
import SidebarUserMenu from "./SidebarUserMenu";

import { useAuth } from "../../hooks/useAuth";

import { ROLE_ROUTES } from "../../routes/roleRoutes";
import {
  APP_ROUTE_METADATA,
  SIDEBAR_GROUP_ORDER,
} from "../../routes/routeMetadata";

const Sidebar = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutInFlight = useRef(false);
  const accountTriggerRef = useRef(null);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getLogoutInlineFeedback);
  const { profile, logout, role } = useAuth();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isCollapsed = !isMobile && state === "collapsed";

  const closeDrawer = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogoutClick = () => {
    closeDrawer();
    clearFeedback();
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    if (logoutInFlight.current) return;
    setIsLogoutModalOpen(false);
    clearFeedback();
  };

  const restoreNavigationFocus = () => {
    if (!isMobile && accountTriggerRef.current) return accountTriggerRef.current;
    // The mobile account button unmounts when its drawer closes.
    return document.querySelector('[data-sidebar="trigger"]');
  };

  const handleProfileClick = () => {
    closeDrawer();
    navigate("/profile");
  };

  const confirmLogout = async () => {
    // Guard immediately, before React renders the disabled button.
    if (logoutInFlight.current) return;
    logoutInFlight.current = true;
    setIsLoggingOut(true);
    clearFeedback();

    try {
      await logout();
      window.location.href = "/login";
      // Stay blocked after success until the login page loads.
    } catch (error) {
      console.error("Sidebar logout failed:", error);
      logoutInFlight.current = false;
      setIsLoggingOut(false);
      showFeedback("LOGOUT_FAILED");
    }
  };

  let userRoleKey = formatRoleKey(role);

  const allowedRoutes = ROLE_ROUTES[userRoleKey];

  const visibleNavItems = APP_ROUTE_METADATA.filter((item) => {
    return item.showInSidebar === true && allowedRoutes.includes(item.path);
  });

  const visibleNavGroups = SIDEBAR_GROUP_ORDER.map((groupName) => {
    const groupItems = visibleNavItems.filter((item) => {
      return item.group === groupName;
    });

    return {
      name: groupName,
      items: groupItems,
    };
  }).filter((group) => {
    return group.items.length > 0;
  });

  return (
    <>
      <SidebarPanel collapsible="icon" variant="sidebar" className="layout-sidebar">
        <SidebarHeader className="items-center justify-center gap-[var(--app-space-4)] bg-[var(--app-color-brand-deep)] p-[var(--app-space-4)] text-[var(--app-color-surface)] group-data-[collapsible=icon]:p-[var(--app-space-2)]">
          {isMobile && (
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={closeDrawer}
              aria-label="Close navigation menu"
              className="self-end size-[var(--app-touch-target-min)] text-[var(--app-color-surface)] hover:bg-[var(--app-color-brand)] hover:text-[var(--app-color-surface)]"
            >
              <i className="bi bi-x-lg" aria-hidden="true"></i>
            </Button>
          )}
          {isCollapsed ? (
            <img
              className="size-[var(--app-touch-target-min)] rounded-full object-contain brightness-0 invert"
              src="/smoke.png"
              alt="Senorito Cafe"
            />
          ) : (
            <>
              <img
                className="h-[var(--app-touch-target-min)] w-full max-w-[16.625rem] object-cover object-center"
                src={sidebarLogo}
                alt="Senorito Cafe"
              />
              <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] font-semibold">
                POS & Inventory
              </p>
            </>
          )}
        </SidebarHeader>

        <SidebarContent>
          <nav
            aria-label="Pages"
            className="flex flex-col gap-[var(--app-gap-related)] p-[var(--app-space-4)] group-data-[collapsible=icon]:p-[var(--app-space-2)]"
          >
            {visibleNavGroups.map((group, groupIndex) => (
              <SidebarGroup key={group.name} className="p-0">
                {isCollapsed && groupIndex > 0 && (
                  <SidebarSeparator
                    aria-hidden="true"
                    className="mx-auto mb-[var(--app-space-2)] bg-[var(--app-color-brand-soft)] data-horizontal:h-[calc(var(--app-space-2)/3)] data-horizontal:w-[var(--app-space-8)]"
                  />
                )}
                {group.name !== "Overview" && (
                  <SidebarGroupLabel className="px-[var(--app-space-4)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)] font-semibold uppercase motion-reduce:transition-none">
                    {group.name}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent className="px-[var(--app-space-2)] group-data-[collapsible=icon]:px-0">
                  <SidebarMenu className="gap-[var(--app-space-1)] group-data-[collapsible=icon]:items-center">
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          render={<NavLink to={item.path} end onClick={closeDrawer} />}
                          isActive={pathname === item.path}
                          tooltip={item.label}
                          aria-label={item.label}
                          size="lg"
                          className="gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] group-data-[collapsible=icon]:justify-center data-active:bg-[var(--app-color-brand)] data-active:text-[var(--app-color-surface)]"
                        >
                          <i className={`bi ${item.icon} shrink-0 text-[length:var(--app-font-size-h3)]`} aria-hidden="true"></i>
                          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </nav>
        </SidebarContent>

        <SidebarFooter className="border-t border-[var(--app-color-border-subtle)] p-[var(--app-space-4)] group-data-[collapsible=icon]:p-[var(--app-space-2)]">
          <SidebarUserMenu
            triggerRef={accountTriggerRef}
            profile={profile}
            role={role}
            onProfileClick={handleProfileClick}
            onLogoutClick={handleLogoutClick}
          />
        </SidebarFooter>
      </SidebarPanel>

      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
        feedback={feedback}
        onReturnFocus={restoreNavigationFocus}
      />
    </>
  );
};

export default Sidebar;
