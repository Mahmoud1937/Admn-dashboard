import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { createMedicine, deleteMedicine, updateMedicine } from "../services/Medicinesservice";

export function useMedicineMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const handleError = (err, fallbackMessage) => {
    const fieldErrors = err?.response?.data?.errors;
    if (fieldErrors) {
      setServerErrors(fieldErrors);
    } else {
      toast.error(err?.response?.data?.message || fallbackMessage);
    }
  };

  const createMutation = useMutation({
    mutationFn: createMedicine,
    onSuccess: () => {
      toast.success("Medicine created successfully.");
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      setServerErrors(null);
      onCreateSuccess?.();
    },
    onError: (err) => handleError(err, "Failed to create medicine."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateMedicine(id, payload),
    onSuccess: () => {
      toast.success("Medicine updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      setServerErrors(null);
      onUpdateSuccess?.();
    },
    onError: (err) => handleError(err, "Failed to update medicine."),
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
    clearServerErrors: () => setServerErrors(null),
  };
}