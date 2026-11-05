import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { rejectManualPrescription } from "../services/prescriptionsService";

export function useRejectManualPrescriptionMutation({ onSuccess } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectManualPrescription,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["manual-prescriptions"] });
      toast.success("Prescription rejected.");
      onSuccess?.();
    },
  });
}
