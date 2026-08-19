import { z } from "zod";
import { enNameField, arNameField, isActiveField } from "../../../shared/schema/validation";

export const medicineSchema = z.object({
  enName: enNameField,
  arName: arNameField,
  medicinePrice: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && !isNaN(Number(val)), {
      message: "Please enter a valid price",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Price cannot be negative",
    })
    .refine((val) => Number(val) <= 999999, {
      message: "Price must not exceed 999,999",
    }),
  medicineForm: z
    .string()
    .min(1, "Form is required")
    .transform((val) => val.trim())
    .refine((val) => val.length >= 1, {
      message: "Form is required",
    })
    .refine((val) => !/[\u0600-\u06FF]/.test(val), {
      message: "Form must be in English only",
    })
    .refine((val) => /^[a-zA-Z0-9\s]+$/.test(val), {
      message: "Form can only contain letters and numbers",
    }),
  isActive: isActiveField,
});