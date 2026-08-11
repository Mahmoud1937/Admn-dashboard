import axiosInstance from "../../../shared/api/axiosInstance";


export async function getSpecialists(pageNumber = 1, pageSize, searchTerm = "") {
  const { data } = await axiosInstance.get("/SpecialistAdmin", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
      SearchTerm: searchTerm || undefined,
    },
  });

  return data;
}

export async function createSpecialist(payload) {
  const { data } = await axiosInstance.post("/SpecialistAdmin", {
    arName: payload.arName,
    enName: payload.enName,
  });

  return data;
}

export async function updateSpecialist(payload) {
  const { data } = await axiosInstance.put("/SpecialistAdmin", {
    id: payload.id,
    arName: payload.arName,
    enName: payload.enName,
  });

  return data;
}

export async function deleteSpecialist(id) {
  const { data } = await axiosInstance.delete(`/SpecialistAdmin/${id}`);
  return data;
}