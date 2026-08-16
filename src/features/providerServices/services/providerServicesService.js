import axiosInstance from "../../../shared/api/axiosInstance";

export async function getProviderServices({
  providerId,
  pageNumber = 1,
  pageSize,
  search,
  status,
} = {}) {
  const { data } = await axiosInstance.get(
    `/ProviderServiceAdmin/provider-services/${providerId}`,
    {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize || undefined,
        SearchTerm: search || undefined,
        Status: status ?? undefined,
      },
    }
  );

  return data;
}

export async function createProviderService(payload) {
  const { data } = await axiosInstance.post("/ProviderServiceAdmin/provider-services", {
    providerId: payload.providerId,
    serviceId: payload.serviceId,
    priceBefore: payload.priceBefore,
    discountPercentage: payload.discountPercentage,
    isSpecialOffer: payload.isSpecialOffer,
    isActive: payload.isActive,
  });

  return data;
}

export async function updateProviderService(payload) {
  const { data } = await axiosInstance.put(
    `/ProviderServiceAdmin/provider-services/${payload.id}`,
    {

      providerId: payload.providerId,
      serviceId: payload.serviceId,
      priceBefore: payload.priceBefore,
      discountPercentage: payload.discountPercentage,
      isSpecialOffer: payload.isSpecialOffer,
      isActive: payload.isActive,
    }
  );

  return data;
}

export async function activateProviderService(id) {
  const { data } = await axiosInstance.patch(
    `/ProviderServiceAdmin/provider-services/${id}/activate`
  );
  return data;
}

// Backend contract: "deactivate" is a DELETE call, same as Providers/Medicines/Branches.
export async function deactivateProviderService(id) {
  const { data } = await axiosInstance.delete(`/ProviderServiceAdmin/provider-services/${id}`);
  return data;
}