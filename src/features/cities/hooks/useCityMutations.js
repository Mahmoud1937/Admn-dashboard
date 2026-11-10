import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCity, deleteCity, updateCity } from "../service/citeisService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";


export function useCityMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) {
  const { t } = useTranslation("adminPages");
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createCity,
    onSuccess: () => {
      toast.success(t("City created successfully."));
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      onCreateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to create city."), setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: updateCity,
    onSuccess: () => {
      toast.success(t("City updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      onUpdateSuccess?.();
    },
    onError: (err) => handleMutationError(err, t("Failed to update city."), setServerErrors),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCity,
    onSuccess: () => {
      toast.success(t("City deleted successfully."));
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || t("Failed to delete city."));
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