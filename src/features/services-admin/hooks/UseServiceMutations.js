import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createService, deleteService, updateService } from "../services/ServicesService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";


export function useServiceMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess, t = (text) => text }) {
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
    mutationFn: createService,
    onSuccess: () => {
      toast.success(t("Service created successfully."));
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to create service."), setServerErrors, errorMessages),
  });

  const updateMutation = useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      toast.success(t("Service updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to update service."), setServerErrors, errorMessages),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      toast.success(t("Service deleted successfully."));
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || t("Failed to delete service."));
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
