import axiosInstance from "../../../shared/api/axiosInstance";


// POST /api/AuthAdmin/login
export const login = async (payload) => {
  const { data } = await axiosInstance.post("AuthAdmin/loginm", payload);
  return data;
};