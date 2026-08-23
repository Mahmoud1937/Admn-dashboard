import { z } from "zod";
import { arNameField, egyptianPhoneField, enNameField, isActiveField, optionalDateField, optionalIdField, requiredIdField } from "../../../shared/schema/validation";

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

// Local to this schema: unlike the shared `hotLineField` (always required,
// exactly 5 digits), here hotLine/landline are individually optional —
// "at least one of hotLine/phoneNumber/landline" is enforced below at the
// object level instead. When filled, still must be digits-only.
const optionalDigitsField = (label, { min = 1, max = 20 } = {}) =>
  z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^[0-9]+$/.test(val), {
      message: `${label} should contain digits only`,
    })
    .refine((val) => !val || (val.length >= min && val.length <= max), {
      message: `${label} should be between ${min} and ${max} digits`,
    });

const optionalHotLineField = optionalDigitsField("Hotline", { min: 5, max: 5 });
const landlineField = optionalDigitsField("Landline", { min: 7, max: 11 });

export const getProviderSchema = (isCreateMode) =>
  z
    .object({
      enName: enNameField,
      arName: arNameField,
      providerCategoryId: requiredIdField("Category"),
      specialistId: optionalIdField,
      hotLine: optionalHotLineField,
      phoneNumber: egyptianPhoneField,
      landline: landlineField,          
      isActive: isActiveField,
      joinDate: optionalDateField,
      logoFile: isCreateMode
        ? z
            .any()
            .refine((file) => file instanceof File, {
              message: "Provider logo is required",
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
    })
    .refine(
      (data) => Boolean(data.hotLine) || Boolean(data.phoneNumber) || Boolean(data.landline),  
      {
        message: "Please provide at least one of: Hotline, Phone Number, or Landline",
        path: ["hotLine"],
      }
    );