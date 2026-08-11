import { z } from "zod";
import {
  enNameField,
  arNameField,
  requiredIdField,
  optionalIdField,
  hotLineField,
  egyptianPhoneField,
  isActiveField,
  optionalDateField,
} from "../../../shared/schema/validation";

export const providerSchema = z.object({
  enName: enNameField,
  arName: arNameField,
  providerCategoryId: requiredIdField("Category"),
  specialistId: optionalIdField,
  hotLine: hotLineField,
  phoneNumber1: egyptianPhoneField,
  isActive: isActiveField,
  joinDate: optionalDateField,
});