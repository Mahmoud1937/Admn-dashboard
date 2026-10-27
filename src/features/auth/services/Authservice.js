import axiosInstance from "../../../shared/api/axiosInstance";

export const login = async (payload) => {
  // Retain response headers so the auth context can synchronize server time.
  return axiosInstance.post("AuthAdmin/login", payload);
};

export const changePassword = async (payload) => {
  const { data } = await axiosInstance.post("AuthAdmin/change-password", payload);
  return data;
};

export const logout = async () => {
  const { data } = await axiosInstance.post("AuthAdmin/logout");
  return data;
};
