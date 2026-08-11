import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateProvider, deleteProvider } from "../services/providersService";


export function useProviderToggleMutation({ onSuccess }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (provider) => {
      if (provider.isActive) {
        return deleteProvider(provider.id);
      }

      return activateProvider(provider.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      onSuccess?.();
    },
  });

  return { toggleMutation };
}