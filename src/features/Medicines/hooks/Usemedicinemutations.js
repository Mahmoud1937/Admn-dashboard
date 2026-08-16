import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { createMedicine, deleteMedicine, updateMedicine } from "../services/Medicinesservice";
import { handleMutationError } from "../../../shared/utils/handleMutationError";


export function useMedicineMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createMedicine,
    onSuccess: () => {
      toast.success("Medicine created successfully.");
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, "Failed to create medicine.", setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateMedicine(id, payload),
    onSuccess: () => {
      toast.success("Medicine updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, "Failed to update medicine.", setServerErrors),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedicine,
    onSuccess: () => {
      toast.success("Medicine deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete medicine.");
    },
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