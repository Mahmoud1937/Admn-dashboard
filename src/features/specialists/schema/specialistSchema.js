import { z } from "zod";
import { enNameField, arNameField } from "../../../shared/schema/validation";

export const specialistSchema = z.object({
  enName: enNameField,
  arName: arNameField,
});