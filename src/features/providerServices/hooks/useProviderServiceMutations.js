import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createProviderService, updateProviderService } from "../services/providerServicesService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export function useProviderServiceMutations({ onCreateSuccess, onUpdateSuccess }) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createProviderService,
    onSuccess: () => {
      toast.success("Service added successfully.");
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, "Failed to add service.", setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: updateProviderService,
    onSuccess: () => {
      toast.success("Service updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["provider-services"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, "Failed to save changes.", setServerErrors),
  });

  return {
    createMutation,
    updateMutation,
    isSaving: createMutation.isPending || updateMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
}