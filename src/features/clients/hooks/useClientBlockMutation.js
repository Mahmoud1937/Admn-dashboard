import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { clientsService } from "../services/clientsService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";


export const useClientBlockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isBlocked }) => clientsService.blockClient({ userId, isBlocked }),
    onSuccess: (_, { isBlocked }) => {
      toast.success(isBlocked ? "Client blocked" : "Client activated");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) =>
      // Block/unblock has no form fields to attach errors to, so setServerErrors is a no-op.
      handleMutationError(error, "Failed to update client status.", () => {}),
  });
};

export default useClientBlockMutation;