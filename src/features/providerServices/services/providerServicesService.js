import axiosInstance from "../../../shared/api/axiosInstance";
import { requireApiSuccess } from "../../../shared/helpers/apiErrorHandler";

function toLookupPage(body, pageNumber, pageSize, searchTerm) {
  const items = Array.isArray(body?.data) ? body.data : [];
  const search = searchTerm.trim().toLocaleLowerCase();
  const matches = search ? items.filter((item) =>
    [item.name, item.enName, item.arName].some((name) => name?.toLocaleLowerCase().includes(search))
  ) : items;
  const start = (pageNumber - 1) * pageSize;

  return {
    ...body,
    data: {
      items: matches.slice(start, start + pageSize),
      pageNumber,
      pageSize,
      totalCount: matches.length,
      totalPages: Math.ceil(matches.length / pageSize),
    },
  };
}

export async function getProviderServiceCategories(pageNumber = 1, pageSize = 20, searchTerm = "") {
  const response = await axiosInstance.get("/CategoryService/categories");
  const body = requireApiSuccess(response, "Failed to load service categories.");
  return toLookupPage(body, pageNumber, pageSize, searchTerm);
}

export async function getProviderServiceOptions({ categoryId, pageNumber = 1, pageSize = 20, searchTerm = "" } = {}) {
  if (!categoryId) return toLookupPage({ data: [] }, pageNumber, pageSize, searchTerm);
  const response = await axiosInstance.get("/AdminLookup/services", { params: { categoryId } });
  const body = requireApiSuccess(response, "Failed to load services.");
  return toLookupPage(body, pageNumber, pageSize, searchTerm);
}

export async function getProviderServices({
  providerId,
  pageNumber = 1,
  pageSize,
  search,
  status,
  servicePriceListId,
} = {}) {
  const { data } = await axiosInstance.get(
    `/ProviderServiceAdmin/provider-services/${providerId}`,
    {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize || undefined,
        SearchTerm: search || undefined,
        Status: status ?? undefined,
        PriceListId: servicePriceListId || undefined,
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
    providerPriceListId: payload.servicePriceListId,
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
      providerPriceListId: payload.servicePriceListId,
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
