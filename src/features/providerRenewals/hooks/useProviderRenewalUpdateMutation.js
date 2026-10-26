import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateProviderRenewal } from "../services/providerRenewalsService";

export function useProviderRenewalUpdateMutation({ providerId }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values) => updateProviderRenewal({ ...values, providerId }),
    retry: false,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["provider-renewals", providerId],
      });
      toast.success(response?.message || "Renewal updated successfully.");
    },
  });
}
