import React, { useState, useRef } from 'react';
import { formatFullName, formatPhoneNumber } from '../../../utils/stringFormatters';
import { formatDate } from '../../../utils/dateFormatters';

const ProfileCard = ({ user, profile, role }) => {
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

    let fullName = formatFullName(profile.first_name, profile.last_name);
    let userEmail = user.email;
    let username = profile.username;
    let contactNumber = formatPhoneNumber(profile.contact_number);
    let accountCreated = formatDate(profile.created_at);

    return (
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
                <h2 className="profile-name">{fullName}</h2>
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
