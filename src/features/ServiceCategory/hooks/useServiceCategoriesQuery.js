import { useQuery } from "@tanstack/react-query";
import { getServiceCategories } from "../services/Servicecategoriesservice";


export function useServiceCategoriesQuery({ pageNumber, pageSize, search }) {
  const query = useQuery({
    queryKey: ["service-categories", pageNumber, pageSize, search],
    queryFn: () => getServiceCategories(pageNumber, pageSize, search),
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    categories: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
    serverPageSize: query.data?.data?.pageSize,
  };
}