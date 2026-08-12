import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createService, deleteService, updateService } from "../services/ServicesService";

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
    onError: (err) => {
      setServerErrors(err?.response?.data?.errors || null);
      toast.error(err?.response?.data?.message || "Failed to create service.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateService(id, payload),
    onSuccess: () => {
      toast.success("Service updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      onUpdateSuccess?.();
    },
    onError: (err) => {
      setServerErrors(err?.response?.data?.errors || null);
      toast.error(err?.response?.data?.message || "Failed to update service.");
    },
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