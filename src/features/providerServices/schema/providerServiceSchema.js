import { z } from "zod";

const baseShape = {
  serviceId: z.string().min(1, "Service is required"),
  priceBefore: z
    .string()
    .min(1, "Price is required")
    .refine((v) => Number(v) > 0, "Price must be greater than 0"),
  discountPercentage: z
    .string()
    .optional()
    .refine(
      (v) => !v || (Number(v) >= 0 && Number(v) <= 100),
      "Discount must be between 0 and 100"
    ),
  isSpecialOffer: z.boolean().default(false),
};

export const createProviderServiceSchema = z.object(baseShape);

export const updateProviderServiceSchema = z.object({
  ...baseShape,
  isActive: z.boolean().default(true),
});