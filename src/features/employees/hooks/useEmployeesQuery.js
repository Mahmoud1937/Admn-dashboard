import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getEmployees } from "../services/employeesService";


export default function useEmployeesQuery({ pageNumber, pageSize, searchTerm, employeeGroupId }) {
  const query = useQuery({
    queryKey: ["employees", { pageNumber, pageSize, searchTerm, employeeGroupId }],
    queryFn: ({ signal }) =>
      getEmployees({ pageNumber, pageSize, searchTerm, employeeGroupId, signal }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    employees: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    serverPageSize: query.data?.pageSize ?? pageSize,
  };
}