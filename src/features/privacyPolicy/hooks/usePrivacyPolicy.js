import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { getPrivacyPolicy, updatePrivacyPolicy } from "../services/PrivacyPolicyservice";

export const PRIVACY_POLICY_QUERY_KEY = ["privacyPolicy"];

export function usePrivacyPolicyQuery() {
  return useQuery({
    queryKey: PRIVACY_POLICY_QUERY_KEY,
    queryFn: getPrivacyPolicy,
    select: (response) => ({
      en: response?.data?.descriptionEn ?? "",
      ar: response?.data?.descriptionAr ?? "",
      updatedAt: response?.data?.updatedAt ?? null,
    }),
  });
}

export function usePrivacyPolicyMutation() {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const toFieldName = (backendKey) => {
    if (/descriptionen/i.test(backendKey)) return "en";
    if (/descriptionar/i.test(backendKey)) return "ar";
    return backendKey.charAt(0).toLowerCase() + backendKey.slice(1);
  };

  const mutation = useMutation({
    mutationFn: ({ en, ar }) =>
      updatePrivacyPolicy({ descriptionEn: en, descriptionAr: ar }),
    onMutate: () => clearServerErrors(),
    onSuccess: () => {
      clearServerErrors();
      queryClient.invalidateQueries({ queryKey: PRIVACY_POLICY_QUERY_KEY });
    },
    onError: (error) => {
      handleMutationError(error, "Failed to update Privacy Policy", (errors) => {
        if (!errors || typeof errors !== "object") {
          setServerErrors(null);
          return;
        }
        const mapped = Object.entries(errors).reduce((acc, [key, messages]) => {
          acc[toFieldName(key)] = Array.isArray(messages) ? messages[0] : messages;
          return acc;
        }, {});
        setServerErrors(mapped);
      });
    },
  });

  return { ...mutation, serverErrors, clearServerErrors };
}
