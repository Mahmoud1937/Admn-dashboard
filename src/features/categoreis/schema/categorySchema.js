import { z } from "zod";
import { arNameField, enNameField } from "../../../shared/schema/validation";



export const categorySchema = z.object({
  enName: enNameField,
  arName: arNameField,
});