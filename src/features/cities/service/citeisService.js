import axiosInstance from "../../../shared/api/axiosInstance";


export async function getCities({
  pageNumber = 1,
  pageSize,
  searchTerm = "",
  governorateId,
  isActive,
} = {}) {
  const { data } = await axiosInstance.get("/CityAdmin/cities", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
      SearchTerm: searchTerm || undefined,
      GovernorateId: governorateId || undefined,
      IsActive: isActive === "" || isActive === undefined ? undefined : isActive,
    },
  });

  return data;
}

export async function createCity(payload) {
  const { data } = await axiosInstance.post("/CityAdmin/cities", {
    arName: payload.arName,
    enName: payload.enName,
    governorateId: payload.governorateId,
  });

  return data;
}

export async function updateCity(payload) {
  // PUT has no id in the URL - the id is sent as "cityId" in the body
  const { data } = await axiosInstance.put("/CityAdmin/cities", {
    cityId: payload.id,
    arName: payload.arName,
    enName: payload.enName,
    governorateId: payload.governorateId,
  });

  return data;
}

export async function deleteCity(id) {
  const { data } = await axiosInstance.delete(`/CityAdmin/cities/${id}`);
  return data;
}