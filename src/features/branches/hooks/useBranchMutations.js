import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createBranch, updateBranch } from "../services/providerBranchesService";



export function useBranchMutations({ onCreateSuccess, onUpdateSuccess }) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      toast.success("Branch created successfully.");
      queryClient.invalidateQueries({ queryKey: ["provider-branches"] });
      onCreateSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create branch.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBranch,
    onSuccess: () => {
      toast.success("Branch updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["provider-branches"] });
      onUpdateSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update branch.");
    },
  });

  return {
    createMutation,
    updateMutation,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}