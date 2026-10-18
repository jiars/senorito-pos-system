import { useQuery } from "@tanstack/react-query";
import { fetchProfileManagement } from "@/services/profile/profileManagementService";

export const useProfileManagement = (userId) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    // Each account keeps its own cached profile.
    queryKey: ["profile-management", userId],
    queryFn: fetchProfileManagement,
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    profile: data ? data.profile : null,
    lastActivityAt: data ? data.lastActivityAt : null,
    isLoading,
    isFetching,
    error: error ? error.message : null,
    refetchProfileManagement: refetch,
  };
};
