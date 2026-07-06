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
            const response = await supabase.auth.getSession();
            const session = response.data.session;

            if (session !== null) {
                const loggedInUser = session.user;
                setUser(loggedInUser);

                const userProfile = await getUserProfile(loggedInUser.id);
                setProfile(userProfile);
            }

            setLoading(false);
        };

        checkActiveSession();

        const listener = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session !== null) {
                const loggedInUser = session.user;
                setUser(loggedInUser);

                const userProfile = await getUserProfile(loggedInUser.id);
                setProfile(userProfile);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
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
