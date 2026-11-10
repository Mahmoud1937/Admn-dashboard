import { useQuery } from "@tanstack/react-query";
import { getProviderAttachments } from "../services/providerAttachmentsService";

export function useProviderAttachmentsQuery({ providerRenewalId, enabled = true, language }) {
  const query = useQuery({
    queryKey: ["provider-attachments", providerRenewalId, language],
    queryFn: ({ signal }) => getProviderAttachments({ providerRenewalId, signal }),
    enabled: enabled && !!providerRenewalId,
  });

  return {
    ...query,
    attachments: query.data?.data ?? [],
  };
}
