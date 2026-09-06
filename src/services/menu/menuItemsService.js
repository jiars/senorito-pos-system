export const fetchMenuItems = async () => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/items`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch menu items');
        return await response.json();
    } catch (error) {
        console.error('Error fetching menu items:', error.message);
        return [];
    }
};

export const addMenuItem = async (itemData) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData)
        });
        if (!response.ok) throw new Error('Failed to add menu item');

        return await response.json();
    } catch (error) {
        console.error('Error adding menu item:', error.message);
        throw error;
    }
};

export const syncMenuItem = async (itemId, nestedPayload) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/items/${itemId}/sync`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(nestedPayload)
        });
        if (!response.ok) throw new Error('Failed to sync menu item');

        return await response.json();
    } catch (error) {
        console.error('Error syncing menu item:', error.message);
        throw error;
    }
};

export const archiveMenuItem = async (itemId) => {
    const token = localStorage.getItem('auth_token');
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to archive menu item');

        return true;
    } catch (error) {
        console.error('Error archiving menu item:', error.message);
        throw error;
    }
};