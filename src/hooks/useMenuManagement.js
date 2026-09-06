import { useState, useEffect, useCallback } from 'react';

export const useMenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnifiedMenuData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('auth_token');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu-management/init`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu management data');
      }
      
      const data = await response.json();
      
      setCategories(data.categories || []);
      setMenuItems(data.items || []);
      setAddons(data.addons || []);
      
    } catch (err) {
      console.error('Error fetching unified menu data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnifiedMenuData();
  }, [fetchUnifiedMenuData]);

  return {
    categories,
    menuItems,
    addons,
    isLoading,
    error,
    refetch: fetchUnifiedMenuData
  };
};
