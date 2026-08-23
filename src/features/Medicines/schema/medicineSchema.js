import { z } from "zod";
import { nameField, isActiveField } from "../../../shared/schema/validation";

// Local to this page only: same base rules as the shared en/ar name fields,
// but numbers are allowed alongside letters (medicine names like
// "Panadol 500" or "بانادول 500" need this, unlike provider/service names).
const medicineEnNameField = nameField("English name").regex(
  /^[a-zA-Z0-9\s()/]+$/,
  "Please use English letters and numbers only (spaces, ( ) and / are allowed)"
);

const medicineArNameField = nameField("Arabic name").regex(
  /^[\u0600-\u06FF0-9\s()/]+$/,
  "Please use Arabic letters and numbers only (spaces, ( ) and / are allowed)"
);

export const medicineSchema = z.object({
  enName: medicineEnNameField,
  arName: medicineArNameField,
  medicinePrice: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && !isNaN(Number(val)), {
      message: "Please enter a valid price",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Price cannot be negative",
    })
    .refine((val) => Number(val) <= 999999, {
      message: "Price must not exceed 999,999",
    }),
  medicineForm: z
    .string()
    .min(1, "Form is required")
    .transform((val) => val.trim())
    .refine((val) => val.length >= 1, {
      message: "Form is required",
    })
    .refine((val) => !/[\u0600-\u06FF]/.test(val), {
      message: "Form must be in English only",
    })
    .refine((val) => /^[a-zA-Z0-9\s]+$/.test(val), {
      message: "Form can only contain letters and numbers",
    }),
  isActive: isActiveField,
});