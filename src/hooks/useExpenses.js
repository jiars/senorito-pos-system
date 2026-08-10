import { useState, useEffect, useCallback } from 'react';
import {
    fetchExpenses,
    fetchExpenseCategories,
    fetchWastage,
    fetchInventoryPurchases
} from '../services/expenses/expenseService';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wastage, setWastage] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [expensesData, categoriesData, wastageData, purchasesData] = await Promise.all([
                fetchExpenses(),
                fetchExpenseCategories(),
                fetchWastage(),
                fetchInventoryPurchases()
            ]);
            setExpenses(expensesData || []);
            setCategories(categoriesData || []);
            setWastage(wastageData || []);
            setPurchases(purchasesData || []);
        } catch (error) {
            console.error('Error loading expense data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        expenses,
        categories,
        wastage,
        purchases,
        isLoading,
        refetchExpenses: loadData
    };
};
