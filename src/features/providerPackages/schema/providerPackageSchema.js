import { z } from "zod";

const requiredImage = (label) =>
  z.custom((value) => value instanceof File, `${label} is required`);

export const createProviderPackageSchema = z.object({
  nameAr: z.string().trim().min(1, "Arabic name is required"),
  nameEn: z.string().trim().min(1, "English name is required"),
  descriptionAr: z.string().trim().min(1, "Arabic description is required"),
  descriptionEn: z.string().trim().min(1, "English description is required"),
  priceBefore: z
    .string()
    .trim()
    .min(1, "Price is required")
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, {
      message: "Enter a valid non-negative price",
    }),
  discountPercentage: z
    .string()
    .trim()
    .min(1, "Discount percentage is required")
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100,
      { message: "Discount must be between 0 and 100" }
    ),
  imageAr: requiredImage("Arabic image"),
  imageEn: requiredImage("English image"),
  serviceIds: z.array(z.object({ id: z.number(), label: z.string() })).min(1, "Select at least one service"),
});

const existingImageOrFile = (label) =>
  z.custom(
    (value) => value instanceof File || (typeof value === "string" && value.length > 0),
    `${label} is required`,
  );

export const updateProviderPackageSchema = createProviderPackageSchema.extend({
  imageAr: existingImageOrFile("Arabic image"),
  imageEn: existingImageOrFile("English image"),
});

export const defaultProviderPackageValues = {
  nameAr: "",
  nameEn: "",
  descriptionAr: "",
  descriptionEn: "",
  priceBefore: "",
  discountPercentage: "",
  imageAr: null,
  imageEn: null,
  serviceIds: [],
};
