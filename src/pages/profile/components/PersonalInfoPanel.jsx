import React from 'react';
import { formatFullName, formatPhoneNumber } from '@/utils/shared/formatters/stringFormatters';

const PersonalInfoPanel = ({ user, profile }) => {
  let fullName = formatFullName(profile.first_name, profile.last_name);
  let userEmail = user.email;
  let contactNumber = formatPhoneNumber(profile.contact_number);

  return (
    <div className="profile-panel">
      <div className="profile-panel-header">
        <h3 className="profile-panel-title">Update Profile</h3>
        <p className="profile-panel-desc">
          You can update your display name and contact number. Username and role cannot be changed here.
        </p>
      </div>
      <div className="profile-panel-body">
        <div className="profile-divider"></div>
        <div className="profile-form-grid">
          <div className="profile-form-group">
            <label className="profile-form-label">Display Name</label>
            <input type="text" className="profile-form-input" placeholder="Full Name" defaultValue={fullName} />
            <span className="profile-form-hint">This is shown in the sidebar and top bar</span>
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label">Email</label>
            <input type="email" className="profile-form-input" placeholder="Email" value={userEmail} readOnly />
          </div>

          <div className="profile-form-group full-width" style={{ maxWidth: 'calc(50% - 0.625rem)' }}>
            <label className="profile-form-label">Contact number</label>
            <input type="text" className="profile-form-input" placeholder="Contact Number" defaultValue={contactNumber} />
          </div>
        </div>
        <button className="profile-btn profile-btn--brown">Save Changes</button>
      </div>
    </div>
  );
};

export default PersonalInfoPanel;
