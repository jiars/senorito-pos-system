import { useState, useEffect, useCallback } from 'react';
import {
    fetchExpenses,
    fetchExpenseCategories
} from '../services/expenses/expenseService';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [expensesData, categoriesData] = await Promise.all([
                fetchExpenses(),
                fetchExpenseCategories()
            ]);
            setExpenses(expensesData || []);
            setCategories(categoriesData || []);
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
        isLoading,
        refetchExpenses: loadData
    };
};
