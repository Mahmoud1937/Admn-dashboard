import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import {
  createSubscriptionType,
  deleteSubscriptionType,
  updateSubscriptionType,
  toggleSubscriptionType,
} from "../services/subscriptionTypesService";

export function useSubscriptionTypeMutations({
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}) {
  const { t } = useTranslation("adminPages");
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createSubscriptionType,
    onSuccess: () => {
      toast.success(t("Subscription type created successfully."));
      queryClient.invalidateQueries({ queryKey: ["subscription-types"] });
      onCreateSuccess?.();
    },
    onError: (err) =>
      handleMutationError(
        err,
        t("Failed to create subscription type."),
        setServerErrors
      ),
  });

  const updateMutation = useMutation({
    mutationFn: updateSubscriptionType,
    onSuccess: () => {
      toast.success(t("Subscription type updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["subscription-types"] });
      onUpdateSuccess?.();
    },
    onError: (err) =>
      handleMutationError(
        err,
        t("Failed to update subscription type."),
        setServerErrors
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscriptionType,
    onSuccess: () => {
      toast.success(t("Subscription type deleted successfully."));
      queryClient.invalidateQueries({ queryKey: ["subscription-types"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || t("Failed to delete subscription type.")
      );
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleSubscriptionType,
    onSuccess: (response) => {
      toast.success(response?.message || t("Plan type status updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["subscription-types"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || t("Failed to update plan type status.")
      );
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleMutation,
    isSaving: createMutation.isPending || updateMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
}
