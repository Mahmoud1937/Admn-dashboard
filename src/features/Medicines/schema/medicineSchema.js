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
    .refine((val) => Number(val) > 0, {
      message: "Price must be greater than 0",
    }),
  medicineForm: z
    .string()
    .trim()
    .min(1, "Form is required"),
  isActive: isActiveField,
});