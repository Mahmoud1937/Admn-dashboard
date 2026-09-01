import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCardSolds } from "../services/cardSoldService";

export const useCardSoldQuery = ({ searchTerm, pageNumber, pageSize }) => {
  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["cardSolds", searchTerm, pageNumber, pageSize],
    queryFn: () => getCardSolds({ searchTerm, pageNumber, pageSize }),
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