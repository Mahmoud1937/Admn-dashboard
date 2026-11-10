import { useQuery } from "@tanstack/react-query";
import { getMedicines, getProviderMedicines } from "../services/Medicinesservice";


export function useMedicinesQuery({ pageNumber, pageSize, search, statusFilter, language }) {
  const query = useQuery({
    queryKey: language
      ? ["medicines", language, pageNumber, pageSize, search, statusFilter]
      : ["medicines", pageNumber, pageSize, search, statusFilter],
    queryFn: () =>
      getMedicines({
        pageNumber,
        pageSize,
        searchTerm: search,
        status: Number(statusFilter),
      }),
    placeholderData: (previousData, previousQuery) =>
      !language || previousQuery?.queryKey[1] === language ? previousData : undefined,
  });

  return {
    ...query,
    medicines: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}

export function useProviderMedicinesQuery({ providerId, pageNumber, pageSize, enabled = true, language }) {
  const query = useQuery({
    queryKey: ["provider-medicines", providerId, pageNumber, pageSize, language],
    queryFn: ({ signal }) => getProviderMedicines({ providerId, pageNumber, pageSize, signal }),
    enabled: enabled && !!providerId,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === providerId && previousQuery?.queryKey[4] === language
        ? previousData : undefined,
  });

  return {
    ...query,
    medicines: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}
