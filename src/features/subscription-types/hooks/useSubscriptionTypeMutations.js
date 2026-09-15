import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import {
  createSubscriptionType,
  deleteSubscriptionType,
  updateSubscriptionType,
} from "../services/subscriptionTypesService";

export function useSubscriptionTypeMutations({
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createSubscriptionType,
    onSuccess: () => {
      toast.success("Subscription type created successfully.");
      queryClient.invalidateQueries({ queryKey: ["subscription-types"] });
      onCreateSuccess?.();
    },
    onError: (err) =>
      handleMutationError(
        err,
        "Failed to create subscription type.",
        setServerErrors
      ),
  });

  const updateMutation = useMutation({
    mutationFn: updateSubscriptionType,
    onSuccess: () => {
      toast.success("Subscription type updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["subscription-types"] });
      onUpdateSuccess?.();
    },
    onError: (err) =>
      handleMutationError(
        err,
        "Failed to update subscription type.",
        setServerErrors
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscriptionType,
    onSuccess: () => {
      toast.success("Subscription type deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["subscription-types"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to delete subscription type."
      );
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
