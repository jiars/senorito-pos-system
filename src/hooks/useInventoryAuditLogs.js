import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchInventoryAuditLogs } from '../services/inventory/inventoryAuditLogService';

const AUDIT_LOG_QUERY_KEY = ['inventory-audit-logs'];
const AUDIT_LOG_STALE_TIME = 5 * 60 * 1000;

const auditLogQueryOptions = {
  queryKey: AUDIT_LOG_QUERY_KEY,
  queryFn: fetchInventoryAuditLogs,
  staleTime: AUDIT_LOG_STALE_TIME,
};

export const useInventoryAuditLogs = () => {
  const query = useQuery({
    ...auditLogQueryOptions,
    // Laravel returns the audit records with their item, batch, and performer.
    // Catch server-created Expired logs when the page is opened or focused.
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });

  return {
    logs: query.data || [],
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetchAuditLogs: query.refetch,
  };
};

export const useRefreshInventoryAuditLogs = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // Force one fresh request, then keep its result ready in the cache.
    await queryClient.invalidateQueries({
      queryKey: AUDIT_LOG_QUERY_KEY,
      refetchType: 'none',
    });

    return queryClient.fetchQuery(auditLogQueryOptions);
  }, [queryClient]);
};
