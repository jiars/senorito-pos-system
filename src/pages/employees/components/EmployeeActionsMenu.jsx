import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRefreshEmployeeManagement } from "@/hooks/useEmployeeManagement";
import { resendEmployeeSetupLink } from "@/services/employees/employeeAccountsService";

const DEFAULT_COOLDOWN_SECONDS = 60;

const EmployeeActionsMenu = ({
  employee,
  resetRequest,
  onEdit,
  onChangeStatus,
  onReviewPasswordRequest,
  onFeedback,
  cooldown = 0,
  onCooldownStart,
}) => {
  const [isSendingSetupLink, setIsSendingSetupLink] = useState(false);
  const refreshEmployeeManagement = useRefreshEmployeeManagement();

  const roleName = employee.role?.role_name || employee.role_name || "";
  const status = employee.status || "Active";
  const isActive = status.toLowerCase() === "active";
  const requiresPasswordSetup = Boolean(employee.requires_password_setup);
  const canResendSetupLink = isActive && requiresPasswordSetup;
  const isOwner = roleName.toLowerCase() === "owner";
  const employeeName =
    `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
    employee.username ||
    "Employee";

  const handleResendSetupLink = async () => {
    if (!canResendSetupLink || cooldown > 0 || isSendingSetupLink) {
      return;
    }

    setIsSendingSetupLink(true);

    try {
      const response = await resendEmployeeSetupLink(employee.id);
      const retryAfter = Number(response.retry_after);

      onCooldownStart(
        employee.id,
        retryAfter > 0 ? retryAfter : DEFAULT_COOLDOWN_SECONDS,
      );
      onFeedback({
        type: "success",
        message: `Setup link sent to ${employeeName}.`,
      });
      setIsSendingSetupLink(false);
    } catch (error) {
      const retryAfter = Number(error.response?.data?.retry_after);

      if (retryAfter > 0) {
        onCooldownStart(employee.id, retryAfter);
      }

      if (error.response?.status === 409) {
        setIsSendingSetupLink(false);
        await refreshEmployeeManagement();
        onFeedback({
          type: "success",
          message: `${employeeName} has already completed password setup.`,
        });
        return;
      }

      onFeedback({
        type: "error",
        message: error.message,
      });
      setIsSendingSetupLink(false);
    }
  };

  if (isOwner) {
    return <span className="text-[var(--app-color-text-muted)]">—</span>;
  }

  let resendLabel = "Resend Setup Link";

  if (isSendingSetupLink) {
    resendLabel = "Sending...";
  } else if (cooldown > 0) {
    resendLabel = `Send Again in ${cooldown}s`;
  }

  const resetRequestLabel =
    resetRequest?.status === "approved" ? "Reset Link Sent" : "Reset Requested";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Open actions for ${employeeName}`}
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
            disabled={cooldown > 0 || isSendingSetupLink}
            onClick={handleResendSetupLink}
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
            <span className="min-w-0 flex-1">Review Password Request</span>
            <Badge
              variant="secondary"
              className="border-0 bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]"
            >
              {resetRequestLabel}
            </Badge>
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
