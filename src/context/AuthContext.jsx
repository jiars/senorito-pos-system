import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { getUserProfile } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkActiveSession = async () => {
            try {
                // 1. Check if the user has a VIP Token saved in their browser
                const token = localStorage.getItem('auth_token');

                if (token) {
                    // 2. If they have a token, show it to Laravel to get their Profile data
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}` // This is how you show the VIP Ticket!
                        }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                        setProfile(userData); // For now, the user and profile data are the same
                    } else {
                        // If Laravel rejects the token (expired or fake), delete it
                        localStorage.removeItem('auth_token');
                    }
                }
            } catch (error) {
                console.error("Failed to fetch session from Laravel:", error.message);
            } finally {
                setLoading(false);
            }
        };
        checkActiveSession();
    }, []);

    let userRole = null;
    if (profile !== null) {
        if (profile.role !== undefined && profile.role !== null) {
            userRole = profile.role.role_name;
        } else {
            userRole = 'Owner';
        }
    }

    const contextValue = {
        user: user,
        profile: profile,
        role: userRole,
        loading: loading
    };

    if (loading === true)
        return <div>Loading System...</div>;

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
