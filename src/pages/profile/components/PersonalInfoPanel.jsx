import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPhoneNumber } from "@/utils/shared/formatters/stringFormatters";

const PersonalInfoPanel = ({ profile, onEdit }) => {
  const details = [
    { label: "First Name", value: profile.first_name || "Not set", hasValue: Boolean(profile.first_name) },
    { label: "Last Name", value: profile.last_name || "Not set", hasValue: Boolean(profile.last_name) },
    { label: "Email", value: profile.email || "Not set", hasValue: Boolean(profile.email) },
    { label: "Contact Number", value: formatPhoneNumber(profile.contact_number), hasValue: Boolean(profile.contact_number) },
  ];

  return (
    <Card
      role="region"
      aria-labelledby="profile-personal-heading"
      className="min-w-0 gap-[var(--app-gap-section)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-none ring-0"
    >
      <header className="flex flex-wrap items-start justify-between gap-[var(--app-gap-related)]">
        <div className="min-w-0">
          <h2 id="profile-personal-heading" className="m-0 text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-brand-header)]">Personal Information</h2>
          <p className="m-0 mt-[var(--app-space-1)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">Your personal and contact details.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          className="h-[var(--app-touch-target-min)] gap-[var(--app-space-2)] rounded-[var(--app-radius-control)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-filter-font-color)] hover:bg-[var(--app-color-control-hover)] transition-shadow hover:shadow-brand active:shadow-brand"
        >
          <i aria-hidden="true" className="bi bi-pencil-square" />
          Edit Profile
        </Button>
      </header>
      <dl className="m-0 grid min-w-0 grid-cols-1 gap-[var(--app-gap-section)] border-t border-[var(--app-color-border-subtle)] pt-[var(--app-space-6)] sm:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label} className="min-w-0">
            <dt className="text-[length:var(--app-font-size-body-secondary)] font-medium leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">{detail.label}</dt>
            <dd className={`m-0 mt-[var(--app-space-2)] text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] [overflow-wrap:anywhere] ${detail.hasValue ? "font-semibold text-[var(--app-color-text)]" : "font-normal text-[var(--app-color-text-muted)]"}`}>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};

export default PersonalInfoPanel;
