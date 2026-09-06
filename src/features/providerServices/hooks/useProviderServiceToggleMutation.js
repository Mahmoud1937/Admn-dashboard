import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  activateProviderService,
  deactivateProviderService,
} from "../services/providerServicesService";

export function useProviderServiceToggleMutation({ onSuccess }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (service) => {
      if (service.isActive) {
        return deactivateProviderService(service.id);
      }

      return activateProviderService(service.id);
    },

    onSuccess: () => {
      toast.success("Service status updated successfully.");

      queryClient.invalidateQueries({
        queryKey: ["provider-services"],
      });

      onSuccess?.();
    },

    onError: () => {
      toast.error(
        "Unable to update service status. Please try again."
      );
    },
  });

  return {
    toggleMutation,
  };
}