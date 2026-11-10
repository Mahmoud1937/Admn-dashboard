import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getManualPrescriptions } from "../services/prescriptionsService";

export function useManualPrescriptionsQuery({ pageNumber, pageSize, status, search, language }) {
  const query = useQuery({
    queryKey: language
      ? ["manual-prescriptions", language, pageNumber, pageSize, status, search]
      : ["manual-prescriptions", pageNumber, pageSize, status, search],
    queryFn: ({ signal }) => getManualPrescriptions({ pageNumber, pageSize, status, search, signal }),
    placeholderData: (previousData, previousQuery) =>
      !language || previousQuery?.queryKey[1] === language ? keepPreviousData(previousData) : undefined,
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
