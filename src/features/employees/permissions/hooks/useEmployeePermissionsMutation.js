import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateEmployeePermissions } from "../services/permissionsService";
import { handleMutationError } from "../../../../shared/utils/handleMutationError";
import { useAuth } from "../../../auth/context/Authcontext";


export default function useEmployeePermissionsMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();
  const { user, refreshPermissions } = useAuth();

  const permissionsMutation = useMutation({
    mutationFn: updateEmployeePermissions,
    onSuccess: async (response, variables) => {
      if (response?.succeeded === false) {
        toast.error(response?.message || "Failed to update permissions.");
        return;
      }

      toast.success(response?.message || "Permissions updated successfully.");

      queryClient.setQueriesData({ queryKey: ["employees"] }, (current) => {
        if (!current?.items) return current;

        return {
          ...current,
          items: current.items.map((employee) => {
            const id = employee.employeeId ?? employee.id;
            return String(id) === String(variables.employeeId)
              ? { ...employee, permissionIds: variables.permissionIds }
              : employee;
          }),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onSuccess?.();

      const isCurrentEmployee =
        user?.employeeId != null &&
        String(user.employeeId) === String(variables.employeeId);

      if (isCurrentEmployee) {
        try {
          await refreshPermissions();
        } catch {
          toast.error(
            "Permissions were updated, but your current permissions could not be reloaded. Please try again."
          );
        }
      }
    },
    onError: (error) =>
      handleMutationError(error, "Failed to update permissions.", () => {}),
  });

  return { permissionsMutation };
}
