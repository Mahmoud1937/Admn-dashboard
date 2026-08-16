import { z } from "zod";
import { arNameField, egyptianPhoneField, enNameField, hotLineField, isActiveField, optionalDateField, optionalIdField, requiredIdField } from "../../../shared/schema/validation";

export const getProviderSchema = (isCreateMode) =>
  z.object({
    enName: enNameField,
    arName: arNameField,
    providerCategoryId: requiredIdField("Category"),
    specialistId: optionalIdField,
    hotLine: hotLineField,
    phoneNumber1: egyptianPhoneField,
    isActive: isActiveField,
    joinDate: optionalDateField,
    logoFile: isCreateMode
      ? z.any().refine((file) => file instanceof File, {
          message: "Provider logo is required",
        })
      : z.any().optional(),
  });