import axiosInstance from "../../../shared/api/axiosInstance";

const BASE = "admin/notification-marketing";

const toNotificationFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    // Keep optional fields empty instead of sending the literal string "null".
    if (value !== undefined) formData.append(key, value ?? "");
  });
  return formData;
};

export const getNotifications = async () => {
  const { data } = await axiosInstance.get(BASE);
  return data?.data ?? [];
};

export const createNotification = async (payload) => {
  const { data } = await axiosInstance.post(BASE, toNotificationFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data;
};

export const updateNotification = async ({ notificationId, ...payload }) => {
  const { data } = await axiosInstance.put(`${BASE}/${notificationId}`, toNotificationFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data;
};

export const toggleNotificationActive = async (notificationId) => {
  const { data } = await axiosInstance.patch(`${BASE}/${notificationId}/toggle-active`);
  if (data?.succeeded === false) {
    throw new Error(data.message || "Failed to update notification status.");
  }
  return data?.data;
};

export const getNotificationPackageLookup = async (pageNumber = 1, pageSize = 20, searchTerm = "") => {
  const { data } = await axiosInstance.get("/AdminLookup/packages");
  const packages = Array.isArray(data?.data) ? data.data : [];
  const search = searchTerm.trim().toLocaleLowerCase();
  const matches = search
    ? packages.filter((item) =>
        [item.enName, item.arName].some((name) =>
          name?.toLocaleLowerCase().includes(search)
        )
      )
    : packages;
  const start = (pageNumber - 1) * pageSize;

  return {
    data: {
      items: matches.slice(start, start + pageSize),
      pageNumber,
      totalPages: Math.ceil(matches.length / pageSize),
    },
  };
};

export const deleteNotification = async (notificationId) => {
  const { data } = await axiosInstance.delete(`${BASE}/${notificationId}`);
  return data?.data;
};
