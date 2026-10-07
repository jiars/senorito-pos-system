import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EmployeeActionsMenu = ({
  employee,
  resetRequest,
  onEdit,
  onChangeStatus,
  onReviewPasswordRequest,
  onResendSetupLink,
  cooldown = 0,
}) => {

  const roleName = employee.role?.role_name || employee.role_name || "";
  const status = employee.status || "Active";
  const isActive = status.toLowerCase() === "active";
  const requiresPasswordSetup = Boolean(employee.requires_password_setup);
  const canResendSetupLink = isActive && requiresPasswordSetup;
  const isOwner = roleName.toLowerCase() === "owner";

  if (isOwner) {
    return <span className="text-[var(--app-color-text-muted)]">—</span>;
  }

  let resendLabel = "Resend Setup Link";

  if (cooldown > 0) resendLabel = `Send Again in ${cooldown}s`;


  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] text-[var(--app-color-text)]"
          >
            <i aria-hidden="true" className="bi bi-three-dots-vertical" />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="z-[120] w-52">
        <DropdownMenuItem onClick={() => onEdit(employee)}>
          <i aria-hidden="true" className="bi bi-pencil" />
          Edit
        </DropdownMenuItem>

        {canResendSetupLink && (
          <DropdownMenuItem
            disabled={cooldown > 0}
            onClick={() => onResendSetupLink(employee)}
          >
            <i aria-hidden="true" className="bi bi-envelope-arrow-up" />
            {resendLabel}
          </DropdownMenuItem>
        )}

        {resetRequest && (
          <DropdownMenuItem
            onClick={() => onReviewPasswordRequest(employee, resetRequest)}
          >
            <i aria-hidden="true" className="bi bi-key" />
            <span className="min-w-0 flex-1">Review Request</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() =>
            onChangeStatus(employee, isActive ? "Deactivated" : "Active")
          }
          className={
            isActive
              ? "text-[var(--app-color-danger)]"
              : "text-[var(--app-color-success)]"
          }
        >
          <i
            aria-hidden="true"
            className={isActive ? "bi bi-person-x" : "bi bi-person-check"}
          />
          {isActive ? "Deactivate" : "Reactivate"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeActionsMenu;
