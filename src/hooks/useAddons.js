import { useState, useEffect } from 'react';

import { fetchAddons } from '../services/menu/addonsService';
import { fetchMenuCategories } from '../services/menu/menuCategoriesService';

export const useAddons = () => {
    const [addons, setAddons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAddons = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const addonsData = await fetchAddons();
            const categoriesData = await fetchMenuCategories();

            setAddons(addonsData);
            setCategories(categoriesData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAddons();
    }, []);

    return { addons, categories, isLoading, error, refetchAddons: loadAddons };
};
