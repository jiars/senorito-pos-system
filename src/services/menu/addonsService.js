import { logSystemActivity } from '../authService';

// ─── 1. Fetch All Active Add-ons (with their linked categories) ───
export const fetchAddons = async () => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/addons`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch add-ons from Laravel');
        return await response.json();
    } catch (error) {
        console.error('Error fetching addons:', error.message);
        return [];
    }
};

export const addAddon = async (payload) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/addons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to add addon');

        await logSystemActivity();
        return await response.json();
    } catch (error) {
        console.error('Error adding addon:', error.message);
        throw error;
    }
};

export const updateAddon = async (addonId, payload) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/addons/${addonId}/sync`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update addon');

        await logSystemActivity();
        return await response.json();
    } catch (error) {
        console.error('Error updating addon:', error.message);
        throw error;
    }
};

export const archiveAddon = async (addonId) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/addons/${addonId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to archive addon');

        await logSystemActivity();
        return true;
    } catch (error) {
        console.error('Error archiving addon:', error.message);
        throw error;
    }
};
