import axiosInstance from "../../../shared/api/axiosInstance";

const getBranchParams = ({ governorateId, cityId, search = "", status, pageNumber, pageSize } = {}) => ({
  GovernorateId: governorateId || undefined,
  CityId: cityId || undefined,
  Search: search || undefined,
  Status: status === "" || status === undefined ? undefined : status,
  PageNumber: pageNumber,
  PageSize: pageSize || undefined,
});

async function requestBranches(params) {
  const { data } = await axiosInstance.get(
    "/ProviderBranchesAdmin",
    params ? { params } : undefined
  );

  return data;
}

export async function getProviderBranches({
  providerId,
  governorateId,
  cityId,
  search = "",
  status,
  pageNumber = 1,
  pageSize,
} = {}) {
  return requestBranches({
      ProviderId: providerId,
      GovernorateId: governorateId || undefined,
      CityId: cityId || undefined,
      Search: search || undefined,
      Status: status === "" || status === undefined ? undefined : status,
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
  });
}

export async function getAllBranches({
  governorateId,
  cityId,
  search = "",
  status,
  pageNumber = 1,
  pageSize,
} = {}) {
  return requestBranches(getBranchParams({
    governorateId, cityId, search, status, pageNumber, pageSize,
  }));
}

export async function exportBranches(options = {}) {
  return axiosInstance.get("/ProviderBranchesAdmin/export", {
    params: getBranchParams(options),
    responseType: "blob",
  });
}

export async function getBranchesLookup({
  providerId,
  pageNumber = 1,
  pageSize,
  searchTerm = "",
} = {}) {
  const { data } = await axiosInstance.get("AdminLookup/provider-branches", {
    params: {
      ProviderId: providerId || undefined,
      SearchTerm: searchTerm || undefined,
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
    branchName: payload.branchName,
    mapUrl: payload.mapUrl,
    fullAddress: payload.fullAddress,
    kilo: payload.kilo,
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
      branchName: payload.branchName,
      mapUrl: payload.mapUrl,
      fullAddress: payload.fullAddress,
      kilo: payload.kilo,
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
