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
    .refine((val) => !val || /^[0-9]+$/.test(val), {
      message: "CPT code must contain digits only",
    }),
  serviceInstruction: z.string().trim().optional().or(z.literal("")),
});