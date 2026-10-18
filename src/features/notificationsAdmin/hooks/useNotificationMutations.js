import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNotification,
  deleteNotification,
  toggleNotificationActive,
  updateNotification,
} from "../services/notificationsService";
import { NOTIFICATIONS_QUERY_KEY } from "./useNotificationsQuery";

// Backend errors may come back as an array of messages or a { field: [msgs] } object.
export const extractErrorMessage = (error, fallback) => {
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length) return errors.join(" • ");
  if (errors && typeof errors === "object") {
    const flat = Object.values(errors).flat().filter(Boolean);
    if (flat.length) return flat.join(" • ");
  }
  return error?.response?.data?.message || error?.message || fallback;
};

export default function useNotificationMutations({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

  const create = useMutation({
    mutationFn: createNotification,
    onSuccess: (data) => {
      refresh();
      onSuccess?.("Notification sent successfully.", data);
    },
    onError: (e) =>
      onError?.(extractErrorMessage(e, "Failed to send notification.")),
  });

  const remove = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      refresh();
      onSuccess?.("Notification deleted.");
    },
    onError: (e) =>
      onError?.(extractErrorMessage(e, "Failed to delete notification.")),
  });

  const update = useMutation({
    mutationFn: updateNotification,
    onSuccess: (data) => {
      refresh();
      onSuccess?.("Notification updated.", data);
    },
    onError: (error) =>
      onError?.(extractErrorMessage(error, "Failed to update notification.")),
  });

  const toggleActive = useMutation({
    mutationFn: ({ notificationId }) => toggleNotificationActive(notificationId),
    onSuccess: (_, notification) => {
      refresh();
      const message = notification.isActive === true
        ? "Notification deactivated."
        : notification.isActive === false
          ? "Notification activated."
          : "Notification status updated.";
      onSuccess?.(message);
    },
    onError: (error) =>
      onError?.(extractErrorMessage(error, "Failed to update notification status.")),
  });

  return { create, remove, update, toggleActive };
}
