import { useState, useEffect } from 'react';
import { fetchMenuItems } from '../services/menuService';

export const useMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadMenu = async () => {
        setIsLoading(true);
        try {
            const data = await fetchMenuItems();
            setMenuItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMenu();
    }, []);

    return { menuItems, isLoading, error, refetchMenu: loadMenu };
};
