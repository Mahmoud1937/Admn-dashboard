import axiosInstance from "../../../shared/api/axiosInstance";
import { requireApiSuccess } from "../../../shared/helpers/apiErrorHandler";

export async function getManualPrescriptions({
  pageNumber = 1,
  pageSize = 10,
  status = "",
  search = "",
  signal,
} = {}) {
  const response = await axiosInstance.get("/admin/manual-prescriptions", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      Status: status || undefined,
      Search: search || undefined,
    },
    signal,
  });

  return requireApiSuccess(response, "Failed to load prescriptions.");
}

export async function processManualPrescription({ manualPrescriptionId, items }) {
  const response = await axiosInstance.post(
    `/admin/manual-prescriptions/${encodeURIComponent(manualPrescriptionId)}/process`,
    {
      items: items.map(({ serviceId, providerId, price, quantity }) => ({
        serviceId,
        providerId,
        price: price ?? null,
        quantity: quantity ?? null,
      })),
    }
  );

  return requireApiSuccess(response, "Failed to process prescription.");
}

export async function rejectManualPrescription({ manualPrescriptionId, rejectionReason }) {
  const response = await axiosInstance.post(
    `/admin/manual-prescriptions/${encodeURIComponent(manualPrescriptionId)}/reject`,
    { rejectionReason }
  );

  return requireApiSuccess(response, "Failed to reject prescription.");
}

export async function getManualPrescriptionProviders({
  serviceId,
  pageNumber = 1,
  pageSize = 10,
  search = "",
  signal,
}) {
  const response = await axiosInstance.get(
    `/admin/manual-prescriptions/services/${encodeURIComponent(serviceId)}/providers`,
    {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
        Search: search || undefined,
      },
      signal,
    }
  );

  return requireApiSuccess(response, "Failed to load providers for this service.");
}
