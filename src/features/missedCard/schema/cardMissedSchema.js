import { z } from "zod";

export const cardMissedSchema = z.object({
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .regex(/^\d{12}$/, "Must be exactly 12 digits"),
  missingType: z.preprocess(
    (val) => (val === "" || val === null || Number.isNaN(val) ? undefined : val),
    z.number({
      error: (issue) =>
        issue.input === undefined ? "Type is required" : "Please select a valid type",
    })
  ),
});