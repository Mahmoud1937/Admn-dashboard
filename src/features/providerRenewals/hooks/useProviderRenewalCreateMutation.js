import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createProviderRenewal } from "../services/providerRenewalsService";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";

export function useProviderRenewalCreateMutation({ providerId }) {
  const tr = useProviderDetailsText();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values) => createProviderRenewal({ ...values, providerId }),
    retry: false,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["provider-renewals", providerId],
      });
      toast.success(response?.message || tr("Renewal created successfully."));
    },
  });
}
