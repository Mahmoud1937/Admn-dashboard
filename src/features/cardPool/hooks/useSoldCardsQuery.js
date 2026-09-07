import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getSoldCards } from "../services/cardPoolService";

export const useSoldCardsQuery = ({ cardPoolId, searchTerm, pageNumber, pageSize }) => {
  const { data, isLoading, isError, error, isPlaceholderData ,refetch} = useQuery({
    queryKey: ["soldCards", cardPoolId, searchTerm, pageNumber, pageSize],
    queryFn: () =>
      getSoldCards({
        cardPoolId,
        searchTerm,
        pageNumber,
        pageSize,
      }),
    enabled: !!cardPoolId,
    placeholderData: keepPreviousData,
  });

  return {
    soldCards: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch
  };
};
