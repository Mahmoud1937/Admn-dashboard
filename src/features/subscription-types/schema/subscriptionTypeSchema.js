import { z } from "zod";
import { arNameField, enNameField } from "../../../shared/schema/validation";

export const subscriptionTypeSchema = z.object({
  nameAr: arNameField,
  nameEn: enNameField,
  priceBefore: z
    .string()
    .min(1, "Price before is required")
    .refine((value) => !Number.isNaN(Number(value)), "Price before must be a valid number")
    .refine((value) => Number(value) > 0, "Price before must be greater than 0"),
  discountPercentage: z
    .string()
    .min(1, "Discount percentage is required")
    .refine((value) => !Number.isNaN(Number(value)), "Discount must be a valid number")
    .refine(
      (value) => Number(value) > 0 && Number(value) <= 100,
      "Discount must be between 1 and 100"
    ),
  descriptionAr: z.string().trim().min(1, "Arabic description is required"),
  descriptionEn: z.string().trim().min(1, "English description is required"),
});
