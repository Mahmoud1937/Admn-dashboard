import { useEffect, useState } from "react";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import useEmployeesQuery from "../hooks/useEmployeesQuery";
import EmployeeGroupSelect from "../../../shared/components/EmployeeGroupSelect";
import EmployeesTable from "../components/EmployeesTable";
import Pagination from "../../../shared/components/Pagination";
import SearchBarWithFilters from "../../../shared/components/SearchBarWithFilters";
import useEmployeeToggleMutation from "../hooks/useEmployeeToggleMutation";
import useEmployeeUpdateMutation from "../hooks/useEmployeeUpdateMutation";
import useEmployeeCreateMutation from "../hooks/useEmployeeCreateMutation";
import EmployeeFormModal from "../components/EmployeeFormModal";
import EmployeePasswordModal from "../components/EmployeePasswordModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";


function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [groupId, setGroupId] = useState("");
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { pageNumber, pageSize, goToPage, handlePageSizeChange, getPageNumbers } =
    useServerPagination({ resetKey: `${debouncedSearch}-${groupId}` });

  const { employees, totalCount, totalPages, isLoading, isError, error } =
    useEmployeesQuery({
      pageNumber,
      pageSize,
      searchTerm: debouncedSearch,
      employeeGroupId: groupId,
    });

  const { toggleMutation } = useEmployeeToggleMutation();
  const {
    updateMutation,
    serverErrors,
    clearServerErrors,
  } = useEmployeeUpdateMutation({
    onSuccess: () => setEmployeeToEdit(null),
  });
  const {
    createMutation,
    serverErrors: createServerErrors,
    clearServerErrors: clearCreateServerErrors,
  } = useEmployeeCreateMutation({
    onSuccess: (response) => {
      setIsCreateOpen(false);
      setGeneratedPassword(response?.password || "");
    },
  });

  const openEmployeeEdit = (employee) => {
    clearServerErrors();
    setEmployeeToEdit(employee);
  };

  const saveEmployee = (values) => {
    clearServerErrors();
    updateMutation.mutate({
      employeeId: employeeToEdit.employeeId ?? employeeToEdit.id,
      payload: values,
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Employees</h1>
        <button
          type="button"
          onClick={() => {
            clearCreateServerErrors();
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Employee
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <SearchBarWithFilters
          value={search}
          onChange={setSearch}
          placeholder="Search by name, phone or email..."
          showFilterButton={false}
        >
          <div className="w-full shrink-0 sm:w-64">
            <EmployeeGroupSelect
              queryKey={["employee-groups-lookup", "employees-filter"]}
              value={groupId}
              onChange={(id) => setGroupId(id ?? "")}
              placeholder="All groups"
              clearable
            />
          </div>
        </SearchBarWithFilters>
      </div>

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error?.message || "Failed to load employees"}
        </div>
      )}

      <EmployeesTable
        employees={employees}
        isLoading={isLoading}
        onToggleStatus={(employee) =>
          toggleMutation.mutate(employee.employeeId ?? employee.id)
        }
        onEdit={openEmployeeEdit}
        togglingEmployeeId={
          toggleMutation.isPending ? toggleMutation.variables : null
        }
      />

      <EmployeeFormModal
        isOpen={Boolean(employeeToEdit) || isCreateOpen}
        employee={employeeToEdit}
        onSave={(values) => {
          if (employeeToEdit) {
            saveEmployee(values);
            return;
          }

          clearCreateServerErrors();
          createMutation.mutate({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            employeeMemberId: values.employeeGroupId,
          });
        }}
        onClose={() => {
          if (employeeToEdit) {
            clearServerErrors();
            setEmployeeToEdit(null);
          } else {
            clearCreateServerErrors();
            setIsCreateOpen(false);
          }
        }}
        isSaving={updateMutation.isPending || createMutation.isPending}
        serverErrors={employeeToEdit ? serverErrors : createServerErrors}
      />

      <EmployeePasswordModal
        password={generatedPassword}
        onClose={() => setGeneratedPassword("")}
      />

      <Pagination
        pageNumber={pageNumber}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        itemLabel="employees"
        onGoToPage={(page) => goToPage(page, totalPages)}
        onPageSizeChange={handlePageSizeChange}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
}
