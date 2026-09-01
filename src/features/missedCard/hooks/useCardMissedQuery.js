import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCardMisseds } from "../services/cardMissedService";

export const useCardMissedQuery = ({ searchTerm, pageNumber, pageSize }) => {
  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["cardMisseds", searchTerm, pageNumber, pageSize],
    queryFn: () => getCardMisseds({ searchTerm, pageNumber, pageSize }),
    placeholderData: keepPreviousData,
  });

  return {
    cardMisseds: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    serverPageSize: data?.pageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  };
};