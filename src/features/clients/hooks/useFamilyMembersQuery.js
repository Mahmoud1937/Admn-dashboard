import { useQuery } from "@tanstack/react-query";
import { getFamilyMembers } from "../services/clientsService";


export function useFamilyMembersQuery(clientId, language) {
  const query = useQuery({
    queryKey: language ? ["client-family-members", language, clientId] : ["client-family-members", clientId],
    queryFn: () => getFamilyMembers(clientId),
    enabled: !!clientId,
  });

  return {
    ...query,
    familyMembers: query.data?.data ?? [],
  };
}
