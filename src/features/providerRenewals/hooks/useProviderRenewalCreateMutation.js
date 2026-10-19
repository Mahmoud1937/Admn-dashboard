import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProviderRenewal } from "../services/providerRenewalsService";

export function useProviderRenewalCreateMutation({ providerId }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values) => createProviderRenewal({ ...values, providerId }),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ["provider-renewals", providerId],
    }),
  });
}
