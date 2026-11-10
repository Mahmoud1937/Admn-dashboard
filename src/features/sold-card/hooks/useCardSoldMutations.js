import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createCardSoldByCount,
  createCardSoldByNumbers,
  deleteCardSold,
  exportCardSold,
} from "../services/cardSoldService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export const useCardSoldMutations = ({ onCreateSuccess, onDeleteSuccess } = {}) => {
  const { t } = useTranslation("adminPages");
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  const clearServerErrors = () => setServerErrors(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cardSolds"] });

  const onCreated = (data) => {
    const [first] = Array.isArray(data) ? data : [data];
    toast.success(t("Card(s) sold: {{value1}} - {{value2}}", { value1: first?.from, value2: first?.to }));
    invalidate();
    onCreateSuccess?.();
  };

  const createByCountMutation = useMutation({
    mutationFn: (payload) => createCardSoldByCount(payload),
    onSuccess: onCreated,
    onError: (error) => {
      handleMutationError(error, t("Something went wrong. Please try again."), setServerErrors);
    },
  });

  const createByNumbersMutation = useMutation({
    mutationFn: (payload) => createCardSoldByNumbers(payload),
    onSuccess: onCreated,
    onError: (error) => {
      handleMutationError(error, t("Something went wrong. Please try again."), setServerErrors);
    },
  });

  const exportMutation = useMutation({
    mutationFn: (id) => exportCardSold(id),
    onMutate: (id) => setExportingId(id),
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `CardSold-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error(t("Failed to export card sold"));
    },
    onSettled: () => setExportingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCardSold(id),
    onSuccess: () => {
      toast.success(t("Card sold record deleted successfully"));
      invalidate();
      onDeleteSuccess?.();
    },
    onError: (error) => {
      handleMutationError(error, t("Failed to delete card sold record. Please try again."), setServerErrors);
    },
  });

  return {
    createByCountMutation,
    createByNumbersMutation,
    exportMutation,
    deleteMutation,
    exportingId,
    isSaving: createByCountMutation.isPending || createByNumbersMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
};