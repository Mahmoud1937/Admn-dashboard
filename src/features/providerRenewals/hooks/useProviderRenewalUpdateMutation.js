import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProviderRenewal } from "../services/providerRenewalsService";

export function useProviderRenewalUpdateMutation({ providerId }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values) => updateProviderRenewal({ ...values, providerId }),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ["provider-renewals", providerId],
    }),
  });
}
