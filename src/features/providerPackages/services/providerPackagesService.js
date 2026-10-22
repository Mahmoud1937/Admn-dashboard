import axiosInstance from "../../../shared/api/axiosInstance";
import { requireApiSuccess } from "../../../shared/helpers/apiErrorHandler";

export async function getProviderPackageCategories({ providerId, pageNumber = 1, pageSize = 20, search = "" }) {
  const response = await axiosInstance.get("/CategoryService/providerCategories", {
    params: { providerId },
  });
  const body = requireApiSuccess(response, "Failed to load provider categories.");
  const categories = Array.isArray(body?.data) ? body.data : [];
  const searchTerm = search.trim().toLocaleLowerCase();
  const matches = searchTerm
    ? categories.filter((category) => category.name?.toLocaleLowerCase().includes(searchTerm))
    : categories;
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

export async function getProviderPackageServices({ providerId, categoryId, pageNumber = 1, pageSize = 20, search = "" }) {
  const response = await axiosInstance.get("/ProviderPage/servicesByCategory", {
    params: {
      categoryId,
      providerId,
      Search: search || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });

  return requireApiSuccess(response, "Failed to load provider services.");
}

const requireSuccess = (data) => {
  if (data.succeeded === false) {
    throw new Error(data.message || "Package request failed.");
  }
  return data;
};

export async function getProviderPackages({ providerId, pageNumber, pageSize }) {
  const { data } = await axiosInstance.get("/ProviderPackageAdmin", {
    params: {
      ProviderId: providerId,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });

  return data;
}

export async function getProviderPackageById(packageId) {
  const { data } = await axiosInstance.get(`/ProviderPackageAdmin/${packageId}`);
  return data.data;
}

export async function toggleProviderPackageActive(packageId) {
  const { data } = await axiosInstance.patch(
    `/ProviderPackageAdmin/${packageId}/toggle-active`,
  );
  return requireSuccess(data);
}

export async function deleteProviderPackage(packageId) {
  const { data } = await axiosInstance.delete(`/ProviderPackageAdmin/${packageId}`);
  return requireSuccess(data);
}

export async function createProviderPackage(payload) {
  const formData = new FormData();
  formData.append("ProviderId", String(payload.providerId));
  formData.append("NameAr", payload.nameAr);
  formData.append("NameEn", payload.nameEn);
  formData.append("ImageAr", payload.imageAr);
  formData.append("ImageEn", payload.imageEn);
  formData.append("DescriptionAr", payload.descriptionAr);
  formData.append("DescriptionEn", payload.descriptionEn);
  formData.append("PriceBefore", String(payload.priceBefore));
  formData.append("DiscountPercentage", String(payload.discountPercentage));
  payload.serviceIds.forEach((serviceId) => {
    formData.append("ServiceIds", String(serviceId));
  });

  const { data } = await axiosInstance.post("/ProviderPackageAdmin", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function updateProviderPackage(payload) {
  const formData = new FormData();
  formData.append("PackageId", String(payload.packageId));
  formData.append("ProviderId", String(payload.providerId));
  formData.append("NameAr", payload.nameAr);
  formData.append("NameEn", payload.nameEn);
  if (payload.imageAr instanceof File) formData.append("ImageAr", payload.imageAr);
  if (payload.imageEn instanceof File) formData.append("ImageEn", payload.imageEn);
  formData.append("DescriptionAr", payload.descriptionAr);
  formData.append("DescriptionEn", payload.descriptionEn);
  formData.append("PriceBefore", String(payload.priceBefore));
  formData.append("DiscountPercentage", String(payload.discountPercentage));
  payload.serviceIds.forEach((serviceId) => {
    formData.append("ServiceIds", String(serviceId));
  });

  const { data } = await axiosInstance.put("/ProviderPackageAdmin", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return requireSuccess(data);
}
