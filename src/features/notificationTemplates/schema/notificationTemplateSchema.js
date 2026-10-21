import { z } from "zod";
import { requiredIdField } from "../../../shared/schema/validation";
import { NOTIFICATION_EVENTS } from "../constants/notificationEvents";

const requiredText = (label) => z.string().refine((value) => value.trim().length > 0, `${label} is required`);

const isImageUrl = (value) => {
  if (!value) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export const notificationTemplateSchema = z.object({
  notificationEvent: requiredIdField("notification event")
    .refine((value) => NOTIFICATION_EVENTS.some((event) => event.value === Number(value)), "Select a valid notification event")
    .transform(Number),
  title: requiredText("Title"),
  imageUrl: z.string().trim().nullable().optional()
    .refine(isImageUrl, "Enter a valid URL starting with http:// or https://")
    .transform((value) => value || null),
  messageAr: requiredText("Arabic message"),
  messageEn: requiredText("English message"),
});

export const notificationTemplateUpdateSchema = notificationTemplateSchema.omit({ notificationEvent: true });
