import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createServiceCategory, deleteServiceCategory, updateServiceCategory } from "../services/Servicecategoriesservice";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export function useServiceCategoryMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess, t = (text) => text }) {
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
    mutationFn: createServiceCategory,
    onSuccess: () => {
      toast.success(t("Service category created successfully."));
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to create service category."), setServerErrors, errorMessages),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateServiceCategory(id, payload),
    onSuccess: () => {
      toast.success(t("Service category updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to update service category."), setServerErrors, errorMessages),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServiceCategory,
    onSuccess: () => {
      toast.success(t("Service category deleted successfully."));
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || t("Failed to delete service category."));
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
