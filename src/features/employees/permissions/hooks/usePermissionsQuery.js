import { useQuery } from "@tanstack/react-query";
import { getPermissions } from "../services/permissionsService";

export default function usePermissionsQuery({ enabled = true } = {}) {
  const query = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
    enabled,
    staleTime: 30 * 60 * 1000, // قايمة الصلاحيات نادراً بتتغير
  });

  return {
    permissions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}