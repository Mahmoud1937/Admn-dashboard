import { z } from "zod";
import { enNameField, arNameField } from "../../../shared/schema/validation";

export const serviceSchema = z.object({
  enName: enNameField,
  arName: arNameField,
  categoryId: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Category is required",
    }),
  cpt: z.string().trim().optional().or(z.literal("")),
  serviceInstruction: z.string().trim().optional().or(z.literal("")),
});