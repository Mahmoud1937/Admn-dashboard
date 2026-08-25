import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const hasValidExtension = (file) =>
  ACCEPTED_EXTENSIONS.some((ext) => file.name?.toLowerCase().endsWith(ext));

export const imageFileSchema = z
  .instanceof(File, {
    message: "Please select an image.",
  })
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type) && hasValidExtension(file),
    "Only JPG, PNG, and WEBP images are allowed."
  )
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    "Image size must not exceed 5 MB."
  );

export const buildSliderSchema = (isEditMode) =>
  z.object({
    providerId: z.string().min(1, "Provider is required"),
  });

export const validateImages = (enFile, arFile) => {
  const imageErrors = {};

  if (enFile) {
    const enResult = imageFileSchema.safeParse(enFile);

    if (!enResult.success) {
      imageErrors.enImageFile = enResult.error.issues[0]?.message;
    }
  } else {
    imageErrors.enImageFile = "English image is required.";
  }

  if (arFile) {
    const arResult = imageFileSchema.safeParse(arFile);

    if (!arResult.success) {
      imageErrors.arImageFile = arResult.error.issues[0]?.message;
    }
  } else {
    imageErrors.arImageFile = "Arabic image is required.";
  }

  return Object.keys(imageErrors).length > 0 ? imageErrors : null;
};