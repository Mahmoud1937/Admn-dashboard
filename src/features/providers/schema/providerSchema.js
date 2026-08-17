import { z } from "zod";
import { arNameField, egyptianPhoneField, enNameField, hotLineField, isActiveField, optionalDateField, optionalIdField, requiredIdField } from "../../../shared/schema/validation";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const getProviderSchema = (isCreateMode) =>
  z.object({
    enName: enNameField,
    arName: arNameField,
    providerCategoryId: requiredIdField("Category"),
    specialistId: optionalIdField,
    hotLine: hotLineField,
    phoneNumber1: egyptianPhoneField,
    isActive: isActiveField,
    joinDate: optionalDateField,
    logoFile: isCreateMode
      ? z
          .any()
          .refine((file) => file instanceof File, {
            message: "Provider logo is required",
          })
          .refine((file) => !(file instanceof File) || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Logo must be a PNG, JPG, or WEBP image",
          })
          .refine((file) => !(file instanceof File) || file.size <= MAX_FILE_SIZE, {
            message: "Logo size can't exceed 5MB",
          })
      : z
          .any()
          .optional()
          .refine((file) => !(file instanceof File) || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Logo must be a PNG, JPG, or WEBP image",
          })
          .refine((file) => !(file instanceof File) || file.size <= MAX_FILE_SIZE, {
            message: "Logo size can't exceed 5MB",
          }),
  });