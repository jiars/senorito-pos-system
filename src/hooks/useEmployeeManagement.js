import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchEmployeeManagement } from "@/services/employees/employeeManagementService";

const EMPLOYEE_MANAGEMENT_QUERY_KEY = ["employee-management"];

const employeeManagementQueryOptions = {
  queryKey: EMPLOYEE_MANAGEMENT_QUERY_KEY,
  queryFn: fetchEmployeeManagement,
  staleTime: 5 * 60 * 1000,
};

export const useEmployeeManagement = () => {
  const { data, isLoading, error, refetch } = useQuery({
    ...employeeManagementQueryOptions,
  });

  return {
    employees: data?.employees || [],
    roles: data?.roles || [],
    passwordResetRequests: data?.passwordResetRequests || [],
    isLoading,
    error: error ? error.message : null,
    refetchEmployeeManagement: refetch,
  };
};

export const useRefreshEmployeeManagement = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // Mark the existing Employee cache as outdated.
    await queryClient.invalidateQueries({
      queryKey: EMPLOYEE_MANAGEMENT_QUERY_KEY,
      refetchType: "none",
    });

    // Immediately fetch fresh Employee data into the cache.
    return queryClient.fetchQuery(employeeManagementQueryOptions);
  }, [queryClient]);
};
