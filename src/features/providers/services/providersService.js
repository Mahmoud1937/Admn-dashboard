import axiosInstance from "../../../shared/api/axiosInstance";

export async function getProviders({
  pageNumber = 1,
  pageSize,
  searchTerm = "",
  filters = {},
} = {}) {
  const { data } = await axiosInstance.get("/admin/providers", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
      SearchTerm: searchTerm || undefined,
      Status: filters.status && filters.status !== 0 ? filters.status : undefined,
      FromDate: filters.joinDateFrom || undefined,
      ToDate: filters.joinDateTo || undefined,
      CategoryId: filters.categoryId || undefined,
      SpecialistId: filters.specialistId || undefined,
    },
  });

  return data;
}

export async function getProviderById(id) {
  const { data } = await axiosInstance.get(`/admin/providers/${id}`);
  return data;
}

export async function createProvider(payload) {
  const formData = new FormData();

  formData.append("ProviderCategoryId", payload.providerCategoryId);

  if (payload.specialistId) {
    formData.append("SpecialistId", payload.specialistId);
  }

  formData.append("ArName", payload.arName);
  formData.append("EnName", payload.enName);
  formData.append("HotLine", payload.hotLine ?? "");
  formData.append("PhoneNumber1", payload.phoneNumber1 ?? "");
  formData.append("IsActive", payload.isActive);

  if (payload.logoFile) {
    formData.append("Logo", payload.logoFile);
  }

  const { data } = await axiosInstance.post("/admin/providers", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function updateProvider(id, payload) {
  const formData = new FormData();


  formData.append("ProviderCategoryId", payload.providerCategoryId);

  if (payload.specialistId) {
    formData.append("SpecialistId", payload.specialistId);
  }

  formData.append("ArName", payload.arName);
  formData.append("EnName", payload.enName);
  formData.append("HotLine", payload.hotLine ?? "");
  formData.append("PhoneNumber1", payload.phoneNumber1 ?? "");
  formData.append("IsActive", payload.isActive);

  if (payload.logoFile) {
    formData.append("Logo", payload.logoFile);
  }

  const { data } = await axiosInstance.put(`/admin/providers/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function deleteProvider(id) {
  const { data } = await axiosInstance.delete(`/admin/providers/${id}`);
  return data;
}

export async function activateProvider(id) {
  const { data } = await axiosInstance.patch(`/admin/providers/make-active/${id}`);
  return data;
}