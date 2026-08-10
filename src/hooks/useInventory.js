import { useState, useEffect, useCallback } from 'react';
import { fetchInventoryItems, fetchUnits } from '../services/inventory/inventoryItemsService';
import { fetchInventoryCategories } from '../services/inventory/inventoryCategoriesService';

export const useInventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [itemsData, categoriesData, unitsData] = await Promise.all([
        fetchInventoryItems(),
        fetchInventoryCategories(),
        fetchUnits()
      ]);
      setInventoryItems(itemsData || []);
      setCategories(categoriesData || []);
      setUnits(unitsData || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  return {
    inventoryItems,
    categories,
    units,
    isLoading,
    error,
    refetchInventory: loadInventory
  };
};
