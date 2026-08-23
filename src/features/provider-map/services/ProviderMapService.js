import axiosInstance from "../../../shared/api/axiosInstance";

/**
 * GET /MapAdmin/data — providerCategoryId filters server-side now.
 * governorate/search filtering still happens client-side (see the hook).
 */
export const getMapData = async (providerCategoryId) => {
  const { data } = await axiosInstance.get("/MapAdmin/data", {
    params: { providerCategoryId: providerCategoryId || undefined },
  });

  if (!data?.succeeded) {
    throw new Error(data?.message || "Failed to load map data");
  }

  return {
    providers: data.data?.providers ?? [],
    governorates: data.data?.governorates ?? [],
  };
};