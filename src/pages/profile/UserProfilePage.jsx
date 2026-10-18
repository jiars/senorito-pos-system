import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useProfileManagement } from "@/hooks/useProfileManagement";

import ProfileContent from "./components/ProfileContent";
import EditProfileModal from "./modals/Edit Profile/EditProfileModal";
import ChangePasswordModal from "./modals/Change Password/ChangePasswordModal";
import "./userProfile.css";

const UserProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const {
    profile,
    lastActivityAt,
    isLoading,
    isFetching,
    error,
    refetchProfileManagement,
  } = useProfileManagement(user ? user.id : null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // A saved edit must refresh both this page and the shared account display.
  const refreshProfileAndSession = async () => {
    await refetchProfileManagement({ throwOnError: true });
    await refreshUser();
  };

  return (
    <PageLayout
      title="My Profile"
      subtitle="View your account details, security, and recent activity."
      className="profile-page-shell flex min-w-0 flex-col gap-[var(--app-gap-section)]"
    >
      <ProfileContent
        profile={profile}
        lastActivityAt={lastActivityAt}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={() => refetchProfileManagement({ cancelRefetch: false })}
        onEdit={() => setIsEditOpen(true)}
        onChangePassword={() => setIsPasswordOpen(true)}
      />
      <EditProfileModal
        isOpen={isEditOpen}
        profile={profile}
        onClose={() => setIsEditOpen(false)}
        refetchProfileManagement={refreshProfileAndSession}
      />
      <ChangePasswordModal
        isOpen={isPasswordOpen}
        profile={profile}
        onClose={() => setIsPasswordOpen(false)}
        refetchProfileManagement={refreshProfileAndSession}
      />
    </PageLayout>
  );
};

export default UserProfilePage;
