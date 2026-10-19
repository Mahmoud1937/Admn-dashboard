import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProviderAttachment } from "../services/providerAttachmentsService";

export function useProviderAttachmentDeleteMutation({ providerRenewalId }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProviderAttachment,
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ["provider-attachments", providerRenewalId],
      exact: true,
    }),
  });
}
