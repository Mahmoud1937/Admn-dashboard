import { useQuery } from "@tanstack/react-query";
import { getFamilyMembers } from "../services/clientsService";


export function useFamilyMembersQuery(clientId) {
  const query = useQuery({
    queryKey: ["client-family-members", clientId],
    queryFn: () => getFamilyMembers(clientId),
    enabled: !!clientId,
  });

  return {
    ...query,
    familyMembers: query.data?.data ?? [],
  };
}