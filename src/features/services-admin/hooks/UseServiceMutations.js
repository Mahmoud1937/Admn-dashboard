import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createService, deleteService, updateService } from "../services/ServicesService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";


export function useServiceMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      toast.success("Service created successfully.");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, "Failed to create service.", setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      toast.success("Service updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, "Failed to update service.", setServerErrors),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      toast.success("Service deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete service.");
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