import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { updateProviderPackage } from "../services/providerPackagesService";

export function useProviderPackageUpdateMutation({ onSuccess }) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const mutation = useMutation({
    mutationFn: updateProviderPackage,
    onSuccess: (response, payload) => {
      toast.success(response.message || "Package updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["provider-packages"] });
      queryClient.invalidateQueries({ queryKey: ["provider-package", payload.packageId] });
      setServerErrors(null);
      onSuccess?.();
    },
    onError: (error) =>
      handleMutationError(error, "Failed to update package.", setServerErrors),
  });

  return {
    mutation,
    serverErrors,
    clearServerErrors: () => setServerErrors(null),
  };
}
