import axiosInstance from "../../../shared/api/axiosInstance";
import { requireApiSuccess } from "../../../shared/helpers/apiErrorHandler";

export async function getAdminNotifications({ pageNumber = 1, pageSize = 10, isRead, signal } = {}) {
  const response = await axiosInstance.get("admin/notifications/get-my-notifications", {
    params: { PageNumber: pageNumber, PageSize: pageSize, IsRead: isRead },
    signal,
  });
  const page = requireApiSuccess(response, "Failed to load admin notifications.").data;
  if (!Array.isArray(page?.items)) {
    throw new Error("Invalid admin notifications response.");
  }
  return {
    ...page,
    items: page.items.map((item) => ({ ...item, message: item.body })),
  };
}

export async function getAdminNotificationsUnreadCount({ signal } = {}) {
  const response = await axiosInstance.get("admin/notifications/unread-count", { signal });
  const count = requireApiSuccess(response, "Failed to load unread notification count.").data;
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("Invalid unread notification count response.");
  }
  return count;
}

export async function markAdminNotificationAsRead(notificationId) {
  const response = await axiosInstance.patch(
    `admin/notifications/${encodeURIComponent(notificationId)}/read`,
  );
  const result = requireApiSuccess(response, "Failed to mark notification as read.");
  if (result.data !== true) {
    const error = new Error("Failed to mark notification as read.");
    error.response = response;
    throw error;
  }
  return result.data;
}

export async function markAllAdminNotificationsAsRead() {
  const response = await axiosInstance.patch("admin/notifications/read-all");
  const result = requireApiSuccess(response, "Failed to mark all notifications as read.");
  if (!Number.isInteger(result.data) || result.data < 0) {
    const error = new Error("Invalid mark-all notifications response.");
    error.response = response;
    throw error;
  }
  return result.data;
}
