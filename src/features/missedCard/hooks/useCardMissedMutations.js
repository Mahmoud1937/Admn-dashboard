import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCardMissed, deleteCardMissed } from "../services/cardMissedService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export const useCardMissedMutations = ({ onCreateSuccess, onDeleteSuccess } = {}) => {
  const { t } = useTranslation("adminPages");
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cardMisseds"] });

  const createMutation = useMutation({
    mutationFn: (payload) => createCardMissed(payload),
    onSuccess: (data) => {
      toast.success(t("Card {{value1}} reported successfully", { value1: data.cardNumber }));
      invalidate();
      onCreateSuccess?.();
    },
    onError: (error) => {
      handleMutationError(error, t("Something went wrong. Please try again."), setServerErrors);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCardMissed(id),
    onSuccess: () => {
      toast.success(t("Record deleted successfully"));
      invalidate();
      onDeleteSuccess?.();
    },
    onError: (error) => {
      handleMutationError(error, t("Failed to delete record. Please try again."), setServerErrors);
    },
  });

  return {
    createMutation,
    deleteMutation,
    isSaving: createMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
};