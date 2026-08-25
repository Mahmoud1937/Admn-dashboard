import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useState } from "react";

import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { getTermsAndConditions, updateTermsAndConditions } from "../services/Termsandconditionsservice";

export const TERMS_AND_CONDITIONS_QUERY_KEY = [
  "termsAndConditions",
];

/**
 * Get Terms & Conditions
 */
export function useTermsAndConditionsQuery() {
  return useQuery({
    queryKey: TERMS_AND_CONDITIONS_QUERY_KEY,

    queryFn: getTermsAndConditions,

    // The API wraps the actual payload inside a `data` envelope:
    // { httpStatusCode, succeeded, message, data: { descriptionEn, descriptionAr, updatedAt } }
    // so we need to read from response.data, not from the response root.
    select: (response) => ({
      en: response?.data?.descriptionEn ?? "",
      ar: response?.data?.descriptionAr ?? "",
      updatedAt: response?.data?.updatedAt ?? null,
    }),
  });
}

/**
 * Update Terms & Conditions
 */
export function useTermsAndConditionsMutation() {
  const queryClient = useQueryClient();

  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => {
    setServerErrors(null);
  };

  const toFieldName = (backendKey) => {
    if (/descriptionen/i.test(backendKey)) {
      return "en";
    }

    if (/descriptionar/i.test(backendKey)) {
      return "ar";
    }

    return (
      backendKey.charAt(0).toLowerCase() +
      backendKey.slice(1)
    );
  };

  const mutation = useMutation({
    mutationFn: ({ en, ar }) =>
      updateTermsAndConditions({
        descriptionEn: en,
        descriptionAr: ar,
      }),

    onMutate: () => {
      clearServerErrors();
    },

    onSuccess: () => {
      clearServerErrors();

      queryClient.invalidateQueries({
        queryKey: TERMS_AND_CONDITIONS_QUERY_KEY,
      });
    },

    onError: (error) => {
      handleMutationError(
        error,
        "Failed to update Terms & Conditions",
        (errors) => {
          if (!errors || typeof errors !== "object") {
            setServerErrors(null);
            return;
          }

          const mapped = Object.entries(errors).reduce(
            (acc, [key, messages]) => {
              const fieldName = toFieldName(key);

              acc[fieldName] = Array.isArray(messages)
                ? messages[0]
                : messages;

              return acc;
            },
            {}
          );

          setServerErrors(mapped);
        }
      );
    },
  });

  return {
    ...mutation,
    serverErrors,
    clearServerErrors,
  };
}