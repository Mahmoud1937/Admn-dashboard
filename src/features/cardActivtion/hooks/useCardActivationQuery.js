import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getActivatedCards } from "../services/cardActivationService";

export const useCardActivationQuery = ({ id, sourceType, pageNumber, pageSize }) => {
  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["cardActivation", id, sourceType, pageNumber, pageSize],
    queryFn: () => getActivatedCards({ id, sourceType, pageNumber, pageSize }),
    placeholderData: keepPreviousData,
    enabled: !!id && !!sourceType,
  });

  return {
    cards: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    serverPageSize: data?.pageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  };
};