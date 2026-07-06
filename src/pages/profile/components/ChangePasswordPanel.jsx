import React, { useState } from 'react';
import { usePasswordChange } from '../../../hooks/usePasswordChange';

const ChangePasswordPanel = ({ userEmail }) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        currentPasswordInput,
        setCurrentPasswordInput,
        newPasswordInput,
        setNewPasswordInput,
        confirmPasswordInput,
        setConfirmPasswordInput,
        handleChangePassword,
        hintText,
        hintColor,
        isBold
    } = usePasswordChange(userEmail);

    return (
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
                            placeholder="Enter your current password"
                            value={currentPasswordInput}
                            onChange={(e) => setCurrentPasswordInput(e.target.value)}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="profile-password-toggle"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
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
                                placeholder="Enter your new password"
                                value={newPasswordInput}
                                onChange={(e) => setNewPasswordInput(e.target.value)}
                            />
                            <button
                                type="button"
                                className="profile-password-toggle"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                <i className={`bi ${showNewPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                            </button>
                        </div>
                        <span className="profile-form-hint" style={{ color: hintColor, fontWeight: isBold }}>
                            {hintText}
                        </span>
                    </div>

                    <div className="profile-form-group">
                        <label className="profile-form-label">Confirm New Password *</label>
                        <div className="profile-input-icon-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="profile-form-input"
                                placeholder="Confirm your new password"
                                value={confirmPasswordInput}
                                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                            />
                            <button
                                type="button"
                                className="profile-password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <i className={`bi ${showConfirmPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                            </button>
                        </div>
                    </div>
                </div>

                <button className="profile-btn profile-btn--yellow" onClick={handleChangePassword}>
                    <i className="bi bi-key-fill" style={{ marginRight: '0.5rem' }}></i>
                    Change Password
                </button>
            </div>
        </div>
    );
};

export default ChangePasswordPanel;