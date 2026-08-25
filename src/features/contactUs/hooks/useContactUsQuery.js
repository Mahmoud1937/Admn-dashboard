import { useQuery } from "@tanstack/react-query";
import { getContactUs } from "../services/contactsUsService";


export function useContactUsQuery() {
  const query = useQuery({
    queryKey: ["contact-us"],
    queryFn: getContactUs,
  });

  return {
    ...query,
    contactUs: query.data?.data ?? null,
  };
}