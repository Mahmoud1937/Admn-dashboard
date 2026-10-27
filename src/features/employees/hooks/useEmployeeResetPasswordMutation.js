import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { resetEmployeePassword } from "../services/employeesService";

export default function useEmployeeResetPasswordMutation({ onSuccess } = {}) {
  const resetMutation = useMutation({
    mutationFn: resetEmployeePassword,
    onSuccess: (response) => {
      if (response?.succeeded === false) {
        toast.error(response?.message || "Failed to reset password.");
        return;
      }
      onSuccess?.(response);
    },
    onError: (error) =>
      handleMutationError(error, "Failed to reset password.", () => {}),
  });

  return { resetMutation };
}