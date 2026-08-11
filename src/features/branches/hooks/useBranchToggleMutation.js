import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateBranch, deactivateBranch } from "../services/providerBranchesService";


export function useBranchToggleMutation({ onSuccess }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (branch) => {
      if (branch.isActive) {
        return deactivateBranch(branch.id);
      }
      return activateBranch(branch.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-branches"] });
      onSuccess?.();
    },
  });

  return { toggleMutation };
}