import { z } from "zod";
import { egyptianPhoneField } from "../../../shared/schema/validation";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const hasValidExtension = (file) =>
  ACCEPTED_EXTENSIONS.some((ext) => file.name?.toLowerCase().endsWith(ext));

const proofPaymentField = z
  .instanceof(File, { message: "Proof of payment is required" })
  .refine((file) => file && file.size > 0, "Proof of payment is required")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type) && hasValidExtension(file),
    "Only JPG, PNG, and WEBP images are allowed."
  )
  .refine((file) => file.size <= MAX_FILE_SIZE, "Image size must not exceed 5 MB.");

const clientFields = {
  clientName: z
    .string()
    .min(1, "Client name is required")
    .min(2, "Client name must be at least 2 characters")
    .max(30, "Client name must not exceed 30 characters")
    .regex(/^[^\d]+$/, "Client name must not contain numbers"),
  clientPhone: egyptianPhoneField.refine((val) => !!val, "Client phone is required"),
  proofPayment: proofPaymentField,
};

const byCountSchema = z.object({
  mode: z.literal("count"),
 count: z.preprocess(
  (val) => (val === "" || val === null || Number.isNaN(val) ? undefined : val),
  z
    .number({
      error: (issue) =>
        issue.input === undefined ? "Count is required" : "Please enter a valid number",
    })
    .max(10000, "Count must be between 1 and 10,000")
    .min(1, "Count must be between 1 and 10,000")
    .int("Count must be between 1 and 10,000")
),
  ...clientFields,
});

const byNumbersSchema = z.object({
  mode: z.literal("numbers"),
  cardNumbers: z
    .array(
      z.object({
        value: z
          .string()
          .min(1, "Card number is required")
          .regex(/^\d{12}$/, "Must be exactly 12 digits"),
      })
    )
    .min(1, "Enter at least one card number"),
  ...clientFields,
});

export const cardSoldSchema = z.discriminatedUnion("mode", [byCountSchema, byNumbersSchema]);