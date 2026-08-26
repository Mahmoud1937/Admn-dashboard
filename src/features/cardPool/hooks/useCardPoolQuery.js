import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCardPools } from "../services/cardPoolService";


export const useCardPoolQuery = ({ searchTerm, pageNumber, pageSize }) => {
  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["cardPools", searchTerm, pageNumber, pageSize],
    queryFn: () => getCardPools({ searchTerm, pageNumber, pageSize }),
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
  };
};