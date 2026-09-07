import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../service/categoryService";

export function useCategoriesQuery({ pageNumber, pageSize, search }) {

 const { data, isLoading, isFetching, isError, error, isPlaceholderData,refetch } = useQuery({
    queryKey: ["categories", pageNumber, pageSize, search],
    queryFn: () => getCategories(pageNumber, pageSize, search),
    placeholderData: (previousData) => previousData,
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
