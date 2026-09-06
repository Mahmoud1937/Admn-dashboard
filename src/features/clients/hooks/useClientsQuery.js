import { useState, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { clientsService } from "../services/clientsService";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";


// PlatformType enum mirrors the backend contract
export const PLATFORM_TYPE = {
  ANDROID: 0,
  IOS: 1,
  WEB: 2,
};

const DEFAULT_FILTERS = {
  searchTerm: "",
  platformType: "", // "" = all, otherwise 0 | 1 | 2
  isMale: "", // "" = all, otherwise "true" | "false"
  hasCard: "", // "" = all, otherwise "true" | "false"
};

/**
 * @param {object} poolSource - optional, used when this page is opened from
 *   Card Pool or Card Sold to scope clients to that batch.
 *   { id: number, sourceType: 1 | 2 } // 1 = card pool, 2 = sold card
 */
export const useClientsQuery = (poolSource) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // resetKey ties the pagination hook's own "reset to page 1" effect to
  // whatever the current filters + pool source are.
  const resetKey = JSON.stringify({ filters, poolSource });

  const {
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  } = useServerPagination({ resetKey });

  const queryParams = useMemo(
    () => ({
      searchTerm: filters.searchTerm || undefined,
      platformType: filters.platformType === "" ? undefined : Number(filters.platformType),
      isMale: filters.isMale === "" ? undefined : filters.isMale === "true",
      hasCard: filters.hasCard === "" ? undefined : filters.hasCard === "true",
      id: poolSource?.id,
      sourceType: poolSource?.sourceType,
      pageNumber,
      pageSize,
    }),
    [filters, pageNumber, pageSize, poolSource]
  );

  const query = useQuery({
    queryKey: ["clients", queryParams],
    queryFn: () => clientsService.getClients(queryParams),
    placeholderData: keepPreviousData,
  });

  const updateFilters = (partial) => setFilters((prev) => ({ ...prev, ...partial }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const totalCount = query.data?.data?.totalCount ?? 0;
  // NOTE: the API's own totalPages field has been observed to return 0
  // even when totalCount > 0, so it's computed client-side instead.
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    clients: query.data?.data?.items ?? [],
    totalCount,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    filters,
    updateFilters,
    resetFilters,
    pageNumber,
    pageSize,
    goToPage,
    handlePageSizeChange,
    getPageNumbers,
  };
};

export default useClientsQuery;