// schema/contactUsSchema.js
import { z } from "zod";
// TODO: move this to shared/schema/validation once you're ready — no emailField
// exists there yet, so it's defined locally here for now.
const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email");

// Phone number and WhatsApp are required on this form.
const requiredEgyptianPhoneField = z
  .string()
  .trim()
  .min(1, "This field is required")
  .regex(/^01[0125][0-9]{8}$/, "Please enter a valid Egyptian mobile number");

const socialUrlField = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .optional()
  .or(z.literal(""));

export const contactUsSchema = z.object({
  phoneNumber: requiredEgyptianPhoneField,
  email: emailField,
  whatsApp: requiredEgyptianPhoneField,
  faceBook: socialUrlField,
  instagram: socialUrlField,
  tikTok: socialUrlField,
});
