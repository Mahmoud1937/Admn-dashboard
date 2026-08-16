import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../service/categoryService";
;

export function useCategoriesQuery({ pageNumber, pageSize, search }) {
  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ["categories", pageNumber, pageSize, search],
    queryFn: () => getCategories(pageNumber, pageSize, search),
    placeholderData: (previousData) => previousData,
  });

  return {
    categories: data?.data?.items ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    totalPages: data?.data?.totalPages ?? 1,
    serverPageSize: data?.data?.pageSize,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  };
}