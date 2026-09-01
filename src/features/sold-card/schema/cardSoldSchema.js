import { z } from "zod";

const proofPaymentField = z
  .instanceof(File, { message: "Proof of payment is required" })
  .refine((file) => file && file.size > 0, "Proof of payment is required");

const clientFields = {
  clientName: z.string().min(1, "Client name is required"),
  clientPhone: z
    .string()
    .min(1, "Client phone is required")
    .regex(/^01[0125][0-9]{8}$/, "Please enter a valid phone number"),
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
      .int("Count must be a whole number")
      .min(1, "Count must be between 1 and 10,000")
      .max(10000, "Count must be between 1 and 10,000")
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