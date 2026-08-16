import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createProvider, updateProvider } from "../services/providersService";

export function useProviderMutation({ id, isCreateMode, onUpdateSuccess }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isCreateMode) {
        return createProvider(payload);
      }
      return updateProvider(id, payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });

      if (isCreateMode) {
        toast.success("Provider created successfully.");
        navigate(`/providers/${response.data.id}`);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["provider", id] });
      toast.success("Provider updated successfully.");
      onUpdateSuccess?.();
    },
    onError: (error) => {
      const backendErrors = error?.response?.data?.errors;

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        toast.error(backendErrors.join(" "));
        return;
      }

      if (!backendErrors || typeof backendErrors !== "object") {
        toast.error(
          error?.response?.data?.title || error?.message || "Failed to save changes."
        );
      }
      // object (field-level errors) case: no toast here, left for the form to display per-field
    },
  });

  return { mutation };
}