import axiosInstance from "../../../shared/api/axiosInstance";

export async function getGovernorates(pageNumber = 1, pageSize, searchTerm = "") {
  const { data } = await axiosInstance.get("/GovernoratesAdmin", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
      SearchTerm: searchTerm || undefined,
    },
  });
  return data;
}

export async function createGovernorate(payload) {
  const { data } = await axiosInstance.post("/GovernoratesAdmin", {
    arName: payload.arName,
    enName: payload.enName,
  });

  return data;
}

export async function updateGovernorate(payload) {
  const { data } = await axiosInstance.put("/GovernoratesAdmin", {
    id: payload.id,
    arName: payload.arName,
    enName: payload.enName,
  });

  return data;
}

export async function deleteGovernorate(id) {
  const { data } = await axiosInstance.delete(`/GovernoratesAdmin/${id}`);
  return data;
}