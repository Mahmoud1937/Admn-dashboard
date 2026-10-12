import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../services/notificationsService";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"];

export default function useNotificationsQuery() {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotifications,
  });
}