import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { processManualPrescription } from "../services/prescriptionsService";

export function useProcessManualPrescriptionMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processManualPrescription,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["manual-prescriptions"] });
      toast.success("Prescription processed successfully.");
      onSuccess?.();
    },
  });
}
