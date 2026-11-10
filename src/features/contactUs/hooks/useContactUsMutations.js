import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateContactUs } from "../services/contactsUsService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export function useContactUsMutations({ onUpdateSuccess } = {}) {
  const { t } = useTranslation("adminPages");
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const updateMutation = useMutation({
    mutationFn: updateContactUs,
    onSuccess: () => {
      toast.success(t("Contact info updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["contact-us"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to update contact info."), setServerErrors),
  });

  return {
    updateMutation,
    isSaving: updateMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
}