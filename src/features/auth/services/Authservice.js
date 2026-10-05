import axiosInstance from "../../../shared/api/axiosInstance";

export const login = async (payload) => {
  const { data } = await axiosInstance.post("AuthAdmin/login", payload);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await axiosInstance.post("AuthAdmin/change-password", payload);
  return data;
};

export const logout = async () => {
  const { data } = await axiosInstance.post("AuthAdmin/logout");
  return data;
};
