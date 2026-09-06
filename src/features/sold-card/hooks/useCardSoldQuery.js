import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCardSolds } from "../services/cardSoldService";

export const useCardSoldQuery = ({ searchTerm, pageNumber, pageSize, fromDate, toDate }) => {
  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["cardSolds", searchTerm, pageNumber, pageSize, fromDate, toDate],
    queryFn: () => getCardSolds({ searchTerm, pageNumber, pageSize, fromDate, toDate }),
    placeholderData: keepPreviousData,
  });

  return {
    cardSolds: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    serverPageSize: data?.pageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  };
};