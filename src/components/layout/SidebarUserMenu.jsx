import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  formatFullName,
  formatInitials,
} from "@/utils/shared/formatters/stringFormatters";

const SidebarUserMenu = ({ profile, role, onProfileClick, onLogoutClick, triggerRef }) => {
  const { isMobile } = useSidebar();
  const fullName = formatFullName(profile.first_name, profile.last_name);
  const initials = formatInitials(profile.first_name, profile.last_name);

  // Keep the menu above the drawer footer on small screens.
  let menuSide = "right";
  if (isMobile) {
    menuSide = "top";
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            ref={triggerRef}
            aria-label={`Open account menu for ${fullName}`}
            render={
              <SidebarMenuButton
                size="lg"
                className="h-[var(--app-control-height-primary)] gap-[var(--app-space-2)] rounded-[var(--app-radius-nested)] group-data-[collapsible=icon]:justify-center"
              />
            }
          >
            <Avatar className="size-[var(--app-space-8)]">
              <AvatarFallback className="bg-[var(--app-color-brand-soft)] text-[var(--app-color-brand)] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col text-left group-data-[collapsible=icon]:hidden">
              <span className="truncate text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-semibold" title={fullName}>
                {fullName}
              </span>
              <span className="truncate text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
                {role}
              </span>
            </div>
            <i className="bi bi-chevron-expand ml-auto shrink-0 group-data-[collapsible=icon]:hidden" aria-hidden="true"></i>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={menuSide}
            align="end"
            sideOffset={8}
            className="w-52 max-w-[calc(100vw-2rem)] rounded-[var(--app-radius-nested)] bg-[var(--app-color-surface)] text-[var(--app-color-text)] motion-reduce:animate-none"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-[var(--app-space-2)]">
                <p className="truncate text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] font-semibold" title={fullName}>
                  {fullName}
                </p>
                <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] font-normal break-all">
                  {profile.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onProfileClick}
                className="min-h-[var(--app-touch-target-min)] border-0 text-[length:var(--app-font-size-body-secondary)] focus:bg-[var(--app-color-control-hover)] focus:text-[var(--app-color-brand)]"
              >
                <i className="bi bi-person" aria-hidden="true"></i>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={onLogoutClick}
                className="min-h-[var(--app-touch-target-min)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-danger)] focus:bg-[var(--app-color-danger-surface)] focus:text-[var(--app-color-danger)]"
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default SidebarUserMenu;
