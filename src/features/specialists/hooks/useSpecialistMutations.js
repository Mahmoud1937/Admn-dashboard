import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { createSpecialist, deleteSpecialist, updateSpecialist } from "../service/SpecialistsService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export function useSpecialistMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createSpecialist,
    onSuccess: () => {
      toast.success("Specialist created successfully.");
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, "Failed to create specialist.", setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: updateSpecialist,
    onSuccess: () => {
      toast.success("Specialist updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, "Failed to update specialist.", setServerErrors),
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
    clearServerErrors,
  };
}