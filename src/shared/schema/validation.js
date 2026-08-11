import { z } from "zod";

const hasNoLeadingSymbols = (value) => {
  // أول 3 حروف مينفعش يبقى فيهم / ( )
  const firstThree = value.slice(0, 3);
  return !/[/()]/.test(firstThree);
};

const hasNoRepeatedSymbols = (value) => {
  // مينفعش نفس الرمز يتكرر ورا بعض: // أو (( أو ))
  return !/([/()])\1/.test(value);
};

export const nameField = (label) =>
  z
    .string()
    .trim()
    .min(3, `${label} should be at least 3 characters long`)
    .max(50, `${label} can't exceed 50 characters`)
    .regex(/^\S+( \S+)*$/, `${label} can't start with a space or contain extra spaces`)
    .refine(hasNoLeadingSymbols, {
      message: `${label} can't start with /, ( or ) within the first 3 characters`,
    })
    .refine(hasNoRepeatedSymbols, {
      message: `${label} can't contain repeated symbols like // or ))`,
    });

export const enNameField = nameField("English name").regex(
  /^[a-zA-Z\s()/]+$/,
  "Please use English letters only (spaces, ( ) and / are allowed)"
);

export const arNameField = nameField("Arabic name").regex(
  /^[\u0600-\u06FF\s()/]+$/,
  "Please use Arabic letters only (spaces, ( ) and / are allowed)"
);

export const requiredIdField = (fieldLabel) =>
  z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: `Please select a ${fieldLabel.toLowerCase()}`,
    });

export const optionalIdField = z.union([z.string(), z.number()]).nullable().optional();

export const hotLineField = z
  .string()
  .trim()
  .min(1, "Hotline number is required")
  .regex(/^[0-9]{6,20}$/, "Hotline should contain digits only (6–20 numbers)");

export const egyptianPhoneField = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (val) => !val || /^01[0125][0-9]{8}$/.test(val),
    "Please enter a valid Egyptian mobile number"
  );

export const isActiveField = z.boolean();

export const optionalDateField = z.string().optional().or(z.literal(""));