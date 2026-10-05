import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../services/dashboardService";


export const useDashboard = (filters, enabled = true) =>
  useQuery({
    queryKey: ["dashboard", filters],
    queryFn: () => getDashboard(filters),
    enabled,
  });
