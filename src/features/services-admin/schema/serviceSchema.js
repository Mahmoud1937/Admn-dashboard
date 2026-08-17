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
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || (val.length >= 3 && val.length <= 20), {
      message: "CPT code should be between 3 and 50 characters",
    })
    .refine((val) => !val || /^[a-zA-Z0-9]+$/.test(val), {
      message: "CPT code can only contain letters and numbers",
    }),
  serviceInstruction: z.string().trim().optional().or(z.literal("")),
});