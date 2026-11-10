import { useQuery } from "@tanstack/react-query";
import { getManualPrescriptionById } from "../services/prescriptionsService";

export function usePrescriptionDetailsQuery({ manualPrescriptionId, language }) {
  const id = Number(manualPrescriptionId);

  return useQuery({
    queryKey: language
      ? ["manual-prescriptions", "details", language, manualPrescriptionId]
      : ["manual-prescriptions", "details", manualPrescriptionId],
    queryFn: ({ signal }) => getManualPrescriptionById({ manualPrescriptionId, signal }),
    enabled: Number.isSafeInteger(id) && id > 0,
    refetchInterval: 8 * 60 * 1000,
  });
}
