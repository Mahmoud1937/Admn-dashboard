import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { createSpecialist, deleteSpecialist, updateSpecialist } from "../service/SpecialistsService";


export function useSpecialistMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) {
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
    mutationFn: createSpecialist,
    onSuccess: () => {
      toast.success("Specialist created successfully.");
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      setServerErrors(null);
      onCreateSuccess?.();
    },
    onError: (err) => handleError(err, "Failed to create specialist."),
  });

  const updateMutation = useMutation({
    mutationFn: updateSpecialist,
    onSuccess: () => {
      toast.success("Specialist updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      setServerErrors(null);
      onUpdateSuccess?.();
    },
    onError: (err) => handleError(err, "Failed to update specialist."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpecialist,
    onSuccess: () => {
      toast.success("Specialist deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete specialist.");
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