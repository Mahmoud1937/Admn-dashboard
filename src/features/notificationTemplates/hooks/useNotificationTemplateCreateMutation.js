import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNotificationTemplate, updateNotificationTemplate, toggleNotificationTemplateActive } from "../services/notificationTemplatesService";

function useNotificationTemplateMutation(mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification-templates"] }),
  });
}

export function useNotificationTemplateCreateMutation() {
  return useNotificationTemplateMutation(createNotificationTemplate);
}

export function useNotificationTemplateUpdateMutation() {
  return useNotificationTemplateMutation(updateNotificationTemplate);
}

export function useNotificationTemplateToggleActiveMutation() {
  return useNotificationTemplateMutation(toggleNotificationTemplateActive);
}
