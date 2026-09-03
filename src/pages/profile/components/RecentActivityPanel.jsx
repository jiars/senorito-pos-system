import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';

const RecentActivityPanel = ({ user, profile, role }) => {
    const [thirdSlot, setThirdSlot] = useState({ title: 'Loading...', date: null });

    useEffect(() => {
        if (!user || !profile || !role) return;

        const fetchDynamicActivity = async () => {
            try {
                if (role === 'Cashier') {
                    // Fetch Last Order Processed
                    const { data } = await supabase
                        .from('orders')
                        .select('created_at')
                        .eq('cashier_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (data && data.length > 0) {
                        setThirdSlot({ title: 'Last Order Processed', date: data[0].created_at });
                    } else {
                        setThirdSlot({ title: 'Last Order Processed', date: null });
                    }
                }
                else if (role === 'Inventory Clerk') {
                    // Fetch Last Inventory Update
                    const { data } = await supabase
                        .from('inventory_audit_logs')
                        .select('created_at')
                        .eq('performed_by', user.id)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (data && data.length > 0) {
                        setThirdSlot({ title: 'Last Inventory Update', date: data[0].created_at });
                    } else {
                        setThirdSlot({ title: 'Last Inventory Update', date: null });
                    }
                } else if (role === 'Owner') {
                    // Just use the timestamp from their profile
                    setThirdSlot({ title: 'Last System Update', date: profile.last_system_activity_at || null });
                }
            } catch (error) {
                console.error("Failed to fetch dynamic activity:", error);
                setThirdSlot({ title: 'No Recent Activity', date: null });
            }
        };

        fetchDynamicActivity();
    }, [user, profile, role]);

    const formatDate = (dateString) => {
        if (!dateString) return 'No activity yet';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    return (
        <div className="profile-panel">
            <div className="profile-panel-header">
                <h3 className="profile-panel-title">Recent Activity</h3>
            </div>
            <div className="profile-panel-body">
                <div className="profile-divider"></div>

                <div className="profile-activity-list">
                    {/* Slot 1: Last Login */}
                    <div className="profile-activity-item">
                        <div className="profile-activity-icon activity-login">
                            <i className="bi bi-box-arrow-in-right"></i>
                        </div>
                        <div className="profile-activity-info">
                            <p className="profile-activity-title">Last Login</p>
                            <p className="profile-activity-date">{formatDate(profile?.last_login_at)}</p>
                        </div>
                    </div>

                    {/* Slot 2: Last Password Change */}
                    <div className="profile-activity-item">
                        <div className="profile-activity-icon activity-password">
                            <i className="bi bi-key"></i>
                        </div>
                        <div className="profile-activity-info">
                            <p className="profile-activity-title">Last Password Change</p>
                            <p className="profile-activity-date">{formatDate(profile?.last_password_change_at)}</p>
                        </div>
                    </div>

                    {/* Slot 3: Dynamic Role-Based Activity */}
                    <div className="profile-activity-item">
                        <div className="profile-activity-icon activity-dynamic">
                            {role === 'Cashier' ? <i className="bi bi-receipt"></i> : <i className="bi bi-boxes"></i>}
                        </div>
                        <div className="profile-activity-info">
                            <p className="profile-activity-title">{thirdSlot.title}</p>
                            <p className="profile-activity-date">{formatDate(thirdSlot.date)}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RecentActivityPanel;
