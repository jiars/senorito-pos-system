import { useQuery } from "@tanstack/react-query";
import { fetchExpenseManagement } from "../services/expenses/expenseManagementService";

export const useExpenseManagement = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["expense-management"],
    queryFn: fetchExpenseManagement,
    staleTime: 5 * 60 * 1000,
  });

  return {
    expenses: data?.expenses || [],
    categories: data?.categories || [],
    archivedExpenses: data?.archivedExpenses || [],
    isLoading,
    error: error ? error.message : null,
    refetchExpenseManagement: refetch,
  };
};
