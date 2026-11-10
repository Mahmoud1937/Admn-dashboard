import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../service/categoryService";

export function useCategoriesQuery({ pageNumber, pageSize, search, language }) {

 const { data, isLoading, isFetching, isError, error, isPlaceholderData,refetch } = useQuery({
    queryKey: language
      ? ["categories", language, pageNumber, pageSize, search]
      : ["categories", pageNumber, pageSize, search],
    queryFn: () => getCategories(pageNumber, pageSize, search),
    placeholderData: (previousData, previousQuery) =>
      !language || previousQuery?.queryKey[1] === language ? previousData : undefined,
  });

  return {
    categories: data?.data?.items ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    totalPages: data?.data?.totalPages ?? 1,
    isLoading,
  isFetching,
    isError,
    error,
    refetch,
    isPlaceholderData,
  };
}
