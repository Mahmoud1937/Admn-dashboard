import { useQuery } from "@tanstack/react-query";
import { getMedicines } from "../services/Medicinesservice";


export function useMedicinesQuery({ pageNumber, pageSize, search, statusFilter }) {
  const query = useQuery({
    queryKey: ["medicines", pageNumber, pageSize, search, statusFilter],
    queryFn: () =>
      getMedicines({
        pageNumber,
        pageSize,
        searchTerm: search,
        status: Number(statusFilter),
      }),
    placeholderData: (previousData) => previousData,
  });

  return {
    ...query,
    medicines: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
    serverPageSize: query.data?.data?.pageSize,
  };
}