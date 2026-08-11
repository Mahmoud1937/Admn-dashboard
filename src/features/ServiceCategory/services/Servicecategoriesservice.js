import axiosInstance from "../../../shared/api/axiosInstance";

export async function getServiceCategories(pageNumber = 1, pageSize, searchTerm = "") {
  const { data } = await axiosInstance.get(
    "/ServiceCategoryAdmin/ServiceCategories",
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

export async function createServiceCategory(payload) {
  const formData = new FormData();

  formData.append("ArName", payload.arName);
  formData.append("EnName", payload.enName);
  formData.append("Logo", payload.logoFile);

  const { data } = await axiosInstance.post(
    "/ServiceCategoryAdmin/ServiceCategories",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
}

export async function updateServiceCategory(id, payload) {
  const formData = new FormData();

  formData.append("ArName", payload.arName);
  formData.append("EnName", payload.enName);
  formData.append("IsUpdatedImage", payload.isUpdatedImage);

  if (payload.isUpdatedImage && payload.logoFile) {
    formData.append("ImageUrl", payload.logoFile);
  }

  const { data } = await axiosInstance.put(
    `/ServiceCategoryAdmin/categories/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
}

export async function deleteServiceCategory(id) {
  const { data } = await axiosInstance.delete(
    `/ServiceCategoryAdmin/categories/${id}`
  );
  return data;
}