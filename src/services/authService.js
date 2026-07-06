import { supabase } from './supabaseClient';

export const loginUser = async (email, password) => {
    try {
        const response = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (response.error !== null)
            throw response.error;

        return response.data;
    } catch (error) {
        console.error('Error logging in:', error.message);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const response = await supabase.auth.signOut();

        if (response.error !== null)
            throw response.error;
    } catch (error) {
        console.error('Error logging out:', error.message);
        throw error;
    }
};

export const getUserProfile = async (userId) => {
    try {
        const response = await supabase
            .from('profiles')
            .select('*, role:roles(role_name)')
            .eq('id', userId)
            .single();

        if (response.error !== null)
            throw response.error;

        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        return null;
    }
};

export const updateUserPassword = async (newPassword) => {
    try {
        const response = await supabase.auth.updateUser({
            password: newPassword
        });

        if (response.error !== null)
            throw response.error;

        return response.data;
    } catch (error) {
        console.error('Error updating password:', error.message);
        throw error;
    }
};