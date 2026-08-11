import { z } from "zod";
import { enNameField, arNameField } from "../../../shared/schema/validation";

export const serviceCategorySchema = z.object({
  enName: enNameField,
  arName: arNameField,
});