import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../services/dashboardService";


export const useDashboard = (filters, enabled = true, language) =>
  useQuery({
    queryKey: language ? ["dashboard", filters, language] : ["dashboard", filters],
    queryFn: () => getDashboard(filters),
    enabled,
  });
