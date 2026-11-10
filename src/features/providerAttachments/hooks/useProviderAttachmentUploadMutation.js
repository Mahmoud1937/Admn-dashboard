import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProviderAttachments } from "../services/providerAttachmentsService";

export function useProviderAttachmentUploadMutation({ providerRenewalId, language }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachments) => uploadProviderAttachments({ providerRenewalId, attachments }),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ["provider-attachments", providerRenewalId, language],
      exact: true,
    }),
  });
}
