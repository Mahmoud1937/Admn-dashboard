import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/Authcontext";
import { markAllAdminNotificationsAsRead } from "../services/adminNotificationsService";

export default function useAdminNotificationsReadAllMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: markAllAdminNotificationsAsRead,
    onMutate: () => ({ queryKey: ["admin-notifications", String(user?.employeeId ?? "")] }),
    onSuccess: (_data, _variables, context) =>
      queryClient.invalidateQueries({ queryKey: context.queryKey }),
  });
}
