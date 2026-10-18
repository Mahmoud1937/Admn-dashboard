import axiosInstance from "../../../shared/api/axiosInstance";

export async function createProviderPriceList(payload) {
  const { data } = await axiosInstance.post("/PriceListAdmin", payload);

  if (data.succeeded === false) {
    throw new Error(data.message || "Unable to create price list.");
  }

  return data;
}

export async function updateProviderPriceList({ id, startDate, endDate }) {
  const { data } = await axiosInstance.put(`/PriceListAdmin/${id}`, {
    startDate,
    endDate,
  });

  if (data?.succeeded === false) {
    throw new Error(data.message || "Unable to update price list.");
  }

  return data ?? {};
}

export async function deleteProviderPriceList(id) {
  const { data } = await axiosInstance.delete(`/PriceListAdmin/${id}`);

  if (data?.succeeded === false) {
    throw new Error(data.message || "Unable to delete price list.");
  }

  return data ?? {};
}

export async function getProviderPriceLists({ providerId, pageNumber, pageSize }) {
  const { data } = await axiosInstance.get("/PriceListAdmin", {
    params: {
      ProviderId: providerId,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });

  if (data.succeeded === false) {
    throw new Error(data.message || "Unable to load price lists.");
  }

  return data;
}

export async function getProviderPriceListOptions(providerId) {
  const firstPage = await getProviderPriceLists({ providerId, pageNumber: 1, pageSize: 50 });
  const pages = [firstPage.data?.items ?? []];
  const totalPages = Number(firstPage.data?.totalPages) || 1;

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    const page = await getProviderPriceLists({ providerId, pageNumber, pageSize: 50 });
    pages.push(page.data?.items ?? []);
  }

  return pages.flat();
}
