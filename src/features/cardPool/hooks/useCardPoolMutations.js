import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCardPool, deleteCardPool, exportCardPool } from "../services/cardPoolService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export const useCardPoolMutations = ({ onCreateSuccess, onDeleteSuccess } = {}) => {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: (payload) => createCardPool(payload),
    onSuccess: (data) => {
      toast.success(`Card pool created: ${data.from} - ${data.to}`);
      queryClient.invalidateQueries({ queryKey: ["cardPools"] });
      onCreateSuccess?.();
    },
    onError: (error) => {
      handleMutationError(error, "Something went wrong. Please try again.", setServerErrors);
    },
  });

  const exportMutation = useMutation({
    mutationFn: (id) => exportCardPool(id),
    onMutate: (id) => setExportingId(id),
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `CardPool-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error("Failed to export card pool");
    },
    onSettled: () => setExportingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCardPool(id),
    onSuccess: () => {
      toast.success("Card pool deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["cardPools"] });
      onDeleteSuccess?.();
    },
    onError: (error) => {
      handleMutationError(error, "Failed to delete card pool. Please try again.", setServerErrors);
    },
  });

  return {
    createMutation,
    exportMutation,
    deleteMutation,
    exportingId,
    isSaving: createMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
};