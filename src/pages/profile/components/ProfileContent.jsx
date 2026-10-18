import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AccountSecurityPanel from "./AccountSecurityPanel";
import PersonalInfoPanel from "./PersonalInfoPanel";
import ProfileCard from "./ProfileCard";
import RecentActivityPanel from "./RecentActivityPanel";

const ProfileSkeleton = () => (
  <div className="profile-page-layout" role="status" aria-label="Loading profile" aria-busy="true">
    <Card className="min-w-0 gap-[var(--app-gap-section)] p-[var(--app-padding-panel)]">
      <div className="flex flex-col items-center gap-[var(--app-space-4)]">
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="h-7 w-40 max-w-full" />
        <Skeleton className="h-5 w-28 max-w-full" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-4 w-28 max-w-full" />
      <Skeleton className="h-5 w-36 max-w-full" />
    </Card>
    <div className="profile-settings-column">
      {[4, 1, 2].map((fields) => (
        <Card key={fields} className="min-w-0 gap-[var(--app-gap-section)] p-[var(--app-padding-panel)]">
          <Skeleton className="h-6 w-44 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <div className="grid gap-[var(--app-gap-section)] sm:grid-cols-2">
            {Array.from({ length: fields }, (_, index) => (
              <div key={index} className="grid gap-[var(--app-space-2)]">
                <Skeleton className="h-4 w-24 max-w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const ProfileContent = ({ profile, lastActivityAt, isLoading, isFetching, error, onRetry, onEdit, onChangePassword }) => {
  if (isLoading) return <ProfileSkeleton />;

  if (error) {
    return (
      <Card className="min-w-0 gap-[var(--app-gap-related)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-none ring-0">
        <p role="alert" className="m-0 text-[length:var(--app-font-size-body)] text-[var(--app-color-danger)]">{error}</p>
        <Button type="button" variant="outline" onClick={onRetry} disabled={isFetching} className="min-h-[var(--app-touch-target-min)] self-start text-[var(--app-color-brand)]">Retry</Button>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-page-layout">
      <ProfileCard profile={profile} role={profile.role.role_name} />
      <div className="profile-settings-column">
        <PersonalInfoPanel profile={profile} onEdit={onEdit} />
        <AccountSecurityPanel profile={profile} onChangePassword={onChangePassword} />
        <RecentActivityPanel profile={profile} lastActivityAt={lastActivityAt} />
      </div>
    </div>
  );
};

export default ProfileContent;
