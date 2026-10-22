import { z } from "zod";
import { requiredIdField } from "../../../shared/schema/validation";
import { NOTIFICATION_EVENTS } from "../constants/notificationEvents";
import { imageFileSchema } from "../../offer-sliders/schema/sliderSchema";

const requiredText = (label) => z.string().refine((value) => value.trim().length > 0, `${label} is required`);

export const notificationTemplateSchema = z.object({
  notificationEvent: requiredIdField("notification event")
    .refine((value) => NOTIFICATION_EVENTS.some((event) => event.value === Number(value)), "Select a valid notification event")
    .transform(Number),
  title: requiredText("Title"),
  imageUrl: imageFileSchema.nullable().optional(),
  messageAr: requiredText("Arabic message"),
  messageEn: requiredText("English message"),
});

export const notificationTemplateUpdateSchema = notificationTemplateSchema.omit({ notificationEvent: true });
