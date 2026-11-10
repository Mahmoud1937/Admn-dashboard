import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  deleteProviderPackage,
  toggleProviderPackageActive,
} from "../services/providerPackagesService";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";

const showError = (error, fallback) => {
  toast.error(error?.response?.data?.message || error?.message || fallback);
};

export function useProviderPackageActionsMutation({ onToggleSuccess, onDeleteSuccess }) {
  const tr = useProviderDetailsText();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: toggleProviderPackageActive,
    onSuccess: (response, packageId) => {
      toast.success(response.message || tr("Package status updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["provider-packages"] });
      queryClient.invalidateQueries({ queryKey: ["provider-package", packageId] });
      onToggleSuccess?.();
    },
    onError: (error) => showError(error, tr("Failed to update package status.")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProviderPackage,
    onSuccess: (response) => {
      toast.success(response.message || tr("Package deleted successfully."));
      queryClient.invalidateQueries({ queryKey: ["provider-packages"] });
      onDeleteSuccess?.();
    },
    onError: (error) => showError(error, tr("Failed to delete package.")),
  });

  return { toggleMutation, deleteMutation };
}
