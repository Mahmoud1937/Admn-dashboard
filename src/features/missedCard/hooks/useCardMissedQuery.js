import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCardMisseds } from "../services/cardMissedService";


export const useCardMissedQuery = ({ cardPoolId, searchTerm, filters, pageNumber, pageSize }) => {
  const { data, isLoading, isError, error, isPlaceholderData, refetch } = useQuery({
    queryKey: ["cardMisseds", cardPoolId, searchTerm, filters, pageNumber, pageSize],
    queryFn: () =>
      getCardMisseds({
        cardPoolId,
        searchTerm,
        fromDate: filters?.fromDate,
        toDate: filters?.toDate,
        pageNumber,
        pageSize,
      }),
    placeholderData: keepPreviousData,
  });

  return {
    cardMisseds: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    serverPageSize: data?.pageSize,
    isLoading,
    refetch,
    isError,
    error,
    isPlaceholderData,
  };
};