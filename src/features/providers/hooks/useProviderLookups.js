import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../categoreis/service/categoryService";
import { getSpecialists } from "../../specialists/service/specialistsService";

export function useProviderCategoriesLookup() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories", "dropdown"],
    queryFn: () => getCategories(),
  });

  return {
    categories: data?.data?.items ?? [],
    isLoading,
  };
}

export function useProviderSpecialistsLookup() {
  const { data, isLoading } = useQuery({
    queryKey: ["specialists", "dropdown"],
    queryFn: () => getSpecialists(1, 1000),
  });

  return {
    specialists: data?.data?.items ?? [],
    isLoading,
  };
}