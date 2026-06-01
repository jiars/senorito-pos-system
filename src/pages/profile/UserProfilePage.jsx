import React, { useState, useRef } from 'react';
import './userProfile.css';

const UserProfilePage = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [avatarSrc, setAvatarSrc] = useState('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=200&q=80');
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarSrc(imageUrl);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-grid">
        
        {/* ─── Left Column: Profile Card ─── */}
        <div className="profile-card">
          <div className="profile-card-header">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <div className="profile-avatar-wrapper" onClick={handleAvatarClick}>
              <img 
                src={avatarSrc} 
                alt="Profile Avatar" 
                className="profile-avatar"
              />
              <div className="profile-avatar-overlay">
                <i className="bi bi-camera-fill"></i>
                <span>Change</span>
              </div>
            </div>
            <h2 className="profile-name">Jane Velarde Mayorga</h2>
            <p className="profile-username">@senorito_owner</p>
            <span className="profile-role-badge">Admin</span>
          </div>
          
          <div className="profile-card-body">
            <div className="profile-detail-group">
              <span className="profile-detail-label">Full Name</span>
              <p className="profile-detail-value">Jane Velarde Mayorga</p>
            </div>
            
            <div className="profile-detail-group">
              <span className="profile-detail-label">Username</span>
              <p className="profile-detail-value">senorito_owner</p>
            </div>
            
            <div className="profile-detail-group">
              <span className="profile-detail-label">Role</span>
              <p className="profile-detail-value">Admin</p>
            </div>
            
            <div className="profile-detail-group">
              <span className="profile-detail-label">Email</span>
              <p className="profile-detail-value">owner@senorito.com</p>
            </div>
            
            <div className="profile-detail-group">
              <span className="profile-detail-label">Contact Number</span>
              <p className="profile-detail-value">09123465790</p>
            </div>
            
            <div className="profile-detail-group">
              <span className="profile-detail-label">Account Created</span>
              <p className="profile-detail-value">Feb 14, 2026</p>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Settings ─── */}
        <div className="profile-settings-col">
          
          {/* Update Profile Panel */}
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
                  <input type="text" className="profile-form-input" placeholder="Full Name" defaultValue="Jane Velarde Mayorga" />
                  <span className="profile-form-hint">This is shown in the sidebar and top bar</span>
                </div>
                
                <div className="profile-form-group">
                  <label className="profile-form-label">Email</label>
                  <input type="email" className="profile-form-input" placeholder="Email" defaultValue="owner@senorito.com" />
                </div>
                
                <div className="profile-form-group full-width" style={{ maxWidth: 'calc(50% - 0.625rem)' }}>
                  <label className="profile-form-label">Contact number</label>
                  <input type="text" className="profile-form-input" placeholder="Contact Number" defaultValue="09123465790" />
                </div>
              </div>
              <button className="profile-btn profile-btn--brown">Save Changes</button>
            </div>
          </div>

          {/* Change Password Panel */}
          <div className="profile-panel">
            <div className="profile-panel-header">
              <h3 className="profile-panel-title">Change Password</h3>
              <p className="profile-panel-desc">
                After changing your password, you will be logged out and need to sign in again.
              </p>
            </div>
            <div className="profile-panel-body">
              <div className="profile-divider"></div>
              
              <div className="profile-form-group full-width" style={{ marginBottom: '1.25rem' }}>
                <label className="profile-form-label">Current Password *</label>
                <div className="profile-input-icon-wrapper">
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    className="profile-form-input" 
                  />
                  <button type="button" className="profile-password-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    <i className={`bi ${showCurrentPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                  </button>
                </div>
              </div>
              
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label className="profile-form-label">New Password *</label>
                  <div className="profile-input-icon-wrapper">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      className="profile-form-input" 
                    />
                    <button type="button" className="profile-password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                      <i className={`bi ${showNewPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                    </button>
                  </div>
                  <span className="profile-form-hint">Minimum 8 characters, at least 1 number</span>
                </div>
                
                <div className="profile-form-group">
                  <label className="profile-form-label">Confirm New Password *</label>
                  <div className="profile-input-icon-wrapper">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className="profile-form-input" 
                    />
                    <button type="button" className="profile-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <button className="profile-btn profile-btn--yellow">
                <i className="bi bi-key-fill" style={{ marginRight: '0.5rem' }}></i>
                Change Password
              </button>
            </div>
          </div>

          {/* Recent Activity Panel */}
          <div className="profile-panel">
            <div className="profile-panel-header">
              <h3 className="profile-panel-title">Recent Activity</h3>
            </div>
            <div className="profile-panel-body">
              <div className="profile-divider"></div>
              
              <div className="profile-activity-list">
                <div className="profile-activity-item">
                  <div className="profile-activity-icon activity-login">
                    <i className="bi bi-box-arrow-in-right"></i>
                  </div>
                  <div className="profile-activity-info">
                    <p className="profile-activity-title">Last Login</p>
                    <p className="profile-activity-date">Mar 7, 2026, 3:36 AM</p>
                  </div>
                </div>
                
                <div className="profile-activity-item">
                  <div className="profile-activity-icon activity-password">
                    <i className="bi bi-key"></i>
                  </div>
                  <div className="profile-activity-info">
                    <p className="profile-activity-title">Last Password Change</p>
                    <p className="profile-activity-date">Mar 7, 2026, 3:36 AM</p>
                  </div>
                </div>
                
                <div className="profile-activity-item">
                  <div className="profile-activity-icon activity-failed">
                    <i className="bi bi-exclamation-triangle"></i>
                  </div>
                  <div className="profile-activity-info">
                    <p className="profile-activity-title">Last Failed Login Attempt</p>
                    <p className="profile-activity-date">Mar 7, 2026, 3:36 AM</p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
