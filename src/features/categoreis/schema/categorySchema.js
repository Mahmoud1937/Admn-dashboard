import { z } from "zod";
import { arNameField, enNameField } from "../../../shared/schema/validation";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const hasValidExtension = (file) =>
  ACCEPTED_EXTENSIONS.some((ext) => file.name?.toLowerCase().endsWith(ext));

const isValidImageFile = (file) =>
  !(file instanceof File) ||
  (ACCEPTED_IMAGE_TYPES.includes(file.type) && hasValidExtension(file));

const isValidFileSize = (file) =>
  !(file instanceof File) || file.size <= MAX_FILE_SIZE;

export const getCategorySchema = (isCreateMode) =>
  z.object({
    enName: enNameField,
    arName: arNameField,
    logo: isCreateMode
      ? z
          .any()
          .refine((file) => file instanceof File, {
            message: "Logo is required.",
          })
          .refine(isValidImageFile, {
            message: "Logo must be a PNG, JPG, or WEBP image",
          })
          .refine(isValidFileSize, {
            message: "Logo size can't exceed 5MB",
          })
      : z
          .any()
          .optional()
          .refine(isValidImageFile, {
            message: "Logo must be a PNG, JPG, or WEBP image",
          })
          .refine(isValidFileSize, {
            message: "Logo size can't exceed 5MB",
          }),
  });