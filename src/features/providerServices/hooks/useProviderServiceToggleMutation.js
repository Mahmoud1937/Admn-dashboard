import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateProviderService, deactivateProviderService } from "../services/providerServicesService";

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
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
      onSuccess?.();
    },
  });

  return { toggleMutation };
}