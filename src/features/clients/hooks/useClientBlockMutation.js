import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { clientsService } from "../services/clientsService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";


export const useClientBlockMutation = (t = (text) => text) => {
  const queryClient = useQueryClient();
  const errorMessages = {
    networkError: t("Unable to connect to the server. Please check your internet connection and try again."),
    serverError: t("Something went wrong on our side. Please try again later."),
    sessionExpired: t("Your session has expired. Please login again."),
    forbidden: t("You don't have permission to perform this action."),
  };

  return useMutation({
    mutationFn: ({ userId, isBlocked }) => clientsService.blockClient({ userId, isBlocked }),
    onSuccess: (_, { isBlocked }) => {
      toast.success(t(isBlocked ? "Client blocked" : "Client activated"));
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) =>
      // Block/unblock has no form fields to attach errors to, so setServerErrors is a no-op.
      handleMutationError(error, t("Failed to update client status."), () => {}, errorMessages),
  });
};

export default useClientBlockMutation;
