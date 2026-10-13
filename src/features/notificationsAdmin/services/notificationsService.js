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
