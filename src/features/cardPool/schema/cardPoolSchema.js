import { z } from "zod";

export const cardPoolSchema = z.object({
  count: z.preprocess(
    (val) => {
      // Treat empty string / NaN (from an empty number input) as "missing"
      // so we can distinguish "required" from "wrong type" below.
      if (val === "" || val === null || Number.isNaN(val)) return undefined;
      return val;
    },
    z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? "Number of cards is required"
            : "Please enter a valid number",
      })
      .int("Count must be between 1 and 10,000")
      .min(1, "Count must be between 1 and 10,000")
      .max(10000, "Count must be between 1 and 10,000")
  ),
});