import axiosInstance from "../../../shared/api/axiosInstance";

const BASE = "admin/notification-marketing";

export const getNotifications = async () => {
  const { data } = await axiosInstance.get(BASE);
  return data?.data ?? [];
};

export const createNotification = async (payload) => {
  const { data } = await axiosInstance.post(BASE, payload);
  return data?.data;
};

export const deleteNotification = async (notificationId) => {
  const { data } = await axiosInstance.delete(`${BASE}/${notificationId}`);
  return data?.data;
};