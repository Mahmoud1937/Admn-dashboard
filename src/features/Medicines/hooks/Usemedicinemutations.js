import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { createMedicine, deleteMedicine, updateMedicine } from "../services/Medicinesservice";
import { handleMutationError } from "../../../shared/utils/handleMutationError";


export function useMedicineMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess, t = (text) => text }) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);
  const errorMessages = {
    networkError: t("Unable to connect to the server. Please check your internet connection and try again."),
    serverError: t("Something went wrong on our side. Please try again later."),
    sessionExpired: t("Your session has expired. Please login again."),
    forbidden: t("You don't have permission to perform this action."),
  };

  const createMutation = useMutation({
    mutationFn: createMedicine,
    onSuccess: () => {
      toast.success(t("Medicine created successfully."));
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to create medicine."), setServerErrors, errorMessages),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateMedicine(id, payload),
    onSuccess: () => {
      toast.success(t("Medicine updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to update medicine."), setServerErrors, errorMessages),
  });

const deleteMutation = useMutation({
  mutationFn: deleteMedicine,

  onSuccess: () => {
    toast.success(t("Medicine deleted successfully."));
    queryClient.invalidateQueries({ queryKey: ["medicines"] });
    onDeleteSuccess?.();
  },

  onError: (err) =>
    handleMutationError(
      err,
      t("Failed to delete medicine."),
      setServerErrors,
      errorMessages
    ),
});
  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isSaving: createMutation.isPending || updateMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
}
