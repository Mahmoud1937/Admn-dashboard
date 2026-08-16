import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createBranch, updateBranch } from "../services/providerBranchesService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";


export function useBranchMutations({ onCreateSuccess, onUpdateSuccess }) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      toast.success("Branch created successfully.");
      queryClient.invalidateQueries({ queryKey: ["provider-branches"] });
      onCreateSuccess?.();
    },
    onError: (error) => handleMutationError(error, "Failed to create branch.", setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: updateBranch,
    onSuccess: () => {
      toast.success("Branch updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["provider-branches"] });
      onUpdateSuccess?.();
    },
    onError: (error) => handleMutationError(error, "Failed to update branch.", setServerErrors),
  });

  return { createMutation, updateMutation, serverErrors, clearServerErrors };
}