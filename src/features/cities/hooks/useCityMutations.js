import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCity, deleteCity, updateCity } from "../service/citeisService";

export function useCityMutations({ onCreateSuccess, onUpdateSuccess, onDeleteSuccess }) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createCity,
    onSuccess: () => {
      toast.success("City created successfully.");
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      onCreateSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create city.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCity,
    onSuccess: () => {
      toast.success("City updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      onUpdateSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update city.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCity,
    onSuccess: () => {
      toast.success("City deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete city.");
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}