import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createBroker, deleteBroker, updateBroker } from "../services/brokersService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";

export function useBrokerMutations({ onSaveSuccess, onDeleteSuccess }) {
  const { t } = useTranslation("adminPages");
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);
  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createBroker,
    onSuccess: (response) => {
      toast.success(response?.message || t("Broker created successfully."));
      queryClient.invalidateQueries({ queryKey: ["brokers"] });
      onSaveSuccess?.();
    },
    onError: (error) => handleMutationError(error, t("Failed to create broker."), setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: updateBroker,
    onSuccess: (response) => {
      toast.success(response?.message || t("Broker updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["brokers"] });
      onSaveSuccess?.();
    },
    onError: (error) => handleMutationError(error, t("Failed to update broker."), setServerErrors),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBroker,
    onSuccess: (response) => {
      toast.success(response?.message || t("Broker deleted successfully."));
      queryClient.invalidateQueries({ queryKey: ["brokers"] });
      onDeleteSuccess?.();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, { details: true, fallback: t("Failed to delete broker.") })),
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
