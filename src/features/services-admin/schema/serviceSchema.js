import z from "zod";
import { arNameField, enNameField } from "../../../shared/schema/validation";

export const serviceSchema = z.object({
  enName: enNameField,
  arName: arNameField,
  categoryId: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Category is required",
    }),
  cpt: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val.trim() : val))
    .refine((val) => !val || val.length >= 3, {
      message: "CPT code should be at least 3 characters",
    })
    .refine((val) => !val || !/[\u0600-\u06FF]/.test(val), {
      message: "CPT code must be in English only",
    })
    .refine((val) => !val || /^[a-zA-Z0-9]+$/.test(val), {
      message: "CPT code can only contain letters and numbers",
    }),
  serviceInstruction: z.string().trim().optional().or(z.literal("")),
});