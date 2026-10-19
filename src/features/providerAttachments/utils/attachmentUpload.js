export const ATTACHMENT_TYPES = [
  { value: 1, label: "Contract" },
  { value: 2, label: "Additional contract" },
  { value: 3, label: "Price list" },
  { value: 4, label: "Commercial register" },
  { value: 5, label: "Tax card" },
  { value: 6, label: "Other" },
];

export const ATTACHMENT_TYPE_LABELS = Object.fromEntries(
  ATTACHMENT_TYPES.map(({ value, label }) => [value, label])
);

export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
export const ATTACHMENT_FILE_ACCEPT = "image/*,.pdf,.xls,.xlsx";

export const isAttachmentType = (type) => ATTACHMENT_TYPES.some(({ value }) => value === Number(type));

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "tif", "tiff",
  "avif", "heic", "heif", "ico", "jfif",
]);
const EXCEL_MIME_TYPES = new Set([
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export function getAttachmentFileError(file) {
  if (!(file instanceof File)) return "Select a file to upload.";
  if (file.size === 0) return `"${file.name}" is empty. Choose a non-empty file.`;
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return `"${file.name}" exceeds the 5 MB limit per file.`;
  }

  const extension = file.name.split(".").pop().toLowerCase();
  const mimeType = file.type.toLowerCase();
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf" && extension === "pdf";
  const isExcel = EXCEL_MIME_TYPES.has(mimeType) && ["xls", "xlsx"].includes(extension);
  const isGenericType = !mimeType || mimeType === "application/octet-stream";
  const hasAllowedExtension = IMAGE_EXTENSIONS.has(extension)
    || ["pdf", "xls", "xlsx"].includes(extension);

  if (!isImage && !isPdf && !isExcel && !(isGenericType && hasAllowedExtension)) {
    return `"${file.name}" must be an image, PDF, or Excel (.xls, .xlsx) file.`;
  }
  return null;
}

export function validateAttachmentUpload(attachments) {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return "Select at least one file to upload.";
  }
  for (const attachment of attachments) {
    const fileError = getAttachmentFileError(attachment.file);
    if (fileError) return fileError;
    if (!isAttachmentType(attachment.attachmentType)) {
      return `Choose an attachment type for "${attachment.file.name}".`;
    }
  }
  return null;
}
