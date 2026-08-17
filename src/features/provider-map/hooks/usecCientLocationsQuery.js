import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClientLocations } from "../services/ClientMapService";
import { hasValidEgyptCoords } from "../utils/Mapcoords";


export const useClientLocationsQuery = (enabled) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["client-locations"],
    queryFn: getClientLocations,
    enabled, // only fetch once the user turns the "Users" overlay on
    staleTime: 5 * 60_000,
  });

  const locations = useMemo(
    () => (data ?? []).filter((c) => hasValidEgyptCoords(c.lat, c.lng)),
    [data]
  );

  return { locations, isLoading, isError };
};