import React from 'react';
import './userProfile.css';
import { useAuth } from '../../hooks/useAuth';

import ProfileCard from './components/ProfileCard';
import PersonalInfoPanel from './components/PersonalInfoPanel';
import ChangePasswordPanel from './components/ChangePasswordPanel';
import RecentActivityPanel from './components/RecentActivityPanel';

const UserProfilePage = () => {
  const { user, profile, role } = useAuth();

  return (
    <div className="profile-page">
      <div className="profile-grid">

        {/* Left Column */}
        <ProfileCard user={user} profile={profile} role={role} />

        {/* Right Column */}
        <div className="profile-settings-col">
          <PersonalInfoPanel user={user} profile={profile} />
          <ChangePasswordPanel userEmail={user.email} />
          <RecentActivityPanel />
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;
