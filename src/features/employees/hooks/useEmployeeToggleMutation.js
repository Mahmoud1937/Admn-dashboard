import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { toggleEmployeeActive } from "../services/employeesService";

export default function useEmployeeToggleMutation() {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: toggleEmployeeActive,
    onSuccess: (response) => {
      const isBlocked = response?.data === true;
      toast.success(
        response?.message ||
          (isBlocked ? "Employee blocked successfully." : "Employee activated successfully.")
      );
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error) =>
      handleMutationError(error, "Failed to update employee status.", () => {}),
  });

  return { toggleMutation };
}
