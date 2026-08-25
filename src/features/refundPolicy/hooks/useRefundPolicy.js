import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { getRefundPolicy, updateRefundPolicy } from "../services/RefundPolicyservice";

export const REFUND_POLICY_QUERY_KEY = ["refundPolicy"];

export function useRefundPolicyQuery() {
  return useQuery({
    queryKey: REFUND_POLICY_QUERY_KEY,
    queryFn: getRefundPolicy,
    select: (response) => ({
      en: response?.data?.descriptionEn ?? "",
      ar: response?.data?.descriptionAr ?? "",
      updatedAt: response?.data?.updatedAt ?? null,
    }),
  });
}

export function useRefundPolicyMutation() {
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
      updateRefundPolicy({ descriptionEn: en, descriptionAr: ar }),
    onMutate: () => clearServerErrors(),
    onSuccess: () => {
      clearServerErrors();
      queryClient.invalidateQueries({ queryKey: REFUND_POLICY_QUERY_KEY });
    },
    onError: (error) => {
      handleMutationError(error, "Failed to update Refund Policy", (errors) => {
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
