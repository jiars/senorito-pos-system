import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/utils/shared/formatters/dateFormatters";
import { formatFullName, formatInitials } from "@/utils/shared/formatters/stringFormatters";

const ProfileCard = ({ profile, role }) => {
  const fullName = formatFullName(profile.first_name, profile.last_name)
    || profile.username || "My Account";
  const initials = formatInitials(profile.first_name, profile.last_name);

  return (
    <Card
      role="region"
      aria-labelledby="profile-account-heading"
      className="min-w-0 gap-[var(--app-gap-section)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-none ring-0"
    >
      <div className="flex min-w-0 flex-col items-center gap-[var(--app-space-4)] border-b border-[var(--app-color-border-subtle)] pb-[var(--app-space-6)] text-center">
        <div aria-hidden="true" className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[var(--app-color-control-hover)] text-[length:var(--app-font-size-h2)] font-semibold text-[var(--app-color-brand)]">
          {initials || <i className="bi bi-person" />}
        </div>
        <div className="w-full min-w-0">
          <h2 id="profile-account-heading" className="m-0 text-[length:var(--app-font-size-h2)] font-semibold leading-[var(--app-line-height-h2)] text-[var(--app-color-brand-header)] [overflow-wrap:anywhere]">
            {fullName}
          </h2>
          <p className="mt-[var(--app-space-2)] text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] text-[var(--app-color-text-muted)] [overflow-wrap:anywhere]">
            {profile.username ? `@${profile.username}` : "Username not set"}
          </p>
        </div>
        <Badge variant="secondary" className="h-auto max-w-full whitespace-normal bg-[var(--app-color-control-hover)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-brand)]">
          {role}
        </Badge>
      </div>
      <dl className="m-0 grid min-w-0 gap-[var(--app-gap-related)]">
        <div>
          <dt className="text-[length:var(--app-font-size-body-secondary)] font-medium leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">Account Created</dt>
          <dd className="m-0 mt-[var(--app-space-2)] text-[length:var(--app-font-size-body)] font-semibold leading-[var(--app-line-height-body)] text-[var(--app-color-text)]">
            {formatDate(profile.created_at)}
          </dd>
        </div>
      </dl>
      <p className="m-0 text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">
        Your role determines which pages and actions you can access.
      </p>
    </Card>
  );
};

export default ProfileCard;
