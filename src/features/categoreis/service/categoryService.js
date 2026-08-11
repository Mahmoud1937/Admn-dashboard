import axiosInstance from "../../../shared/api/axiosInstance";

export async function getCategories(pageNumber = 1, pageSize, searchTerm = "") {
  const { data } = await axiosInstance.get(
    "/ProviderCategoryAdmin/providerCategories",
    {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize || undefined,
        SearchTerm: searchTerm || undefined,
      },
    }
  );
  return data;
}

export async function createCategory(payload) {
  const formData = new FormData();

  formData.append("ArName", payload.arName);
  formData.append("EnName", payload.enName);
  formData.append("Logo", payload.logoFile);

  const { data } = await axiosInstance.post(
    "/ProviderCategoryAdmin/providerCategories",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
}

export async function updateCategory(id, payload) {
  const formData = new FormData();

  formData.append("Id", id);
  formData.append("ArName", payload.arName);
  formData.append("EnName", payload.enName);
  formData.append("IsUpdatedImage", payload.isUpdatedImage);

  if (payload.isUpdatedImage && payload.logoFile) {
    formData.append("ImageUrl", payload.logoFile);
  }

  const { data } = await axiosInstance.put(
    `/ProviderCategoryAdmin/categories/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
}

export async function deleteCategory(id) {
  const { data } = await axiosInstance.delete(
    `/ProviderCategoryAdmin/categories/${id}`
  );
  return data;
}