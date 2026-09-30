import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { registerEmployee } from "../services/employeesService";

export default function useEmployeeCreateMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const createMutation = useMutation({
    mutationFn: registerEmployee,
    onSuccess: (response) => {
      setServerErrors(null);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onSuccess?.(response);
    },
    onError: (error) =>
      handleMutationError(error, "Failed to register employee.", setServerErrors),
  });

  return {
    createMutation,
    serverErrors,
    clearServerErrors: () => setServerErrors(null),
  };
}
