import axiosInstance from "../../../shared/api/axiosInstance";
import { requireApiSuccess } from "../../../shared/helpers/apiErrorHandler";
import { getAttachmentFileError, validateAttachmentUpload } from "../utils/attachmentUpload";

export async function getProviderAttachments({ providerRenewalId, signal }) {
  const response = await axiosInstance.get(
    `/ProviderAttachmentAdmin/renewals/${encodeURIComponent(providerRenewalId)}`,
    { signal }
  );

  return requireApiSuccess(response, "Failed to load provider attachments.");
}

export async function uploadProviderAttachments({ providerRenewalId, attachments }) {
  if (!providerRenewalId) throw new Error("Select a provider renewal before uploading files.");
  const validationError = validateAttachmentUpload(attachments);
  if (validationError) throw new Error(validationError);

  const formData = new FormData();
  attachments.forEach(({ attachmentType, file }) => {
    formData.append("AttachmentTypes", String(Number(attachmentType)));
    formData.append("Files", file);
  });

  const response = await axiosInstance.post(
    `/ProviderAttachmentAdmin/${encodeURIComponent(providerRenewalId)}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return requireApiSuccess(response, "Failed to upload provider attachments.");
}

export async function updateProviderAttachment({ attachmentId, file }) {
  if (!attachmentId) throw new Error("Select an attachment before replacing its file.");
  const validationError = getAttachmentFileError(file);
  if (validationError) throw new Error(validationError);

  const formData = new FormData();
  formData.append("File", file);

  const response = await axiosInstance.put(
    `/ProviderAttachmentAdmin/${encodeURIComponent(attachmentId)}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return requireApiSuccess(response, "Failed to replace the attachment file.");
}

export async function deleteProviderAttachment(attachmentId) {
  if (!attachmentId) throw new Error("Select an attachment before deleting it.");
  const response = await axiosInstance.delete(
    `/ProviderAttachmentAdmin/${encodeURIComponent(attachmentId)}`
  );

  return requireApiSuccess(response, "Failed to delete the attachment.");
}
