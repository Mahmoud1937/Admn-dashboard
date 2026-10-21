import { useQuery } from "@tanstack/react-query";
import { getNotificationTemplates, getNotificationTemplateVariables } from "../services/notificationTemplatesService";

export function useNotificationTemplatesQuery({ pageNumber = 1, pageSize = 15 } = {}) {
  const query = useQuery({
    queryKey: ["notification-templates", pageNumber, pageSize],
    queryFn: ({ signal }) => getNotificationTemplates({ pageNumber, pageSize, signal }),
  });

  return {
    ...query,
    templates: query.data?.data?.items ?? [],
    totalCount: query.data?.data?.totalCount ?? 0,
    totalPages: query.data?.data?.totalPages ?? 1,
  };
}

export function useNotificationTemplateVariablesQuery() {
  return useQuery({
    queryKey: ["notification-template-variables"],
    queryFn: ({ signal }) => getNotificationTemplateVariables({ signal }),
  });
}
