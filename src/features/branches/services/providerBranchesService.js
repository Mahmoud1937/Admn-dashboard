import axiosInstance from "../../../shared/api/axiosInstance";


export async function getProviderBranches({
  providerId,
  governorateId,
  cityId,
  search = "",
  status,
  pageNumber = 1,
  pageSize,
} = {}) {
  const { data } = await axiosInstance.get("/ProviderBranchesAdmin", {
    params: {
      ProviderId: providerId,
      GovernorateId: governorateId || undefined,
      CityId: cityId || undefined,
      Search: search || undefined,
      Status: status === "" || status === undefined ? undefined : status,
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
    },
  });

  return data;
}

export async function createBranch(payload) {
  const { data } = await axiosInstance.post("/ProviderBranchesAdmin/provider-branches", {
    providerId: payload.providerId,
    governorateId: payload.governorateId,
    cityId: payload.cityId,
    email: payload.email,
    password: payload.password,
    userName: payload.userName,
    branchName: payload.branchName,
    mapUrl: payload.mapUrl,
    latitude: payload.latitude,
    longitude: payload.longitude,
    fullAddress: payload.fullAddress,
    isActive: payload.isActive,
  });

  return data;
}

export async function updateBranch(payload) {
  const { data } = await axiosInstance.put(
    `/ProviderBranchesAdmin/provider-branches/${payload.id}`,
    {
      providerId: payload.providerId,
      governorateId: payload.governorateId,
      cityId: payload.cityId,
      email: payload.email,
      password: payload.password || null,
      userName: payload.userName,
      branchName: payload.branchName,
      mapUrl: payload.mapUrl,
      latitude: payload.latitude,
      longitude: payload.longitude,
      fullAddress: payload.fullAddress,
      isActive: payload.isActive,
    }
  );

  return data;
}
export async function deactivateBranch(branchId) {
  const { data } = await axiosInstance.delete(`/ProviderBranchesAdmin/${branchId}`);
  return data;
}

export async function activateBranch(branchId) {
  const { data } = await axiosInstance.patch(`/ProviderBranchesAdmin/make-active/${branchId}`);
  return data;
}