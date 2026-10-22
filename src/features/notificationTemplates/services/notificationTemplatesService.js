import axiosInstance from "../../../shared/api/axiosInstance";
import { requireApiSuccess } from "../../../shared/helpers/apiErrorHandler";
import { notificationTemplateSchema, notificationTemplateUpdateSchema } from "../schema/notificationTemplateSchema";

export async function getNotificationTemplates({ pageNumber = 1, pageSize = 15, signal } = {}) {
  const response = await axiosInstance.get("/admin/notifications", {
    params: { PageNumber: pageNumber, PageSize: pageSize },
    signal,
  });

  return requireApiSuccess(response, "Failed to load notification templates.");
}

export async function getNotificationTemplateVariables({ signal } = {}) {
  const response = await axiosInstance.get("/admin/notifications/variables", { signal });

  return requireApiSuccess(response, "Failed to load notification template variables.");
}

export async function createNotificationTemplate(payload) {
  const values = notificationTemplateSchema.parse(payload);
  const formData = new FormData();
  formData.append("notificationEvent", String(values.notificationEvent));
  formData.append("title", values.title);
  formData.append("imageUrl", values.imageUrl ?? "");
  formData.append("messageAr", values.messageAr);
  formData.append("messageEn", values.messageEn);

  const response = await axiosInstance.post("/admin/notifications", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return requireApiSuccess(response, "Failed to create notification template.");
}

export async function updateNotificationTemplate({ templateId, ...payload }) {
  if (!templateId) throw new Error("Select a notification template before updating it.");
  const values = notificationTemplateUpdateSchema.parse(payload);
  const formData = new FormData();
  formData.append("Title", values.title);
  if (values.imageUrl) formData.append("ImageUrl", values.imageUrl);
  formData.append("MessageAr", values.messageAr);
  formData.append("MessageEn", values.messageEn);

  const response = await axiosInstance.put(`/admin/notifications/${encodeURIComponent(templateId)}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return requireApiSuccess(response, "Failed to update notification template.");
}

export async function toggleNotificationTemplateActive(templateId) {
  if (!templateId) throw new Error("Select a notification template before changing its status.");
  const response = await axiosInstance.patch(`/admin/notifications/${encodeURIComponent(templateId)}/toggle-active`);

  return requireApiSuccess(response, "Failed to update notification template status.");
}
