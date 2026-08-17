import axiosInstance from "../../../shared/api/axiosInstance";

export const getMapData = async () => {
  const { data } = await axiosInstance.get("/MapAdmin/data");

  if (!data?.succeeded) {
    throw new Error(data?.message || "Failed to load map data");
  }

  return {
    providers: data.data?.providers ?? [],
    governorates: data.data?.governorates ?? [],
  };
};