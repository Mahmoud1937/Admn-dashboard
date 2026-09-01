import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCardMissed, deleteCardMissed } from "../services/cardMissedService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export const useCardMissedMutations = ({ onCreateSuccess, onDeleteSuccess } = {}) => {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cardMisseds"] });

  const createMutation = useMutation({
    mutationFn: (payload) => createCardMissed(payload),
    onSuccess: (data) => {
      toast.success(`Card ${data.cardNumber} reported successfully`);
      invalidate();
      onCreateSuccess?.();
    },
    onError: (error) => {
      handleMutationError(error, "Something went wrong. Please try again.", setServerErrors);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCardMissed(id),
    onSuccess: () => {
      toast.success("Record deleted successfully");
      invalidate();
      onDeleteSuccess?.();
    },
    onError: (error) => {
      handleMutationError(error, "Failed to delete record. Please try again.", setServerErrors);
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