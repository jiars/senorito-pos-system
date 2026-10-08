import React from 'react';
import { formatFullName, formatPhoneNumber } from '@/utils/shared/formatters/stringFormatters';
import { formatDate } from '@/utils/shared/formatters/dateFormatters';

const ProfileCard = ({ user, profile, role }) => {
    let fullName = formatFullName(profile.first_name, profile.last_name);
    let userEmail = user.email;
    let username = profile.username;
    let contactNumber = formatPhoneNumber(profile.contact_number);
    let accountCreated = formatDate(profile.created_at);

    return (
        <div className="profile-card">
            <div className="profile-card-header">
                <h2 className="profile-name" style={{ color: 'white' }}>{fullName}</h2>
                <p className="profile-username">@{username}</p>
                <span className="profile-role-badge">{role}</span>
            </div>

            <div className="profile-card-body">
                <div className="profile-detail-group">
                    <span className="profile-detail-label">Full Name</span>
                    <p className="profile-detail-value">{fullName}</p>
                </div>

                <div className="profile-detail-group">
                    <span className="profile-detail-label">Username</span>
                    <p className="profile-detail-value">@{username}</p>
                </div>

                <div className="profile-detail-group">
                    <span className="profile-detail-label">Role</span>
                    <p className="profile-detail-value">{role}</p>
                </div>

                <div className="profile-detail-group">
                    <span className="profile-detail-label">Email</span>
                    <p className="profile-detail-value">{userEmail}</p>
                </div>

                <div className="profile-detail-group">
                    <span className="profile-detail-label">Contact Number</span>
                    <p className="profile-detail-value">{contactNumber}</p>
                </div>

                <div className="profile-detail-group">
                    <span className="profile-detail-label">Account Created</span>
                    <p className="profile-detail-value">{accountCreated}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
