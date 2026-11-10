import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCategory, deleteCategory, updateCategory } from "../service/categoryService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";


export function useCategoryMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess, t = (text) => text }) {
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
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success(t("Category created successfully."));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to create category."), setServerErrors, errorMessages),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: () => {
      toast.success(t("Category updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to update category."), setServerErrors, errorMessages),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success(t("Category deleted successfully."));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || t("Failed to delete category."));
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
