import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { resetEmployeePassword } from "../services/employeesService";
import { useAuth } from "../../auth/context/Authcontext";

export default function useEmployeeResetPasswordMutation({ onSuccess } = {}) {
  const { user } = useAuth();
  const resetMutation = useMutation({
    mutationFn: resetEmployeePassword,
    onSuccess: (response, { employeeId }) => {
      if (response?.succeeded === false) {
        toast.error(response?.message || "Failed to reset password.");
        return;
      }
      const isCurrentEmployee = user?.employeeId != null && String(user.employeeId) === String(employeeId);
      onSuccess?.(response, { isCurrentEmployee });
    },
    onError: (error) =>
      handleMutationError(error, "Failed to reset password.", () => {}),
  });

  return { resetMutation };
}