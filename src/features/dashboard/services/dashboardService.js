import axiosInstance from "../../../shared/api/axiosInstance";

export const DASHBOARD_CHART_GROUP_BY = {
  ByMonth: 1,
  ByQuarter: 2,
  ByHalfYear: 3,
  ByYear: 4,
};

export const getDashboard = async ({ fromDate, toDate }) => {
  const { data } = await axiosInstance.get("admin/dashboard", {
    params: { FromDate: fromDate, ToDate: toDate },
  });
  return data.data;
};

export const getDashboardChart = async ({ groupBy, year }) => {
  const { data } = await axiosInstance.get("admin/dashboard/chart", {
    params: { GroupBy: groupBy, Year: year },
  });
  return data.data;
};