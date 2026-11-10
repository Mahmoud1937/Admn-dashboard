import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createGovernorate, deleteGovernorate, updateGovernorate } from "../services/governoratesService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";


export function useGovernorateMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) {
  const { t } = useTranslation("adminPages");
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createGovernorate,
    onSuccess: () => {
      toast.success(t("Governorate created successfully."));
      queryClient.invalidateQueries({ queryKey: ["governorates"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to create governorate."), setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: updateGovernorate,
    onSuccess: () => {
      toast.success(t("Governorate updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["governorates"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to update governorate."), setServerErrors),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGovernorate,
    onSuccess: () => {
      toast.success(t("Governorate deleted successfully."));
      queryClient.invalidateQueries({ queryKey: ["governorates"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || t("Failed to delete governorate."));
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