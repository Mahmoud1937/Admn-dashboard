import axiosInstance from "../../../shared/api/axiosInstance";

const getProviderParams = ({ pageNumber, pageSize, searchTerm = "", filters = {} } = {}) => ({
  PageNumber: pageNumber,
  PageSize: pageSize || undefined,
  SearchTerm: searchTerm || undefined,
  Search: searchTerm || undefined,
  Status: filters.status && filters.status !== 0 ? filters.status : undefined,
  FromDate: filters.joinDateFrom || undefined,
  ToDate: filters.joinDateTo || undefined,
  CategoryId: filters.categoryId || undefined,
  SpecialistId: filters.specialistId || undefined,
});

export async function getProviders({
  pageNumber = 1,
  pageSize,
  searchTerm = "",
  filters = {},
} = {}) {
  const { data } = await axiosInstance.get("/admin/providers", {
    params: getProviderParams({ pageNumber, pageSize, searchTerm, filters }),
  });

  return data;
}

export async function exportProviders(options = {}) {
  return axiosInstance.get("/admin/providers/export", {
    params: getProviderParams(options),
    responseType: "blob",
  });
}

export async function getProviderById(id) {
  const { data } = await axiosInstance.get(`/admin/providers/${id}`);
  return data;
}

export async function createProvider(payload) {
  const formData = new FormData();

  formData.append("ProviderCategoryId", payload.providerCategoryId);
  formData.append("Class", payload.providerClass);

  if (payload.specialistId) {
    formData.append("SpecialistId", payload.specialistId);
  }

  formData.append("ArName", payload.arName);
  formData.append("EnName", payload.enName);
  formData.append("HotLine", payload.hotLine ?? "");
  formData.append("PhoneNumber", payload.phoneNumber ?? "");
  formData.append("IsActive", payload.isActive);
  formData.append("MedicardCashback", String(payload.medicardCashback ?? 0));
  if (payload.localMedicineDiscount != null && payload.localMedicineDiscount !== "") {
    formData.append("LocalMedicineDiscount", String(payload.localMedicineDiscount));
  }
  if (payload.importedMedicineDiscount != null && payload.importedMedicineDiscount !== "") {
    formData.append("ImportedMedicineDiscount", String(payload.importedMedicineDiscount));
  }
  formData.append("Landline", payload.landline ?? "");

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
  formData.append("Class", payload.providerClass);

  if (payload.specialistId) {
    formData.append("SpecialistId", payload.specialistId);
  }

  formData.append("ArName", payload.arName);
  formData.append("EnName", payload.enName);
  formData.append("HotLine", payload.hotLine ?? "");
  formData.append("PhoneNumber", payload.phoneNumber ?? "");
  formData.append("IsActive", payload.isActive);
  formData.append("MedicardCashback", String(payload.medicardCashback ?? 0));
  if (payload.localMedicineDiscount != null && payload.localMedicineDiscount !== "") {
    formData.append("LocalMedicineDiscount", String(payload.localMedicineDiscount));
  }
  if (payload.importedMedicineDiscount != null && payload.importedMedicineDiscount !== "") {
    formData.append("ImportedMedicineDiscount", String(payload.importedMedicineDiscount));
  }
  formData.append("Landline", payload.landline ?? "");

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
export async function getProviderLookup({
  pageNumber = 1,
  pageSize,
  searchTerm = "",
} = {}) {
  const { data } = await axiosInstance.get("/AdminLookup/provider", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
      SearchTrem: searchTerm || undefined,
    },
  });

  return data;
}
