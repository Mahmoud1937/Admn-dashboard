import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/Authcontext";
import { markAdminNotificationAsRead } from "../services/adminNotificationsService";

export default function useAdminNotificationReadMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: markAdminNotificationAsRead,
    // Retain the initiating employee's scope if the session changes mid-request.
    onMutate: () => ({ queryKey: ["admin-notifications", String(user?.employeeId ?? "")] }),
    onSuccess: (_data, _notificationId, context) =>
      queryClient.invalidateQueries({ queryKey: context.queryKey }),
  });
}
