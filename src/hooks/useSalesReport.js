import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSalesReport } from "../services/reports/salesReportService";

const SALES_REPORT_QUERY_KEY = ["sales-report"];
const SALES_REPORT_STALE_TIME = 5 * 60 * 1000;

const salesReportQueryOptions = {
  queryKey: SALES_REPORT_QUERY_KEY,
  queryFn: fetchSalesReport,
  staleTime: SALES_REPORT_STALE_TIME,
};

export const useSalesReport = () => {
  const { data, isLoading, error, refetch } = useQuery({
    ...salesReportQueryOptions,
  });

  return {
    orders: data?.orders || [],
    wastageRecords: data?.wastageRecords || [],
    categories: data?.categories || [],
    isLoading,
    error: error ? error.message : null,
    refetchSalesReport: refetch,
  };
};

export const useRefreshSalesReport = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // Mark the cached Report as outdated before rebuilding it.
    await queryClient.invalidateQueries({
      queryKey: SALES_REPORT_QUERY_KEY,
      refetchType: "none",
    });

    return queryClient.fetchQuery(salesReportQueryOptions);
  }, [queryClient]);
};
