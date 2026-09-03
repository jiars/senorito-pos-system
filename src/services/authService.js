import { supabase } from './supabaseClient';
import { supabaseAdmin } from './supabaseAdmin';

export const loginUser = async (email, password) => {
    try {
        const response = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (response.error !== null)
            throw response.error;

        const userId = response.data.user.id;

        // Step 1: Login Gatekeeper Check
        const profileData = await getUserProfile(userId);

        if (profileData && profileData.status === 'Deactivated') {
            await supabase.auth.signOut();
            throw new Error("Your account has been deactivated. Please contact the owner.");
        }

        await supabaseAdmin
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', userId);

        await logSystemActivity();
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

        const userId = response.data.user.id;
        await supabaseAdmin
            .from('profiles')
            .update({ last_password_change_at: new Date().toISOString() })
            .eq('id', userId);

        await logSystemActivity();
        return response.data;
    } catch (error) {
        console.error('Error updating password:', error.message);
        throw error;
    }
};

export const logSystemActivity = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabaseAdmin
                .from('profiles')
                .update({ last_system_activity_at: new Date().toISOString() })
                .eq('id', user.id);
        }
    } catch (error) {
        console.error('Error logging system activity:', error);
    }
};
