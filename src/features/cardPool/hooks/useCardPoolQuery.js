import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCardPools } from "../services/cardPoolService";

export const useCardPoolQuery = ({ searchTerm, filters, pageNumber, pageSize }) => {
  const { data, isLoading, isError, error, isPlaceholderData,refetch } = useQuery({
    queryKey: ["cardPools", searchTerm, filters, pageNumber, pageSize],
    queryFn: () =>
      getCardPools({
        searchTerm,
        fromDate: filters?.fromDate,
        toDate: filters?.toDate,
        pageNumber,
        pageSize,
      }),
    placeholderData: keepPreviousData,
  });

  return {
    cardPools: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    serverPageSize: data?.pageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch
  };
};