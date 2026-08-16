import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createServiceCategory, deleteServiceCategory, updateServiceCategory } from "../services/Servicecategoriesservice";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export function useServiceCategoryMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createServiceCategory,
    onSuccess: () => {
      toast.success("Service category created successfully.");
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, "Failed to create service category.", setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateServiceCategory(id, payload),
    onSuccess: () => {
      toast.success("Service category updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, "Failed to update service category.", setServerErrors),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServiceCategory,
    onSuccess: () => {
      toast.success("Service category deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete service category.");
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