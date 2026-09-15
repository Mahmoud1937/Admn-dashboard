import { useQuery } from "@tanstack/react-query";
import { getSubscriptionTypes } from "../services/subscriptionTypesService";

export function useSubscriptionTypesQuery({ pageNumber, pageSize, search }) {
  const query = useQuery({
    queryKey: ["subscription-types", pageNumber, pageSize, search],
    queryFn: () => getSubscriptionTypes(pageNumber, pageSize, search),
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    subscriptionTypes: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
