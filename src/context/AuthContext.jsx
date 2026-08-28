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
                // Prevent Supabase from hanging if there's no network adapter at all
                if (!navigator.onLine) {
                    throw new Error("Device is offline");
                }

                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;
                
                const session = data?.session;

                if (session) {
                    const loggedInUser = session.user;
                    setUser(loggedInUser);

                    const userProfile = await getUserProfile(loggedInUser.id);
                    setProfile(userProfile);
                    
                    // -- INDUSTRY STANDARD: Cache the user for Offline Mode --
                    localStorage.setItem('offline_user', JSON.stringify(loggedInUser));
                    localStorage.setItem('offline_profile', JSON.stringify(userProfile));
                } else {
                    localStorage.removeItem('offline_user');
                    localStorage.removeItem('offline_profile');
                }
            } catch (error) {
                console.warn("Auth check failed (likely offline):", error.message);
                // -- OFFLINE MODE: Load the cached user so POS knows who the cashier is --
                const cachedUser = localStorage.getItem('offline_user');
                const cachedProfile = localStorage.getItem('offline_profile');
                if (cachedUser && cachedProfile) {
                    console.log("Loading offline cached user...");
                    setUser(JSON.parse(cachedUser));
                    setProfile(JSON.parse(cachedProfile));
                }
            } finally {
                setLoading(false);
            }
        };

        checkActiveSession();

        const listener = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                if (!navigator.onLine) return; // Skip online logic if offline

                if (session) {
                    const loggedInUser = session.user;
                    setUser(loggedInUser);

                    const userProfile = await getUserProfile(loggedInUser.id);
                    setProfile(userProfile);
                    
                    localStorage.setItem('offline_user', JSON.stringify(loggedInUser));
                    localStorage.setItem('offline_profile', JSON.stringify(userProfile));
                } else {
                    setUser(null);
                    setProfile(null);
                    localStorage.removeItem('offline_user');
                    localStorage.removeItem('offline_profile');
                }
            } catch (error) {
                console.warn("Auth state change failed:", error.message);
            } finally {
                setLoading(false);
            }
        });

        return () => {
            listener.data.subscription.unsubscribe();
        };
    }, []);
    let userRole = null;
    if (profile !== null && profile.role !== null)
        userRole = profile.role.role_name;

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
