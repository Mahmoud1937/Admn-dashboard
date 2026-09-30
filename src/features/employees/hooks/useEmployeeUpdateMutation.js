import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { updateEmployee } from "../services/employeesService";

export default function useEmployeeUpdateMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: (response) => {
      setServerErrors(null);
      toast.success(response?.message || "Employee updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onSuccess?.();
    },
    onError: (error) =>
      handleMutationError(error, "Failed to update employee.", setServerErrors),
  });

  return {
    updateMutation,
    serverErrors,
    clearServerErrors: () => setServerErrors(null),
  };
}
