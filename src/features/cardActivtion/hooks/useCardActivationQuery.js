import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getNotActivatedCards } from "../services/cardActivationService";

export const useCardActivationQuery = ({ id, sourceType, searchTerm, pageNumber, pageSize }) => {
  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["cardActivation", "not-activated", id, sourceType, searchTerm, pageNumber, pageSize],
    queryFn: () => getNotActivatedCards({ id, sourceType, searchTerm, pageNumber, pageSize }),
    placeholderData: keepPreviousData,
    enabled: !!id && !!sourceType,
  });

  return {
    cards: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  };
};
