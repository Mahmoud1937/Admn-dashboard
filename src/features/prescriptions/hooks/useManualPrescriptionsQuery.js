import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getManualPrescriptions } from "../services/prescriptionsService";

export function useManualPrescriptionsQuery({ pageNumber, pageSize, status, search }) {
  const query = useQuery({
    queryKey: ["manual-prescriptions", pageNumber, pageSize, status, search],
    queryFn: ({ signal }) => getManualPrescriptions({ pageNumber, pageSize, status, search, signal }),
    placeholderData: keepPreviousData,
    // Image URLs in the response are signed for ten minutes.
    refetchInterval: 8 * 60 * 1000,
  });

  return {
    ...query,
    prescriptions: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
