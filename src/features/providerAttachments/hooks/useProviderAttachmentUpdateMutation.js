import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProviderAttachment } from "../services/providerAttachmentsService";

export function useProviderAttachmentUpdateMutation({ providerRenewalId }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProviderAttachment,
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ["provider-attachments", providerRenewalId],
      exact: true,
    }),
  });
}
