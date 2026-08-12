import axiosInstance from "../../../shared/api/axiosInstance";

export async function getServices({
  pageNumber = 1,
  pageSize,
  searchTerm = "",
  categoryId,
  status,
} = {}) {
  const { data } = await axiosInstance.get("/ServiceAdmin/services", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
      SearchTerm: searchTerm || undefined,
      CategoryId: categoryId || undefined,
       Status: status ?? undefined,
    },
  });

  return data;
}

export async function getServiceById(id) {
  const { data } = await axiosInstance.get(`/ServiceAdmin/services/${id}`);
  return data;
}

export async function createService(payload) {
  const { data } = await axiosInstance.post("/ServiceAdmin/services", {
    categoryId: payload.categoryId,
    arName: payload.arName,
    enName: payload.enName,
    serviceInstruction: payload.serviceInstruction || null,
    cpt: payload.cpt || null,
  });

  return data;
}

export async function updateService(payload) {
  const { data } = await axiosInstance.put(`/ServiceAdmin/services/${payload.id}`, {
    id: payload.id,
    categoryId: payload.categoryId,
    arName: payload.arName,
    enName: payload.enName,
    serviceInstruction: payload.serviceInstruction || null,
    cpt: payload.cpt || null,
    isActive: payload.isActive,
  });

  return data;
}

export async function deleteService(id) {
  const { data } = await axiosInstance.delete(`/ServiceAdmin/services/${id}`);
  return data;
}