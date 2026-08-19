import { z } from "zod";

const baseShape = {
  serviceId: z.string().min(1, "Service is required"),
  priceBefore: z
    .string()
    .min(1, "Price is required")
    .refine((v) => !isNaN(Number(v)), "Price must be a valid number")
    .refine((v) => Number(v) >= 0, "Price cannot be negative")
    .refine((v) => Number(v) <= 999999, "Price must not exceed 999,999"),
  discountPercentage: z
    .string()
    .min(1, "Discount percentage is required")
    .refine((v) => !isNaN(Number(v)), "Discount must be a valid number")
    .refine(
      (v) => Number(v) >= 0 && Number(v) <= 100,
      "Discount must be between 0 and 100"
    ),
  isSpecialOffer: z.boolean().default(false),
};

export const createProviderServiceSchema = z.object(baseShape);

export const updateProviderServiceSchema = z.object({
  ...baseShape,
  isActive: z.boolean().default(true),
});