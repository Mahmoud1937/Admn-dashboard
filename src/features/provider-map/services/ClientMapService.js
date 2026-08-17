import axiosInstance from "../../../shared/api/axiosInstance";

export const getClientLocations = async () => {
  const { data } = await axiosInstance.get("/MapAdmin/clients");

  if (!data?.succeeded) {
    throw new Error(data?.message || "Failed to load client locations");
  }

  return data.data ?? [];
};