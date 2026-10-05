import { useQuery } from "@tanstack/react-query";
import { getDashboardChart } from "../services/dashboardService";


export const useDashboardChart = (filters) =>
  useQuery({
    queryKey: ["dashboard-chart", filters],
    queryFn: () => getDashboardChart(filters),
    // react-query v4:
    keepPreviousData: true,
    // react-query v5 (استبدل السطر اللي فوق بده):
    // placeholderData: (prev) => prev,
  });