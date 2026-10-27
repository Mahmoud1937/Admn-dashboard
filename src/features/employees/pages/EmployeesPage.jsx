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
import useEmployeeResetPasswordMutation from "../hooks/useEmployeeResetPasswordMutation";
import EmployeeFormModal from "../components/EmployeeFormModal";
import EmployeePasswordModal from "../components/EmployeePasswordModal";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import useEmployeePermissionsMutation from "../permissions/hooks/useEmployeePermissionsMutation";
import EmployeePermissionsModal from "../permissions/components/EmployeePermissionsModal";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import usePermission from "../../auth/hooks/usePermission";
import { useAuth } from "../../auth/context/Authcontext";
import useAuthMutations from "../../auth/hooks/useAuthMutations";
import toast from "react-hot-toast";


function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

const getEmployeeLabel = (employee) =>
  [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
  employee?.employeeName ||
  employee?.name ||
  "this employee";

const extractPassword = (response) => {
  const data = response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  return (
    response?.password ??
    data?.password ??
    data?.newPassword ??
    data?.temporaryPassword ??
    ""
  );
};

export default function EmployeesPage() {
  const { showResetPasswordNotice } = useAuth();
  const { clearSessionAndRedirect } = useAuthMutations();
  const canViewEmployees = usePermission(PERMISSION_CODES.EMPLOYEES_READ);
  const canCreateEmployees = usePermission(PERMISSION_CODES.EMPLOYEES_CREATE);
  const canUpdateEmployees = usePermission(PERMISSION_CODES.EMPLOYEES_UPDATE);
  const canManagePermissions = usePermission(
    PERMISSION_CODES.EMPLOYEES_MANAGE_PERMISSIONS
  );
  const [search, setSearch] = useState("");
  const [groupId, setGroupId] = useState("");
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [employeePendingToggle, setEmployeePendingToggle] = useState(null);
  const [employeePendingReset, setEmployeePendingReset] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 400);
  const [permissionsTarget, setPermissionsTarget] = useState(null);
  const { permissionsMutation } = useEmployeePermissionsMutation({
    onSuccess: () => setPermissionsTarget(null),
  });
  const { pageNumber, pageSize, goToPage, handlePageSizeChange, getPageNumbers } =
    useServerPagination({ resetKey: `${debouncedSearch}-${groupId}` });

  const { employees, totalCount, totalPages, isLoading, isError, error } =
    useEmployeesQuery({
      pageNumber,
      pageSize,
      searchTerm: debouncedSearch,
      employeeGroupId: groupId,
      enabled: canViewEmployees,
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
  const { resetMutation } = useEmployeeResetPasswordMutation({
    onSuccess: (response, { isCurrentEmployee }) => {
      setEmployeePendingReset(null);
      const password = extractPassword(response);
      if (isCurrentEmployee) {
        if (!password) {
          toast.error("Your password was reset, but no new password was returned. Please contact your administrator.");
          return;
        }
        showResetPasswordNotice(password);
        clearSessionAndRedirect();
        return;
      }
      setGeneratedPassword(password);
    },
  });

  const openEmployeeEdit = (employee) => {
    if (!canUpdateEmployees) return;
    clearServerErrors();
    setEmployeeToEdit(employee);
  };

  const saveEmployee = (values) => {
    if (!canUpdateEmployees) return;
    clearServerErrors();
    updateMutation.mutate({
      employeeId: employeeToEdit.employeeId ?? employeeToEdit.id,
      payload: values,
    });
  };

  const confirmToggleStatus = () => {
    if (!canUpdateEmployees || !employeePendingToggle) return;

    toggleMutation.mutate(
      employeePendingToggle.employeeId ?? employeePendingToggle.id,
      { onSettled: () => setEmployeePendingToggle(null) }
    );
  };

  const confirmResetPassword = () => {
    if (!canUpdateEmployees || !employeePendingReset) return;

    resetMutation.mutate(
      { employeeId: employeePendingReset.employeeId ?? employeePendingReset.id },
      { onError: () => setEmployeePendingReset(null) }
    );
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Employees</h1>
        {canCreateEmployees && (
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
        )}
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
        onToggleStatus={setEmployeePendingToggle}
        onEdit={openEmployeeEdit}
        onResetPassword={setEmployeePendingReset}
        onManagePermissions={setPermissionsTarget}
        canUpdate={canUpdateEmployees}
        canManagePermissions={canManagePermissions}
        togglingEmployeeId={
          toggleMutation.isPending ? toggleMutation.variables : null
        }
      />
      {permissionsTarget && canManagePermissions && (
        <EmployeePermissionsModal
          key={permissionsTarget.employeeId ?? permissionsTarget.id}
          employee={permissionsTarget}
          onClose={() => setPermissionsTarget(null)}
          onSave={(permissionIds) =>
            permissionsMutation.mutate({
              employeeId: permissionsTarget.employeeId ?? permissionsTarget.id,
              permissionIds,
            })
          }
          isSaving={permissionsMutation.isPending}
        />
      )}
      <EmployeeFormModal
        isOpen={
          (Boolean(employeeToEdit) && canUpdateEmployees) ||
          (isCreateOpen && canCreateEmployees)
        }
        employee={employeeToEdit}
        onSave={(values) => {
          if (employeeToEdit) {
            saveEmployee(values);
            return;
          }

          if (!canCreateEmployees) return;

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
        key={generatedPassword || "employee-password"}
        password={generatedPassword}
        onClose={() => setGeneratedPassword("")}
      />

      {employeePendingToggle && canUpdateEmployees && (
        <ConfirmDeleteModal
          isOpen
          variant={employeePendingToggle.isBlocked ? "success" : "danger"}
          title={employeePendingToggle.isBlocked ? "Activate employee?" : "Block employee?"}
          message={`Are you sure you want to ${
            employeePendingToggle.isBlocked ? "activate" : "block"
          } ${getEmployeeLabel(employeePendingToggle)}?`}
          confirmLabel={employeePendingToggle.isBlocked ? "Activate" : "Block"}
          isLoading={toggleMutation.isPending}
          onConfirm={confirmToggleStatus}
          onCancel={() => setEmployeePendingToggle(null)}
        />
      )}

      {employeePendingReset && canUpdateEmployees && (
        <ConfirmDeleteModal
          isOpen
          variant="danger"
          title="Reset password?"
          message={`A new password will be generated for ${getEmployeeLabel(
            employeePendingReset
          )} and the current one will stop working immediately.`}
          confirmLabel="Reset Password"
          isLoading={resetMutation.isPending}
          onConfirm={confirmResetPassword}
          onCancel={() => setEmployeePendingReset(null)}
        />
      )}

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
