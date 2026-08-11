import { z } from "zod";
import { arNameField, enNameField, requiredIdField } from "../../../shared/schema/validation";


export const citySchema = z.object({
  enName: enNameField,
  arName: arNameField,
  governorateId: requiredIdField("Governorate"),
});