import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/utils/shared/formatters/dateFormatters";

const AccountSecurityPanel = ({ profile, onChangePassword }) => {
  let passwordChangedAt = "No password change recorded";
  if (profile.last_password_change_at) {
    passwordChangedAt = formatDateTime(profile.last_password_change_at);
  }

  return (
    <Card
      role="region"
      aria-labelledby="profile-security-heading"
      className="min-w-0 gap-[var(--app-gap-section)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-none ring-0"
    >
      <header>
        <h2 id="profile-security-heading" className="m-0 text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-brand-header)]">Account Security</h2>
        <p className="m-0 mt-[var(--app-space-1)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">Keep your password private and secure.</p>
      </header>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-[var(--app-gap-related)] rounded-[var(--app-radius-nested)] bg-[var(--app-color-canvas)] p-[var(--app-space-4)]">
        <div className="flex min-w-0 flex-1 items-center gap-[var(--app-space-4)]">
          <i aria-hidden="true" className="bi bi-shield-lock text-[length:var(--app-font-size-h3)] text-[var(--app-color-brand)]" />
          <div className="min-w-0">
            <p className="m-0 text-[length:var(--app-font-size-body-secondary)] font-medium leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">Last Password Change</p>
            <p className={`m-0 mt-[var(--app-space-2)] text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] [overflow-wrap:anywhere] ${profile.last_password_change_at ? "font-semibold text-[var(--app-color-text)]" : "font-normal text-[var(--app-color-text-muted)]"}`}>{passwordChangedAt}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onChangePassword}
          className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] hover:bg-[var(--app-color-control-hover)] transition-shadow hover:shadow-brand active:shadow-brand sm:w-auto"
        >
          Change Password
        </Button>
      </div>
    </Card>
  );
};

export default AccountSecurityPanel;
