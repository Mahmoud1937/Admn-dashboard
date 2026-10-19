import { useQuery } from "@tanstack/react-query";
import { getProviderAttachments } from "../services/providerAttachmentsService";

export function useProviderAttachmentsQuery({ providerRenewalId, enabled = true }) {
  const query = useQuery({
    queryKey: ["provider-attachments", providerRenewalId],
    queryFn: ({ signal }) => getProviderAttachments({ providerRenewalId, signal }),
    enabled: enabled && !!providerRenewalId,
  });

  return {
    ...query,
    attachments: query.data?.data ?? [],
  };
}
