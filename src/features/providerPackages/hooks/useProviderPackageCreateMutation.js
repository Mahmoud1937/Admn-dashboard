import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { createProviderPackage } from "../services/providerPackagesService";
import useProviderDetailsText from "../../../localization/useProviderDetailsText";

export function useProviderPackageCreateMutation({ onSuccess }) {
  const tr = useProviderDetailsText();
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const mutation = useMutation({
    mutationFn: createProviderPackage,
    onSuccess: () => {
      toast.success(tr("Package added successfully."));
      queryClient.invalidateQueries({ queryKey: ["provider-packages"] });
      setServerErrors(null);
      onSuccess?.();
    },
    onError: (error) =>
      handleMutationError(error, tr("Failed to add package."), setServerErrors),
  });

  return {
    mutation,
    serverErrors,
    clearServerErrors: () => setServerErrors(null),
  };
}
