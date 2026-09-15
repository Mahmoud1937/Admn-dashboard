import { z } from "zod";
import { arNameField, enNameField } from "../../../shared/schema/validation";

export const ticketTypeSchema = z.object({
  arName: arNameField,
  enName: enNameField,
});
