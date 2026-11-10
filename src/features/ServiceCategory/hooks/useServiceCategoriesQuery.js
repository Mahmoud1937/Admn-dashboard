import { useQuery } from "@tanstack/react-query";
import { getServiceCategories } from "../services/Servicecategoriesservice";


export function useServiceCategoriesQuery({ pageNumber, pageSize, search, language }) {
  const query = useQuery({
    queryKey: language
      ? ["service-categories", language, pageNumber, pageSize, search]
      : ["service-categories", pageNumber, pageSize, search],
    queryFn: () => getServiceCategories(pageNumber, pageSize, search),
    placeholderData: (previousData, previousQuery) =>
      !language || previousQuery?.queryKey[1] === language ? previousData : undefined,
  });

  return {
    ...query,
    categories: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
