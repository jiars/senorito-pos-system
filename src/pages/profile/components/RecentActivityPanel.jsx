import React from 'react';

const RecentActivityPanel = () => {
    return (
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
    );
};

export default RecentActivityPanel;
