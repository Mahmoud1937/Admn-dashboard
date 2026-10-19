import axiosInstance from "../../../shared/api/axiosInstance";
import { requireApiSuccess } from "../../../shared/helpers/apiErrorHandler";
import { providerRenewalSchema, providerRenewalUpdateSchema } from "../schema/providerRenewalSchema";

export async function getProviderRenewals({
  providerId,
  pageNumber = 1,
  pageSize = 15,
  signal,
}) {
  const response = await axiosInstance.get("/ProviderRenewalAdmin", {
    params: {
      ProviderId: providerId,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
    signal,
  });

  return requireApiSuccess(response, "Failed to load provider renewals.");
}

export async function createProviderRenewal({ startAt, endAt, providerId, brokerId = null }) {
  if (!Number.isInteger(Number(providerId)) || Number(providerId) <= 0) {
    throw new Error("Select a provider before creating a renewal.");
  }
  const values = providerRenewalSchema.parse({ startAt, endAt, brokerId });
  const response = await axiosInstance.post("/ProviderRenewalAdmin", {
    startAt: values.startAt,
    endAt: values.endAt,
    providerId: Number(providerId),
    brokerId: values.brokerId === null || values.brokerId === "" ? null : Number(values.brokerId),
  });

  return requireApiSuccess(response, "Failed to create provider renewal.");
}

export async function updateProviderRenewal({ renewalId, providerId, startAt, endAt }) {
  if (!Number.isInteger(Number(renewalId)) || Number(renewalId) <= 0) {
    throw new Error("Select a renewal before updating it.");
  }
  if (!Number.isInteger(Number(providerId)) || Number(providerId) <= 0) {
    throw new Error("Select a provider before updating a renewal.");
  }
  const values = providerRenewalUpdateSchema.parse({ startAt, endAt });
  const response = await axiosInstance.put(
    `/ProviderRenewalAdmin/${encodeURIComponent(renewalId)}`,
    {
      providerId: Number(providerId),
      startAt: values.startAt,
      endAt: values.endAt,
    }
  );

  return requireApiSuccess(response, "Failed to update provider renewal.");
}
