import { z } from "zod";
import { enNameField, arNameField } from "../../../shared/schema/validation";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const hasValidExtension = (file) =>
  ACCEPTED_EXTENSIONS.some((ext) => file.name?.toLowerCase().endsWith(ext));

const isValidImageFile = (file) =>
  !(file instanceof File) ||
  (ACCEPTED_IMAGE_TYPES.includes(file.type) && hasValidExtension(file));

const isValidFileSize = (file) =>
  !(file instanceof File) || file.size <= MAX_FILE_SIZE;

export const getServiceCategorySchema = (isCreateMode) =>
  z.object({
    enName: enNameField,
    arName: arNameField,
    logo: isCreateMode
      ? z
          .any()
          .refine((file) => file instanceof File, {
            message: "Image is required.",
          })
          .refine(isValidImageFile, {
            message: "Logo must be a PNG, JPG, WEBP, or SVG image",
          })
          .refine(isValidFileSize, {
            message: "Logo size can't exceed 5MB",
          })
      : z
          .any()
          .optional()
          .refine(isValidImageFile, {
            message: "Logo must be a PNG, JPG, WEBP, or SVG image",
          })
          .refine(isValidFileSize, {
            message: "Logo size can't exceed 5MB",
          }),
  });